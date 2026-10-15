# Azure infrastructure (review before execution)

This Bicep template is **not deployed**. It provisions a Linux Azure Functions Consumption (Y1) plan, Function App with system-assigned managed identity, StorageV2 LRS, Log Analytics (30-day retention), and workspace-linked Application Insights.

## Pre-deployment checks
- Confirm Azure Sponsorship subscription supports Consumption Functions in the selected region; confirm Node 22 on Linux Consumption and validate the current Azure Functions regional/runtime support.
- Azure CLI: `az bicep build --file edge/azure-operator-gateway/infra/main.bicep`.
- Run `az deployment group what-if` and review resource names, region, price estimate, and any existing resource conflicts.
- The template uses Storage access keys for Functions host storage in app settings. For a security-hardening phase, migrate to identity-based host storage and disable shared-key access after validation.
- Template does NOT grant RBAC; a separately authorised administrator must grant Reader at the chosen resource group to the Function managed identity, preferably after provisioning and before activating the management API.
- Azure access token audience and allowed operator OIDs remain deliberately unset. The endpoint must return 503 until configured.
- Azure billing charges may apply (Storage, logs and App Insights even when Functions usage is low). Configure budget alerts before deployment.

## Suggested commands (not executed)
```bash
az account set --subscription 9f19b7fc-4a54-4c11-8cea-239dcf3392a4
az group create --name rg-skunkworks-automation-prod --location southafricanorth
az deployment group what-if --resource-group rg-skunkworks-automation-prod --template-file edge/azure-operator-gateway/infra/main.bicep --parameters functionAppName=<UNIQUE_FUNCTION_NAME> storageName=<UNIQUE_STORAGE_NAME>
```
Only run after explicit cost and permission approval. Never paste access tokens or storage keys.
