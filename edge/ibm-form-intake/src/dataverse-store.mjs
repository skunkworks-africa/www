import {UUID_V4} from './config.mjs';

export class StoreUnavailable extends Error {
  constructor() { super('Submission storage is unavailable'); this.status = 503; }
}
export class IdempotencyConflict extends Error {
  constructor() { super('This submission key has already been used for different answers'); this.status = 409; }
}

export function createDataverseStore({origin, entitySet, columns}, {credential, fetchImpl = fetch, now = () => new Date().toISOString()} = {}) {
  return async ({key, digest, payload}) => {
    if (!UUID_V4.test(key) || !/^[a-f0-9]{64}$/.test(digest)) throw new StoreUnavailable();
    const recordId = key.toLowerCase();
    const reference = `IBM-${recordId.toUpperCase()}`;
    const recordUrl = `${origin}/api/data/v9.2/${entitySet}(${recordId})`;
    let access;
    try { access = await credential.getToken(`${origin}/.default`); } catch { throw new StoreUnavailable(); }
    if (!access?.token) throw new StoreUnavailable();
    const headers = {
      Authorization: `Bearer ${access.token}`, Accept: 'application/json',
      'Content-Type': 'application/json', 'OData-MaxVersion': '4.0', 'OData-Version': '4.0'
    };
    const request = async (url, init) => {
      try { return await fetchImpl(url, {...init, redirect: 'error', signal: AbortSignal.timeout(12000)}); }
      catch { throw new StoreUnavailable(); }
    };
    const response = await request(recordUrl, {
      method: 'PATCH', headers: {...headers, 'If-None-Match': '*'},
      body: JSON.stringify({
        [columns.reference]: reference, [columns.digest]: digest,
        [columns.payload]: JSON.stringify(payload), [columns.receivedAt]: now()
      })
    });
    if (response.status === 201 || response.status === 204) return {reference, duplicate: false};
    // Conditional creation makes a retry atomic across Function instances. Never update
    // an existing submission, even after an ambiguous timeout or concurrent retry.
    if (response.status !== 412) throw new StoreUnavailable();
    const existing = await request(`${recordUrl}?$select=${columns.digest},${columns.reference}`, {method: 'GET', headers});
    if (!existing.ok) throw new StoreUnavailable();
    let record;
    try { record = await existing.json(); } catch { throw new StoreUnavailable(); }
    if (record[columns.digest] !== digest) throw new IdempotencyConflict();
    if (record[columns.reference] !== reference) throw new StoreUnavailable();
    return {reference, duplicate: true};
  };
}
