# Target verification and deployment procedure

This is a parameterised procedure for the operator who has authenticated to the correct Azure account. Nothing in this document has been run against an Azure subscription for this change. There is no automatic deployment workflow, cloud resource identifier, enabled online form or consent text in this package.

## 1. Verify the account and target

After the authorised Microsoft login, inspect the account without exposing tokens:

```sh
az account show --query '{name:name,subscription:id,tenant:tenantId,user:user.name}' -o json
az account list --query '[].{name:name,subscription:id,tenant:tenantId,state:state}' -o table
```

Record the verified tenant, subscription, resource group, region and intended Function App name outside source control if they are sensitive in the deployment context. Existing operator documentation in this repository contains conflicting historical subscription references; do not copy those values into this service. Microsoft 365/Entra administrator status alone does not prove Azure resource deployment permissions.

Resolve these target-dependent decisions before provisioning:

- Dedicated Function App and supported hosting plan, HTTPS-only, current supported Node.js runtime (initial target: Node 22), runtime identity and host storage settings.
- APIM compatible tier or an equivalent reviewed Microsoft ingress design with verifiable abuse protection; estimate and approve actual additional cost before creating it. The supplied policy requires rate-limit-by-key and quota-by-key support, which excludes APIM Consumption.
- Runtime and gateway identities, dedicated backend API audience and who can administer its policies.
- Dataverse environment, actual table/column logical names, application user, record ownership/access and retention.
- Reviewed online privacy notice and version, authorised website origins and notification requirements. No email workflow is included in this implementation.

## 2. Create isolated identities and the private Dataverse schema

The gateway and Function runtime must not reuse the Azure Operator or reseller permissions. Configure a dedicated backend API in the verified tenant; the Function verifies both the gateway identity and API audience. Limit policy-editing rights because APIM administrators can exercise its managed identity.

Create or confirm a dedicated standard Dataverse table that accepts caller-supplied primary record GUIDs. Virtual or elastic tables are not supported by this draft. Discover the entity set and column names from metadata; the following descriptions are requirements, not proposed names:

| Column role | Required characteristics |
| --- | --- |
| Primary ID | Dataverse GUID; the submission's random UUID v4 becomes this record ID. |
| Receipt reference / primary name | Text supporting at least 40 characters (`IBM-` plus UUID). |
| Canonical payload digest | Text, at least 64 ASCII characters. |
| Canonical payload | Multiline plain text; provision enough capacity for a 131,072-byte request after canonical JSON serialisation. Verify the maximum contract payload with multibyte text. |
| Received at | Date/time preserving server UTC time. |

Register the runtime managed identity's application ID as a Dataverse application user. Grant the least table/column permissions that allow conditional creation and the digest/reference retry check; verify required privileges against the actual environment. Do not assign System Administrator or broad environment write access. Configure and verify staff record visibility through the intended business unit/team and security role; do not expose the table through an anonymous portal or general-purpose public API.

Use identity-based host storage and supported managed identities where the selected Function hosting plan permits; the host storage configuration is deliberately not guessed here. The data adapter uses only managed identity, never a stored client secret or an operator's Azure CLI session.

## 3. Provision and deploy with intake disabled

Keep `IBM_INTAKE_ENABLED=false`. Copy the supplied setting names into the target app configuration after filling only values verified in Azure/Dataverse. Also set `FUNCTIONS_REQUEST_BODY_SIZE_LIMIT=131072`, confirm HTTP streaming support (Functions runtime 4.28+), and ensure Function-host startup succeeds.

Build/test from this directory and deploy **only this package** to the dedicated app. Do not deploy it over `edge/azure-operator-gateway` or dispatch the existing operator workflow. Establish a separately scoped GitHub OIDC deployment principal/environment for future CI/CD; no publish profile or client secret is needed in browser/source code.

Before any later deployment command, make the selected resource concrete and verify it:

```sh
# Set these non-secret selectors to verified values in the operator's shell.
# IBM_DEPLOY_SUBSCRIPTION, IBM_DEPLOY_RESOURCE_GROUP, IBM_DEPLOY_FUNCTION_APP
az functionapp show --subscription "$IBM_DEPLOY_SUBSCRIPTION" \
  --resource-group "$IBM_DEPLOY_RESOURCE_GROUP" --name "$IBM_DEPLOY_FUNCTION_APP" \
  --query '{id:id,name:name,location:location,kind:kind,httpsOnly:httpsOnly}' -o json
```

These are inspection commands. An actual deployment or resource-creation command belongs in the reviewed target-specific release change, once identity, target, configuration and cost are known. Do not print app-setting values, tokens, keys or whole diagnostic dumps during verification.

## 4. Configure and verify the gateway

Configure a dedicated POST operation using `apim-policy.template.xml`; replace all named values. Its backend base URL must be the verified HTTPS Function origin, and its backend resource must be the dedicated Entra API. The sample uses APIM's system-assigned identity; a chosen user-assigned identity needs an explicitly configured `client-id` attribute and matching backend allowlist.

Set reviewed per-IP, overall-per-minute and overall-per-day limits. These are policy parameters with no invented traffic allowance. Ensure API/operation inheritance cannot skip the policy, restrict alternate ingress, and validate actual counters and `429` behaviour. For multiple gateway deployments, account for counter scope rather than assuming a single global distributed limit. If behind another proxy, verify how the actual client IP reaches APIM; do not simply trust a public `X-Forwarded-For` header.

Disable request/response body and bearer-header capture in gateway and Function monitoring. Add operational alerts using status/error/rate metrics without collecting the assessment payload. Verify the gateway cannot forward managed-identity tokens to arbitrary backend URLs.

## 5. Staging acceptance criteria

Use only clearly synthetic company/contact data. Where a real backend record must be retained or removed after tests, follow the agreed data retention/access process; this code includes no destructive cleanup command.

1. With the release flag disabled, every submission returns `503` and creates no record.
2. With the staging configuration enabled, a direct Function POST without the specific gateway token returns `401`; wrong tenant, API audience, client ID, object ID, expired token and delegated scope fail.
3. The approved origin succeeds through APIM; disallowed/missing origins, unsupported preflight headers, wrong methods, oversized/chunked/compressed bodies, invalid UTF-8 and malformed fields fail without persistence.
4. Exceed configured per-IP and overall gateway limits and observe `429` before Dataverse work. Confirm no alternate route bypasses the policy.
5. A valid synthetic POST produces one private Dataverse record and a receipt. Concurrent same-key retries return the same reference; changed answers with the same key return `409`. Confirm the original record remains unchanged.
6. Simulate storage failure or a lost response, then retry with the same key: no false receipt and no duplicate record.
7. Verify the actual Dataverse table/column size, app-user permissions, ownership and intended staff access. Confirm customer payloads and tokens are absent from diagnostics.
8. Validate the maximum allowed payload, actual Function host and runtime, network restrictions, privacy version, monitoring alerts and rollback.

The automated local tests cover code paths; only these live checks establish the deployment. Record their observed results and environment before release.

## 6. Connect the public form in a separate reviewed change

The current HTML remains unchanged. After the backend is verified, add a frontend configuration gate with a verified APIM URL, approved privacy version/text and explicit submit/review control. Import or bundle the tested contract adapter from a single source; do not duplicate a second positional mapping that can drift. Keep local download available.

For each reviewed payload, generate a cryptographically random UUID v4, hold it for the request and retries, and use it in `Idempotency-Key`. Do not place answers in URL parameters, browser logs, analytics or unprotected persistent browser storage. If the user changes answers, require a new review and new key. Only report received on a valid `200`/`201` receipt. A timeout remains unconfirmed until the same-key retry completes.

Update the old local-only preview notice and acknowledgement to the reviewed online collection wording when the real endpoint is enabled. Never silently interpret the old preview acknowledgement as permission for online storage.

## Rollback

Set `IBM_INTAKE_ENABLED=false` first; the dispatch function checks this flag on every invocation. Disable the public submit configuration while preserving local download. Retain existing assessment records according to the agreed retention/access rules. Do not delete records or rotate unrelated identities as part of routine rollback.
