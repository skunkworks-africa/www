export const MAX_REQUEST_BYTES = 128 * 1024;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const logicalName = /^[a-z][a-z0-9_]{0,99}$/;

export class ConfigurationError extends Error {
  constructor() { super('IBM intake configuration is incomplete or invalid'); }
}

function checked(value, predicate) {
  if (typeof value !== 'string' || !predicate(value)) throw new ConfigurationError();
  return value;
}

// These settings are deliberately independent of the operator/reseller applications.
// Setting the feature flag does not itself prove the external release checks passed.
export function loadConfig(env = process.env) {
  if (env.IBM_INTAKE_ENABLED !== 'true') return null;
  const tenant = checked(env.IBM_GATEWAY_TENANT_ID, value => UUID.test(value)).toLowerCase();
  const clientId = checked(env.IBM_GATEWAY_CLIENT_ID, value => UUID.test(value)).toLowerCase();
  const objectId = checked(env.IBM_GATEWAY_OBJECT_ID, value => UUID.test(value)).toLowerCase();
  const audience = checked(env.IBM_INTAKE_API_AUDIENCE, value => UUID.test(value) || (value.startsWith('api://') && UUID.test(value.slice(6))));
  const privacyVersion = checked(env.IBM_PRIVACY_VERSION, value => /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(value));
  const origins = checked(env.IBM_ALLOWED_ORIGINS, value => value.length > 0 && value.length <= 2048).split(',').map(value => value.trim());
  for (const origin of origins) {
    let parsed;
    try { parsed = new URL(origin); } catch { throw new ConfigurationError(); }
    if (parsed.protocol !== 'https:' || parsed.origin !== origin || parsed.username || parsed.password || parsed.port) throw new ConfigurationError();
  }
  const origin = checked(env.IBM_DATAVERSE_URL, value => /^https:\/\/[a-z0-9][a-z0-9-]*\.crm\d{0,2}\.dynamics\.com$/.test(value));
  const entitySet = checked(env.IBM_DATAVERSE_ENTITY_SET, value => logicalName.test(value));
  const columns = {
    reference: checked(env.IBM_DATAVERSE_REFERENCE_COLUMN, value => logicalName.test(value)),
    digest: checked(env.IBM_DATAVERSE_DIGEST_COLUMN, value => logicalName.test(value)),
    payload: checked(env.IBM_DATAVERSE_PAYLOAD_COLUMN, value => logicalName.test(value)),
    receivedAt: checked(env.IBM_DATAVERSE_RECEIVED_COLUMN, value => logicalName.test(value))
  };
  if (new Set(Object.values(columns)).size !== 4) throw new ConfigurationError();
  const managedIdentityClientId = env.IBM_MANAGED_IDENTITY_CLIENT_ID;
  if (managedIdentityClientId && !UUID.test(managedIdentityClientId)) throw new ConfigurationError();
  return {
    privacyVersion, allowedOrigins: new Set(origins),
    gateway: { tenant, clientId, objectId, audience },
    dataverse: { origin, entitySet, columns },
    managedIdentityClientId
  };
}
