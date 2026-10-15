# Skunkworks Azure Operator — read-only gateway (prepared, NOT deployed)

Target tenant: `338a8916-80d9-467c-a94a-7f61d04ef7d5`
Target subscription: `9f19b7fc-4a54-4c11-8cea-239dcf3392a4`
Separate GitHub Pages SPA Client ID: `d5cff578-a135-4fc9-b884-45677ec05b1c`.

## Architecture
Azure Functions v4 Node.js gateway with a system-assigned managed identity. It validates incoming Microsoft Entra **access tokens** with Microsoft JWKS, strict tenant, issuer, configured API audience, delegated scope, and individual operator OID allowlist. Managed identity makes ARM **read-only** calls. No access tokens or privileged service secrets are embedded in GitHub Pages.

## Deployment prerequisites (administrator action required)
1. Resolve the API app registration in the correct tenant and expose `Azure.Read` (preferred) or the existing `Azure.Manage` delegated scope. For production, split read and write scopes; do not request the broad `Azure.Manage` scope from the public SPA.
2. Provision a separate Azure Functions app from this directory. Use a supported Node.js version, HTTPS-only, Application Insights, minimal logs, and system-assigned managed identity.
3. Assign managed identity **Reader** at the exact subscription or intended resource-group scope. An Entra Global Administrator role does not grant Azure RBAC; RBAC assignment requires a properly authorised Azure subscription identity.
4. Configure app settings `AZURE_OPERATOR_API_AUDIENCE` to the exact API access-token audience (not guessed), and `AZURE_OPERATOR_ALLOWED_USER_OIDS` to approved user object IDs. Start with only the verified administrator OID; the supplied OID was `38f8da0a-72cc-4119-b98b-cc615f5864c7` but must be verified in the TARGET tenant.
5. Configure an OAuth2 client for the future ChatGPT remote MCP connector, including exact callback URLs from the connector installation flow. Do **not** use `https://skunkworks.africa/auth/` as the ChatGPT MCP OAuth callback; it is a separate browser SPA.
6. Deploy through GitHub OIDC federation: federated credential scoped to this repository AND production environment; no client secrets or publish profiles. Configure GitHub Actions environment approvals.
7. Integrate an MCP transport/adapter in a separate authenticated service before calling this a ChatGPT-connectable MCP server. **This current gateway is REST-only**, not an MCP server. ChatGPT plugin v0.2.0 remains a runbook, not an active Azure connector.
8. Run smoke tests with real delegated access tokens, test wrong audience/tenant/OID/scope, and verify only read-only inventory. Enable write endpoints in a future reviewed change with explicit user approval, dry-run ARM what-if, audit logging and budget guardrails.

## Safety
Do not publish this unconfigured endpoint or claim it is authorised. Strong authentication is mandatory; no unrestricted resource modification. Never commit client secrets, certificates, tokens or subscription keys. Apply gateway/WAF throttling and Azure Monitor retention.
