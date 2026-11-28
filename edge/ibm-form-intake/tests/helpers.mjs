export const origin = 'https://forms.example.test';
export const key = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
export const env = {
  IBM_INTAKE_ENABLED: 'true',
  IBM_GATEWAY_TENANT_ID: '11111111-1111-4111-8111-111111111111',
  IBM_GATEWAY_CLIENT_ID: '22222222-2222-4222-8222-222222222222',
  IBM_GATEWAY_OBJECT_ID: '33333333-3333-4333-8333-333333333333',
  IBM_INTAKE_API_AUDIENCE: '44444444-4444-4444-8444-444444444444',
  IBM_PRIVACY_VERSION: 'synthetic-review-v1',
  IBM_ALLOWED_ORIGINS: origin,
  IBM_DATAVERSE_URL: 'https://synthetic.crm14.dynamics.com',
  IBM_DATAVERSE_ENTITY_SET: 'synthetic_ibmassessments',
  IBM_DATAVERSE_REFERENCE_COLUMN: 'synthetic_reference',
  IBM_DATAVERSE_DIGEST_COLUMN: 'synthetic_digest',
  IBM_DATAVERSE_PAYLOAD_COLUMN: 'synthetic_payload',
  IBM_DATAVERSE_RECEIVED_COLUMN: 'synthetic_receivedat'
};
export const valid = () => ({
  schemaVersion: '1', formId: 'ibm-storage-protect', language: 'en-ZA',
  privacy: {version: env.IBM_PRIVACY_VERSION, acknowledged: true},
  fields: {legalCompanyName: 'Synthetic Company', contactName: 'Synthetic Contact', businessEmail: 'test@example.com', accuracyConfirmed: true}
});
export function request({method = 'POST', headers = {}, body = JSON.stringify(valid()), chunks} = {}) {
  return {
    method,
    headers: new Headers({Origin: origin, 'Content-Type': 'application/json', Authorization: 'Bearer synthetic-not-a-real-token', 'Idempotency-Key': key, ...headers}),
    body: (async function* () { for (const chunk of chunks ?? [Buffer.from(body)]) yield chunk; })()
  };
}
