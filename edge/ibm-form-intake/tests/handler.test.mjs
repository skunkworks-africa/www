import test from 'node:test';
import assert from 'node:assert/strict';
import {loadConfig, MAX_REQUEST_BYTES} from '../src/config.mjs';
import {createHandler} from '../src/handler.mjs';
import {IdempotencyConflict} from '../src/dataverse-store.mjs';
import {env, key, origin, request, valid} from './helpers.mjs';

function harness(overrides = {}) {
  const calls = [];
  const handler = createHandler({config: loadConfig(env), verifyGateway: async token => calls.push({verify: token}), persist: async data => {calls.push({persist: data}); return {reference: 'IBM-SYNTHETIC', duplicate: false};}, ...overrides});
  return {handler, calls};
}

test('disabled intake cannot authenticate, parse or persist anything', async () => {
  const {handler, calls} = harness({config: null});
  assert.equal((await handler(request())).status, 503);
  assert.deepEqual(calls, []);
});

test('exact origin restriction blocks absent, suffix and null origins before all downstream work', async () => {
  for (const value of ['', 'null', `${origin}.evil.example`, `${origin}/`]) {
    const {handler, calls} = harness();
    const response = await handler(request({headers: {Origin: value}}));
    assert.equal(response.status, 403);
    assert.equal(response.headers['Access-Control-Allow-Origin'], undefined);
    assert.deepEqual(calls, []);
  }
});

test('CORS preflight allows only the documented method and headers without storage work', async () => {
  const {handler, calls} = harness();
  const allowed = await handler(request({method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type, idempotency-key'}}));
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers['Access-Control-Allow-Origin'], origin);
  assert.equal((await handler(request({method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'GET'}}))).status, 403);
  assert.equal((await handler(request({method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization'}}))).status, 403);
  assert.equal((await handler(request({method: 'GET'}))).status, 405);
  assert.deepEqual(calls, []);
});

test('a direct browser request or invalid gateway token never consumes or saves the body', async () => {
  const {handler, calls} = harness();
  assert.equal((await handler(request({headers: {Authorization: ''}}))).status, 401);
  assert.deepEqual(calls, []);
  const {handler: denied, calls: deniedCalls} = harness({verifyGateway: async () => {throw new Error('invalid');}});
  assert.equal((await denied(request())).status, 401);
  assert.deepEqual(deniedCalls, []);
});

test('rejects malformed or non-random idempotency identifiers', async () => {
  const {handler, calls} = harness();
  for (const value of ['', 'hello', '00000000-0000-0000-0000-000000000000', 'cccccccc-cccc-1ccc-8ccc-cccccccccccc']) {
    assert.equal((await handler(request({headers: {'Idempotency-Key': value}}))).status, 400);
  }
  assert.equal(calls.filter(call => call.persist).length, 0);
});

test('counts streamed bytes and does not trust missing or understated Content-Length', async () => {
  const {handler, calls} = harness();
  const chunks = [Buffer.alloc(MAX_REQUEST_BYTES), Buffer.from('x')];
  assert.equal((await handler(request({chunks}))).status, 413);
  assert.equal((await handler(request({chunks, headers: {'Content-Length': '1'}}))).status, 413);
  assert.equal((await handler(request({headers: {'Content-Length': String(MAX_REQUEST_BYTES + 1)}}))).status, 413);
  assert.equal((await handler(request({headers: {'Content-Length': '1'}}))).status, 400);
  assert.equal(calls.filter(call => call.persist).length, 0);
});

test('rejects invalid JSON, UTF-8, compressed inputs and unrecognised fields', async () => {
  const {handler, calls} = harness();
  assert.equal((await handler(request({body: '{'}))).status, 400);
  assert.equal((await handler(request({chunks: [Buffer.from([0xff])]}))).status, 400);
  assert.equal((await handler(request({headers: {'Content-Type': 'text/plain'}}))).status, 415);
  assert.equal((await handler(request({headers: {'Content-Encoding': 'gzip'}}))).status, 415);
  const invalid = valid(); invalid.fields.credential = 'NEVER-ECHO-THIS';
  const response = await handler(request({body: JSON.stringify(invalid)}));
  assert.equal(response.status, 400);
  assert.ok(!JSON.stringify(response).includes('NEVER-ECHO-THIS'));
  assert.equal(calls.filter(call => call.persist).length, 0);
});

test('requires the separately reviewed online privacy acknowledgement', async () => {
  const {handler, calls} = harness();
  const payload = valid(); payload.privacy = {version: 'preview-local-only', acknowledged: true};
  assert.equal((await handler(request({body: JSON.stringify(payload)}))).status, 400);
  assert.equal(calls.filter(call => call.persist).length, 0);
});

test('successful receipt returns no customer fields and passes canonical payload to persistence', async () => {
  const {handler, calls} = harness();
  const response = await handler(request());
  assert.equal(response.status, 201);
  assert.deepEqual(response.jsonBody, {reference: 'IBM-SYNTHETIC', received: true, duplicate: false});
  assert.equal(response.headers['Cache-Control'], 'no-store');
  const saved = calls.find(call => call.persist).persist;
  assert.equal(saved.key, key);
  assert.match(saved.digest, /^[a-f0-9]{64}$/);
  assert.deepEqual(saved.payload, valid());
  const reordered = {...valid(), fields: Object.fromEntries(Object.entries(valid().fields).reverse())};
  await handler(request({body: JSON.stringify(reordered)}));
  assert.equal(calls.filter(call => call.persist)[1].persist.digest, saved.digest);
});

test('duplicates, conflicts and ambiguous storage failure remain distinguishable without leaking internals', async () => {
  const duplicate = harness({persist: async () => ({reference: 'IBM-SYNTHETIC', duplicate: true})});
  assert.equal((await duplicate.handler(request())).status, 200);
  const conflict = harness({persist: async () => {throw new IdempotencyConflict();}});
  assert.equal((await conflict.handler(request())).status, 409);
  const failed = harness({persist: async () => {throw new Error('SECRET-TOKEN-and-private-record');}});
  const response = await failed.handler(request());
  assert.equal(response.status, 503);
  assert.ok(!JSON.stringify(response).includes('SECRET'));
  assert.match(response.jsonBody.error, /same submission key/);
});
