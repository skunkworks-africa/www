import { app } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const tenant = '338a8916-80d9-467c-a94a-7f61d04ef7d5';
const jwks = createRemoteJWKSet(new URL('https://login.microsoftonline.com/' + tenant + '/discovery/v2.0/keys'));
const credential = new DefaultAzureCredential({ managedIdentityClientId: process.env.AZURE_CLIENT_ID });
const json = (status, body) => ({ status, jsonBody: body, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Type': 'application/json' } });
const error = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
const result = (id, data) => ({ jsonrpc: '2.0', id, result: data });
const tools = [
  { name: 'get_resource_group', description: 'Read metadata of the designated Skunkworks resource group only.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'list_resources', description: 'Read up to 100 resources in the designated Skunkworks resource group.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }
];

async function authorize(request) {
  const aud = process.env.AZURE_OPERATOR_API_AUDIENCE;
  const allowed = (process.env.AZURE_OPERATOR_ALLOWED_USER_OIDS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const sub = process.env.AZURE_SUBSCRIPTION_ID;
  const rg = process.env.AZURE_RESOURCE_GROUP;
  if (!aud || !allowed.length || !sub || !rg || !process.env.AZURE_CLIENT_ID) return { status: 503, message: 'Gateway not configured' };
  const header = request.headers.get('authorization') || '';
  if (!/^Bearer [^\s]+$/.test(header)) return { status: 401, message: 'Bearer access token required' };
  let claims;
  try {
    ({ payload: claims } = await jwtVerify(header.slice(7), jwks, { audience: aud, issuer: 'https://login.microsoftonline.com/' + tenant + '/v2.0', clockTolerance: 30 }));
  } catch { return { status: 401, message: 'Invalid token' }; }
  if (claims.tid !== tenant || !allowed.includes(String(claims.oid || '').toLowerCase())) return { status: 403, message: 'Not authorised' };
  const scopes = String(claims.scp || '').split(' ');
  if (!scopes.includes('Azure.Read') && !scopes.includes('Azure.Manage')) return { status: 403, message: 'Missing delegated scope' };
  return { status: 200, sub, rg };
}

async function readAzure(sub, rg, kind) {
  const path = '/subscriptions/' + encodeURIComponent(sub) + '/resourceGroups/' + encodeURIComponent(rg);
  const endpoint = 'https://management.azure.com' + path + (kind === 'group' ? '?api-version=2021-04-01' : '/resources?api-version=2021-04-01');
  const token = await credential.getToken('https://management.azure.com/.default');
  if (!token) throw new Error('Managed identity unavailable');
  const response = await fetch(endpoint, { headers: { Authorization: 'Bearer ' + token.token, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Azure Resource Manager request failed: ' + response.status);
  const body = await response.json();
  if (kind === 'group') return { id: body.id, name: body.name, location: body.location, tags: body.tags || {} };
  return { resources: (body.value || []).slice(0, 100).map(x => ({ id: x.id, name: x.name, type: x.type, location: x.location })), truncated: Boolean(body.nextLink) || (body.value || []).length > 100 };
}

export async function mcpHandler(request, context) {
  if (request.method === 'GET') return json(405, { error: 'Only JSON-RPC POST supported' });
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  const auth = await authorize(request);
  if (auth.status !== 200) return json(auth.status, { error: auth.message });
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) return json(415, { error: 'Content-Type must be application/json' });
  let data;
  try { data = await request.json(); } catch { return json(400, error(null, -32700, 'Parse error')); }
  if (!data || Array.isArray(data) || typeof data !== 'object' || data.jsonrpc !== '2.0' || typeof data.method !== 'string') return json(400, error(data?.id ?? null, -32600, 'Invalid Request'));
  if (data.method === 'notifications/initialized') return { status: 202 };
  const id = data.id ?? null;
  if (id === null) return json(400, error(null, -32600, 'Request id required'));
  if (data.method === 'initialize') return json(200, result(id, { protocolVersion: '2025-03-26', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'skunkworks-azure-operator', version: '0.1.0' } }));
  if (data.method === 'ping') return json(200, result(id, {}));
  if (data.method === 'tools/list') return json(200, result(id, { tools }));
  if (data.method === 'tools/call') {
    const name = data.params?.name;
    if (!['get_resource_group', 'list_resources'].includes(name) || (data.params?.arguments && Object.keys(data.params.arguments).length)) return json(200, error(id, -32602, 'Unsupported tool or arguments'));
    try {
      const output = await readAzure(auth.sub, auth.rg, name === 'get_resource_group' ? 'group' : 'resources');
      return json(200, result(id, { content: [{ type: 'text', text: JSON.stringify(output) }] }));
    } catch (e) {
      context.error('MCP Azure read failed: ' + e.message);
      return json(200, result(id, { content: [{ type: 'text', text: 'Azure inventory unavailable. Check managed identity permissions and diagnostics.' }], isError: true }));
    }
  }
  return json(200, error(id, -32601, 'Method not found'));
}
app.http('operator-mcp', { methods: ['GET', 'POST'], authLevel: 'anonymous', route: 'mcp', handler: mcpHandler });
