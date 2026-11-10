# Verification evidence — 1 November 2026

## Independently observed

- GitHub deployment run 38840319500 completed successfully on 16 October 2026 for commit
  c71e2f71d4d48e5c7d575e7927cc966c0e4df2fb. Its Azure OIDC login, deploy, unauthenticated rejection
  and OAuth discovery steps succeeded: https://github.com/skunkworks-africa/www/actions/runs/38840319500
- Live GET /.well-known/oauth-protected-resource: 200; resource matches /api/mcp.
- Live GET /.well-known/oauth-protected-resource/api/mcp: 200; same metadata.
- Both advertise issuer tenant 338a8916-80d9-467c-a94a-7f61d04ef7d5 and Azure.Read scope.
- Live POST /api/mcp without token: 401 and WWW-Authenticate discovery challenge.
- Live POST /api/mcp with synthetic invalid token: 401, Invalid token.
- Live GET /api/operator/inventory without token: 401.
- Source exposes only get_resource_group and list_resources on existing inventory MCP.
- Connected Teams reports tenant 972e8de4-e365-43a3-99ec-c86a0cc249e8, a different tenant.

## Not established

No Azure CLI or authenticated Azure MCP connection is available in this agent session.
No authorised MCP initialize/tools/list/tools/call, current managed identity attachment/RBAC,
Graph application permissions, Dataverse tenant/roles or Sales Agents group resolution was
performed. A 401 is proof of rejection, not proof that an authorised inventory operation works.
The existing docs' subscription/identity references are historical configuration evidence,
not an independently verified live inventory. No current Azure resource mutation was made.

## This change

New reseller endpoint implemented in the existing Azure Functions project; disabled by default.
Unit/integration tests use synthetic identities and mocked external services, with locally
signed JWTs for cryptographic validation tests. They do not establish tenant permissions.
No Netlify integration, public KYC intake or Microsoft 365 provisioning has been added.
