# Azure Operator validation / cost review — 15 October 2026

**Status: NOT APPROVED FOR PROVISIONING. No Azure deployment or Azure what-if has been performed.**

## Findings
- The current `main.bicep` defines a Linux Azure Functions **Y1 legacy Consumption** hosting plan. Microsoft is retiring Linux Consumption on 30 September 2028 and recommends Flex Consumption for new apps. This Bicep must be redesigned for Flex before deployment. Merely changing SKU is insufficient: Flex has different app and deployment storage settings.
- Azure Functions Flex Consumption appears in Microsoft's South Africa North supported-region list. Subscription-specific eligibility, quotas and registered providers must still be checked in Azure.
- This environment has no authenticated Azure ARM connector or Azure CLI/Bicep compiler. There is no verified compilation result, `az deployment group what-if` result, managed identity assignment or ARM access evidence.
- Current template contains storage keys in Function App settings and includes legacy Azure Files settings, both requiring review in a future hardened Flex implementation.

## Billing and estimated usage model — prices unconfirmed
Exact South Africa North prices and Microsoft Azure Sponsorship effective rates could not be fetched. **Do not invent a monthly bill or call public retail quotes subscription prices.**

| Service | Billing driver | Pilot assumption to price |
|---|---|---|
| Functions Flex Consumption | executions / GB-seconds / optional always-ready | 10,000, 100,000, and 1,000,000 requests monthly; 0 always-ready instances |
| Storage Standard LRS | GB stored, transactions and transfer | 1–5 GB |
| Azure Monitor / Log Analytics | telemetry GB ingested, retention | 0.5–2 GB ingestion/month, 30-day retention |
| Data transfer | outbound GB | quantify expected response size |
| Key Vault and ACS Email | extra services, not in this template | price separately before inclusion |

**Confirmed payable monthly cost: unknown.** There may be minimum or variable charges for storage and telemetry. Confirm sponsorship credits, regional meters, USD/ZAR conversion and taxes before approval.

## Required sequence
1. Compile a corrected Flex Consumption Bicep against current Microsoft-supported resource schemas.
2. Check `az functionapp list-flexconsumption-locations` for `southafricanorth`, and validate the subscription's available quotas.
3. Retrieve pricing from the official Azure Retail Prices API: https://learn.microsoft.com/rest/api/cost-management/retail-prices/azure-retail-prices. Also use the Azure Pricing Calculator and the subscription's Cost Management.
4. Validate identities, resource names, HTTPS, CORS, storage identity, Reader RBAC scope, Entra token audience and GitHub OIDC trust.
5. Only after approval of resource group creation, run a real ARM `what-if`, supply the change list and precise cost/discount assumptions for final provisioning approval.

Authoritative references: https://learn.microsoft.com/azure/azure-functions/functions-scale ; https://learn.microsoft.com/azure/azure-functions/functions-infrastructure-as-code ; https://learn.microsoft.com/azure/azure-functions/storage-considerations ; https://learn.microsoft.com/azure/log-analytics/log-analytics-manage-cost-storage.

Do not deploy existing `infra/main.bicep` as-is.
