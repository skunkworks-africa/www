# Step 1 — Azure Operator bootstrap (read-only)

Run from an administrator-controlled machine, in a PowerShell terminal with Azure CLI installed:

```powershell
az login --tenant 338a8916-80d9-467c-a94a-7f61d04ef7d5
pwsh ./edge/azure-operator-gateway/scripts/azure-preflight.ps1
```

This preflight checks that the **Microsoft Azure Sponsorship** subscription `9f19b7fc-4a54-4c11-8cea-239dcf3392a4` actually belongs to the expected tenant, lists provider registration states, existing resource groups and Function Apps. It creates **nothing**.

## Required manual approvals after successful preflight

1. Confirm Azure sponsorship credit/service constraints and budget alert thresholds.
2. Approve a region, cost estimate and resource group name (proposal: `rg-skunkworks-automation-prod`).
3. Provision Function App hosting with managed identity, diagnostics and HTTPS using approved IaC, without granting subscription-wide Contributor to a public-facing workload.
4. Assign **Reader** to the Function App's managed identity at a dedicated resource-group scope. Reader cannot deploy resources. A separate GitHub OIDC deployment principal should receive narrowly scoped deployment permissions.
5. Create a **GitHub Actions environment** `azure-operator-production`, require reviewers, and set environment variables `AZURE_DEPLOY_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_OPERATOR_FUNCTION_APP`. Add a Microsoft Entra federated identity for GitHub repository `skunkworks-africa/www`, subject `repo:skunkworks-africa/www:environment:azure-operator-production`, audience `api://AzureADTokenExchange`. This is a trusted-issuer binding, not the website's SPA redirect.
6. Set the Function App configuration `AZURE_OPERATOR_API_AUDIENCE` to the actual registered API token audience and `AZURE_OPERATOR_ALLOWED_USER_OIDS` to a verified operator user object ID in the resource tenant.
7. Complete security testing and an MCP protocol adapter. **The current inventory gateway is REST-only and does not connect ChatGPT to Azure.**

## Stop conditions

- Subscription and tenant don't match.
- Wrong principal/object ID or admin identity.
- Azure sponsorship disallows required services.
- Unexpected existing resources or spending.
- Unreviewed Azure RBAC grants, broad permission scopes, or missing authentication settings.

Do not paste tokens, passwords, deployment credentials, or Azure CLI output containing access tokens into chat. Tenant and subscription identifiers are non-secret.
