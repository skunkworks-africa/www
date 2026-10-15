# Deployment configuration for existing Azure Function App

Confirmed by user: `AZURE_CLIENT_ID` matches the attached user-assigned managed identity. This is not independently verified in Azure.

## Environment variables
- `AZURE_CLIENT_ID`: client ID of `func-skunkworks-operator-prod-uami` (already configured)
- `AZURE_SUBSCRIPTION_ID`: `840b337e-4a5d-49d9-9739-b7055e1153e9`
- `AZURE_RESOURCE_GROUP`: `rg-skunkworks-automation-prod`
- `AZURE_OPERATOR_API_AUDIENCE`: **actual v2 access token aud claim of the API registration**, verify first; don't guess
- `AZURE_OPERATOR_ALLOWED_USER_OIDS`: authorised operator user's object ID in target tenant, verify from signed-in Entra profile

The API app and exact resource tenant must be reconciled. Do not use the website's sign-in **ID token** as an API bearer token. The HTTP gateway is REST, not an MCP implementation. No live deployment is implied by this code.

## Access
Function App `func-skunkworks-operator-prod` exists in subscription `840b337e-4a5d-49d9-9739-b7055e1153e9`. User-assigned identity `func-skunkworks-operator-prod-uami` has Reader on `rg-skunkworks-automation-prod` per user-provided screenshots. Requests now target only this RG; no subscription-wide list.
