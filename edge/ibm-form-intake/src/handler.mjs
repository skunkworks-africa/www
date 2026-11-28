import {createHash} from 'node:crypto';
import {MAX_REQUEST_BYTES, UUID_V4} from './config.mjs';
import {ContractError, validateSubmission} from './contract.mjs';
import {IdempotencyConflict} from './dataverse-store.mjs';

class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function readJson(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') || '')) throw new RequestError(415, 'UTF-8 JSON is required');
  if (!['', 'identity'].includes((request.headers.get('content-encoding') || '').toLowerCase())) throw new RequestError(415, 'Compressed requests are not supported');
  const length = request.headers.get('content-length');
  if (length !== null && !/^\d+$/.test(length)) throw new RequestError(400, 'Invalid Content-Length');
  if (length !== null && Number(length) > MAX_REQUEST_BYTES) throw new RequestError(413, 'Request is too large');
  if (!request.body) throw new RequestError(400, 'A request body is required');
  let size = 0;
  const chunks = [];
  for await (const chunk of request.body) {
    size += chunk.byteLength;
    if (size > MAX_REQUEST_BYTES) throw new RequestError(413, 'Request is too large');
    chunks.push(Buffer.from(chunk));
  }
  if (length !== null && Number(length) !== size) throw new RequestError(400, 'Content-Length does not match the body');
  try { return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(Buffer.concat(chunks))); }
  catch { throw new RequestError(400, 'Invalid JSON'); }
}

export function createHandler({config, verifyGateway, persist}) {
  return async request => {
    const headers = {'Cache-Control': 'no-store', 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin'};
    const response = (status, jsonBody, extra = {}) => ({status, headers: {...headers, ...extra}, ...(jsonBody === undefined ? {} : {jsonBody})});
    if (!config) return response(503, {error: 'Online submission is not enabled'});
    const origin = request.headers.get('origin');
    if (!config.allowedOrigins.has(origin)) return response(403, {error: 'Origin is not permitted'});
    headers['Access-Control-Allow-Origin'] = origin;
    if (request.method === 'OPTIONS') {
      const requestedHeaders = (request.headers.get('access-control-request-headers') || '').toLowerCase().split(',').map(value => value.trim()).filter(Boolean);
      if (request.headers.get('access-control-request-method') !== 'POST' || requestedHeaders.some(value => !['content-type', 'idempotency-key'].includes(value))) return response(403, {error: 'Preflight is not permitted'});
      return response(204, undefined, {'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key', 'Access-Control-Max-Age': '300'});
    }
    if (request.method !== 'POST') return response(405, {error: 'Method is not permitted'}, {Allow: 'POST, OPTIONS'});
    const bearer = /^Bearer ([^\s]+)$/i.exec(request.headers.get('authorization') || '')?.[1];
    if (!bearer || bearer.length > 8192) return response(401, {error: 'Gateway authentication is required'});
    try { await verifyGateway(bearer); } catch { return response(401, {error: 'Gateway authentication failed'}); }
    const key = request.headers.get('idempotency-key');
    if (!key || !UUID_V4.test(key)) return response(400, {error: 'A random UUID v4 Idempotency-Key is required'});
    try {
      const input = await readJson(request);
      const payload = validateSubmission(input, {privacyVersion: config.privacyVersion});
      const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      const receipt = await persist({key: key.toLowerCase(), digest, payload});
      return response(receipt.duplicate ? 200 : 201, {reference: receipt.reference, received: true, duplicate: receipt.duplicate});
    } catch (error) {
      if (error instanceof ContractError) return response(400, {error: 'Check the submitted answers', fieldErrors: error.fieldErrors});
      if (error instanceof RequestError || error instanceof IdempotencyConflict) return response(error.status, {error: error.message});
      // Do not expose Dataverse responses, tokens, record content or infrastructure details.
      return response(503, {error: 'Submission could not be confirmed. Retry with the same submission key.'}, {'Retry-After': '30'});
    }
  };
}
