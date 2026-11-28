import test from 'node:test';
import assert from 'node:assert/strict';
import {loadConfig} from '../src/config.mjs';
import {createDataverseStore, IdempotencyConflict, StoreUnavailable} from '../src/dataverse-store.mjs';
import {env, key, valid} from './helpers.mjs';

const config = loadConfig(env).dataverse;
const digest = 'a'.repeat(64);
const payload = valid();
function harness({patchStatus, getStatus, tokenFailure, transportFailure} = {}) {
  const records = new Map();
  const requests = [];
  const scopes = [];
  const credential = {getToken: async scope => {scopes.push(scope); if (tokenFailure) throw new Error('token failure'); return {token: 'synthetic-token'};}};
  const fetchImpl = async (url, init) => {
    requests.push({url, init});
    if (transportFailure) throw new Error('transport failure');
    if (init.method === 'PATCH') {
      assert.equal(init.headers['If-None-Match'], '*');
      if (patchStatus) return new Response(null, {status: patchStatus});
      if (records.has(url)) return new Response(null, {status: 412});
      records.set(url, JSON.parse(init.body));
      return new Response(null, {status: 204});
    }
    if (getStatus) return new Response(null, {status: getStatus});
    const record = records.get(url.split('?')[0]);
    return new Response(JSON.stringify({[config.columns.digest]: record[config.columns.digest], [config.columns.reference]: record[config.columns.reference]}));
  };
  return {store: createDataverseStore(config, {credential, fetchImpl, now: () => '2026-11-27T08:50:00.000Z'}), records, requests, scopes};
}

test('creates one private Dataverse record with managed identity and no redirects', async () => {
  const {store, requests, scopes, records} = harness();
  const receipt = await store({key, digest, payload});
  assert.equal(receipt.duplicate, false);
  assert.equal(receipt.reference, `IBM-${key.toUpperCase()}`);
  assert.deepEqual(scopes, [`${config.origin}/.default`]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.redirect, 'error');
  assert.equal(requests[0].init.headers.Authorization, 'Bearer synthetic-token');
  const record = [...records.values()][0];
  assert.equal(record[config.columns.digest], digest);
  assert.deepEqual(JSON.parse(record[config.columns.payload]), payload);
});

test('concurrent retries create one record and return the same reference', async () => {
  const {store, records, requests} = harness();
  const receipts = await Promise.all([store({key, digest, payload}), store({key, digest, payload}), store({key, digest, payload})]);
  assert.equal(records.size, 1);
  assert.equal(receipts.filter(value => !value.duplicate).length, 1);
  assert.equal(new Set(receipts.map(value => value.reference)).size, 1);
  for (const {url} of requests.filter(value => value.init.method === 'GET')) {
    assert.ok(url.endsWith(`?$select=${config.columns.digest},${config.columns.reference}`));
    assert.ok(!url.includes(config.columns.payload));
  }
});

test('the same key with different answers returns conflict and preserves the original record', async () => {
  const {store, records} = harness();
  await store({key, digest, payload});
  const before = structuredClone([...records.values()]);
  await assert.rejects(() => store({key, digest: 'b'.repeat(64), payload: {...payload, language: 'fr'}}), IdempotencyConflict);
  assert.deepEqual([...records.values()], before);
});

test('unavailable identity, Dataverse throttling, unexpected update and network failures never report success', async () => {
  for (const settings of [{tokenFailure: true}, {transportFailure: true}, {patchStatus: 429}, {patchStatus: 200}, {patchStatus: 500}, {patchStatus: 412, getStatus: 404}]) {
    const {store} = harness(settings);
    await assert.rejects(() => store({key, digest, payload}), StoreUnavailable);
  }
});
