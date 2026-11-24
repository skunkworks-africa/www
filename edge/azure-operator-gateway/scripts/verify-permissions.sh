#!/usr/bin/env bash
# Read-only; run with an authenticated Azure CLI session or existing GitHub OIDC environment.
# No tokens, secrets or app-setting values are printed. Do not enable shell tracing.
set -euo pipefail
: "${AZURE_SUBSCRIPTION_ID:?Set the verified Azure subscription ID}"
: "${AZURE_TENANT_ID:?Set the verified infrastructure tenant ID}"
RG='rg-skunkworks-automation-prod'
APP='func-skunkworks-operator-prod'
ACTUAL_TENANT=$(az account show --subscription "$AZURE_SUBSCRIPTION_ID" --query tenantId -o tsv)
[[ "$ACTUAL_TENANT" == "$AZURE_TENANT_ID" ]] || { echo 'Subscription tenant mismatch'; exit 1; }
az account show --subscription "$AZURE_SUBSCRIPTION_ID" --query '{subscription:id,tenant:tenantId,state:state}' -o json
az functionapp show --subscription "$AZURE_SUBSCRIPTION_ID" --resource-group "$RG" --name "$APP" --query '{id:id,state:state,host:defaultHostName,httpsOnly:httpsOnly,identity:identity}' -o json
# Query setting NAMES only: presence does not establish correctness or permission grants.
az functionapp config appsettings list --subscription "$AZURE_SUBSCRIPTION_ID" --resource-group "$RG" --name "$APP" --query '[].name' -o json
PRINCIPALS=$(az functionapp show --subscription "$AZURE_SUBSCRIPTION_ID" --resource-group "$RG" --name "$APP" --query 'identity.userAssignedIdentities.*.principalId' -o tsv)
SYSTEM_PRINCIPAL=$(az functionapp show --subscription "$AZURE_SUBSCRIPTION_ID" --resource-group "$RG" --name "$APP" --query identity.principalId -o tsv)
SCOPE="/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RG"
for PRINCIPAL in $PRINCIPALS $SYSTEM_PRINCIPAL; do
  [[ "$PRINCIPAL" =~ ^[0-9a-fA-F-]{36}$ ]] || continue
  az role assignment list --subscription "$AZURE_SUBSCRIPTION_ID" --assignee-object-id "$PRINCIPAL" --scope "$SCOPE" --include-inherited --all --query '[].{principal:principalId,role:roleDefinitionName,scope:scope,condition:condition}' -o json
done
echo 'RBAC assignments are inventory, not proof of effective access (deny assignments and conditions may apply).'
echo 'Graph app consent, Sales Agents group membership/owners and Dataverse roles require separate verification in the M365 tenant.'
