# IBM assessment intake — isolated implementation draft

Status: implemented source and local synthetic tests; **not deployed or connected to the public form**. No Azure account, subscription, tenant, region, hosting plan, app registration or Dataverse table is selected by this package. The existing `/forms/ibm/storage-protect/` page still downloads responses locally and sends no requests to this service.

This is a dedicated Azure Functions v4 / Node.js package, independent of the Azure Operator and reseller services. It exposes `POST /api/forms/ibm/storage-protect` and an exact-origin CORS preflight. The default state is disabled (`503`). There is no public read/list/update/delete API, email dispatch, document upload, IBM order submission, or payment operation.

## Data flow and trust boundaries

The intended public ingress is an Azure API Management (APIM) operation with per-client and overall rate controls. APIM replaces the caller's `Authorization` header with a managed-identity access token for a **dedicated IBM backend API**. The Function checks the signature, issuer, audience, tenant, gateway application ID and service-principal object ID before parsing a submission. Delegated user tokens, including operator/reseller tokens, are rejected. Customer Microsoft sign-in is not implicitly required by this design.

The Function uses a **separate runtime managed identity** registered as an application user in the verified Dataverse environment. It stores the validated assessment in a private, dedicated standard Dataverse table. Azure administrator login, gateway identity, runtime identity and deployment identity are different roles; one successful sign-in does not establish all of them.

`Origin` is an exact browser-origin restriction, not user authentication. A non-browser client can forge it. The trusted gateway and its deployed abuse controls are therefore required. The supplied APIM policy is a configuration template and has not been applied or tested on a gateway. It requires a compatible tier; `rate-limit-by-key` and `quota-by-key` are unavailable on APIM Consumption. Establish the actual service/cost choice before provisioning. Distributed rate counters are not a guarantee of exact spend limits.

## Contract and validation

`src/contract.mjs` defines all 72 existing form rows: 71 named business/technical fields and one **excluded preview-only privacy acknowledgement**. The API does not accept `q0`, `q1`, or other positional fields. `mapLegacyFormData` is a migration adapter for the existing form and requires a separately supplied online privacy acknowledgement. It is not loaded by the public page.

The request envelope is:

```json
{
  "schemaVersion": "1",
  "formId": "ibm-storage-protect",
  "language": "en-ZA",
  "privacy": { "version": "REVIEWED_VERSION", "acknowledged": true },
  "fields": {
    "legalCompanyName": "Example Company",
    "contactName": "Example Contact",
    "businessEmail": "contact@example.com",
    "accuracyConfirmed": true
  }
}
```

The example version is not approved privacy wording and must not be deployed as a legal notice. A reviewed online notice, its version, collection purpose, permitted access and retention must be agreed before collection. No retention duration or legal basis is invented here. The existing statement that no data reaches a server cannot be reused for online intake.

Supported languages are `en-ZA`, `fr` and `pt-PT`. Validation rejects unknown envelope/field properties, attachments, wrong types, invalid email/date/URL data, oversized text, malformed Unicode, negative/non-finite/unsafe numbers, duplicate checkbox values and incompatible product/metric combinations. Hidden CPU fields are excluded by the migration adapter and rejected if sent for a non-CPU metric. Current product choices are mirrored from the form; **this implementation does not certify IBM product, entitlement, KYC or licensing requirements**.

Requests must be UTF-8 JSON, at most 131,072 bytes, uncompressed, and include a random UUID v4 `Idempotency-Key`. The handler counts actual streamed bytes, independently of `Content-Length`. Set the host's `FUNCTIONS_REQUEST_BODY_SIZE_LIMIT` to the same value; HTTP streaming is enabled in code. Azure Functions runtime 4.28 or later is required for this streaming API.

## Persistence and retries

The UUID submission key becomes the primary record GUID in the dedicated table. A Dataverse `PATCH` with `If-None-Match: *` creates the record only if absent. This prevents competing Function instances and ambiguous client retries from overwriting existing data. On `412`, the store reads only the digest and reference, and compares a SHA-256 hash of the canonical payload:

- New record: `201`, reference and `received: true`.
- Same key and same canonical answers: `200`, same reference and `duplicate: true`.
- Same key with different answers: `409`; the original record is preserved.
- Unconfirmed storage outcome: `503`; the caller must retry with the **same** key and answers.

Idempotency lasts while the record exists. The future client must reuse a key for retries, generate a fresh key after a confirmed submission or changed answers, and never claim receipt after a timeout. There is no automatic client retry loop in the current public page.

The Dataverse destination is restricted to the public-cloud Dynamics organisation URL pattern, with no redirect following. Cloud/sovereign variants require an explicit reviewed change. Credentials are acquired through `ManagedIdentityCredential`; local Azure CLI credentials are not silently used. Neither tokens nor assessment content are logged by this code. Disable request/response body capture and sensitive-header logging in APIM, App Service diagnostics and any surrounding telemetry before real data is accepted.

## Configuration

See [deployment and release procedure](docs/DEPLOYMENT.md) and [disabled app-setting template](docs/app-settings.template.json). All IBM configuration names are independent of the operator/reseller environment variables.

| Setting | Meaning |
| --- | --- |
| `IBM_INTAKE_ENABLED` | Must equal `true` to accept requests; omitted or any other value disables intake. Set only after the documented live checks. |
| `IBM_GATEWAY_TENANT_ID` | Verified tenant issuing the gateway's service token. |
| `IBM_GATEWAY_CLIENT_ID` | Dedicated APIM managed identity's application/client ID. |
| `IBM_GATEWAY_OBJECT_ID` | That identity's service-principal object ID in the tenant. |
| `IBM_INTAKE_API_AUDIENCE` | Actual dedicated API access-token audience, UUID or `api://UUID`; never an ARM/Graph/operator audience. |
| `IBM_PRIVACY_VERSION` | Version of the reviewed online collection notice. |
| `IBM_ALLOWED_ORIGINS` | Comma-separated exact HTTPS origins, no paths, wildcards, credentials or explicit ports. |
| `IBM_DATAVERSE_URL` | Verified organisation origin, such as `https://ORG.crm14.dynamics.com`; lower case, no trailing slash. |
| `IBM_DATAVERSE_ENTITY_SET` | Exact entity set name of the dedicated IBM assessment table, discovered from metadata. |
| `IBM_DATAVERSE_REFERENCE_COLUMN` | Actual logical column name for the receipt reference / primary name. |
| `IBM_DATAVERSE_DIGEST_COLUMN` | Actual logical column name holding the 64-character canonical payload hash. |
| `IBM_DATAVERSE_PAYLOAD_COLUMN` | Actual multiline-text column holding the canonical JSON assessment. |
| `IBM_DATAVERSE_RECEIVED_COLUMN` | Actual date/time column for server receipt time. |
| `IBM_MANAGED_IDENTITY_CLIENT_ID` | Optional verified user-assigned runtime identity client ID; omit for the Function's system-assigned identity. This is not the gateway identity. |

The schema, role assignment and real token audience must be verified, not inferred from these setting names. The Functions host's storage and monitoring configuration must be supplied separately using the selected supported hosting model; this package contains no storage keys or connection strings.

## Local verification

```sh
cd edge/ibm-form-intake
npm ci --ignore-scripts
npm test
npm run check
```

Tests use synthetic company data, local signing keys, and mocked persistence. They cover all field mappings against the existing HTML, invalid payloads, trust boundaries, streamed byte limits, deterministic hashes, concurrent duplicate requests and failure responses. They do **not** establish Azure sign-in, real RBAC, Dataverse roles/schema, gateway rate limits, Function-host operation, or public delivery. No live customer enquiry is sent by the tests.

## Official references

- [Azure Functions Node.js reference and HTTP streams](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Functions app settings and request size limits](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings)
- [API Management managed-identity authentication policy](https://learn.microsoft.com/en-us/azure/api-management/authentication-managed-identity-policy)
- [API Management rate limits by key](https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy)
- [API Management advanced throttling and tier limitations](https://learn.microsoft.com/en-us/azure/api-management/api-management-sample-flexible-throttling)
- [Dataverse conditional create/update operations](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/perform-conditional-operations-using-web-api)
- [Dataverse application users, including Azure managed identities](https://learn.microsoft.com/en-us/power-platform/admin/manage-application-users)
