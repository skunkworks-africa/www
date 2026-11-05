#!/usr/bin/env bash
# READ ONLY. For manual GitHub Actions OIDC preflight. Never print tokens or setting values.
set -euo pipefail
: "${AZURE_SUBSCRIPTION_ID:?}"
: "${AZURE_TENANT_ID:?}"
: "${RESELLER_RESOURCE_GROUP:?}"
: "${RESELLER_FUNCTION_APP:?}"
: "${RESELLER_STORAGE_ACCOUNT:?}"
expected_staff_tenant='972e8de4-e365-43a3-99ec-c86a0cc249e8'
[[ "$RESELLER_FUNCTION_APP" == 'func-skunkworks-reseller-staging' ]] || { echo 'Unexpected staging Function App name'; exit 1; }
actual_tenant="$(az account show --subscription "$AZURE_SUBSCRIPTION_ID" --query tenantId -o tsv)"
[[ "$actual_tenant" == "$AZURE_TENANT_ID" ]] || { echo 'GitHub OIDC tenant does not own selected subscription'; exit 1; }
# The current application uses direct ManagedIdentityCredential for Dataverse/Graph.
# Cross-tenant MI delegation is not implemented. A separate M365-tenant resource must be used.
[[ "$actual_tenant" == "$expected_staff_tenant" ]] || {
  echo "::error::Azure subscription is not in verified Skunkworks M365 tenant; do not activate direct managed identity access.";
  exit 1;
}
echo 'Azure subscription and M365 tenant boundary: consistent'
az group show --subscription "$AZURE_SUBSCRIPTION_ID" -n "$RESELLER_RESOURCE_GROUP" --query '{name:name,location:location}' -o json
app_json="$(az functionapp show --subscription "$AZURE_SUBSCRIPTION_ID" -g "$RESELLER_RESOURCE_GROUP" -n "$RESELLER_FUNCTION_APP" --query '{name:name,httpsOnly:httpsOnly,state:state,kind:kind,identity:identity.type,host:defaultHostName}' -o json)"
APP_JSON="$app_json" node --input-type=module <<'NODE'
const app=JSON.parse(process.env.APP_JSON);
if(app.httpsOnly!==true||app.state!=='Running'||!app.identity||app.identity==='None')process.exitCode=1;
console.log(JSON.stringify({name:app.name,httpsOnly:app.httpsOnly,state:app.state,kind:app.kind,identityType:app.identity}));
NODE
[[ $? -eq 0 ]] || { echo 'Function App TLS or identity policy failed'; exit 1; }
# Inspect boolean state WITHOUT printing setting values.
closed="$(az functionapp config appsettings list --subscription "$AZURE_SUBSCRIPTION_ID" -g "$RESELLER_RESOURCE_GROUP" -n "$RESELLER_FUNCTION_APP" --query "[?name=='RESELLER_INTAKE_ENABLED'].value | [0]" -o tsv)"
[[ "$closed" != 'true' ]] || { echo "::error::Intake must be disabled at preflight"; exit 1; }
echo 'Reseller intake feature flag: closed'
az storage account show --subscription "$AZURE_SUBSCRIPTION_ID" -g "$RESELLER_RESOURCE_GROUP" -n "$RESELLER_STORAGE_ACCOUNT" --query '{name:name,publicBlobs:allowBlobPublicAccess,minTLS:minimumTlsVersion,httpsOnly:enableHttpsTrafficOnly}' -o json
public="$(az storage account show --subscription "$AZURE_SUBSCRIPTION_ID" -g "$RESELLER_RESOURCE_GROUP" -n "$RESELLER_STORAGE_ACCOUNT" --query allowBlobPublicAccess -o tsv)"
[[ "$public" == 'false' ]] || { echo 'Storage account must disable public blob access'; exit 1; }
storage_id="$(az storage account show --subscription "$AZURE_SUBSCRIPTION_ID" -g "$RESELLER_RESOURCE_GROUP" -n "$RESELLER_STORAGE_ACCOUNT" --query id -o tsv)"
# Missing Defender malware scan configuration blocks intake. Treat any 403/404 as a fail.
defender="$(az resource show --ids "$storage_id/providers/Microsoft.Security/DefenderForStorageSettings/current" --api-version 2022-12-01-preview --query '{enabled:properties.isEnabled,onUpload:properties.malwareScanning.onUpload.isEnabled}' -o json)"
DEFENDER_JSON="$defender" node --input-type=module <<'NODE'
const status=JSON.parse(process.env.DEFENDER_JSON||'null');
if(status?.enabled!==true||status?.onUpload!==true){console.error('Defender for Storage on-upload scanning is not verified');process.exit(1);}
console.log('Defender for Storage malware scanning: configured');
NODE
echo 'Read-only checks complete. This is NOT approval to open production intake.'
