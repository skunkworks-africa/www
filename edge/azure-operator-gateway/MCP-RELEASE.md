# Read-only MCP gateway — release and test

URL after deployment: `https://func-skunkworks-operator-prod-c0c0gzc2asgmfpa4.southafricanorth-01.azurewebsites.net/api/mcp`.

The HTTP endpoint is a stateless JSON-RPC MCP streamable-HTTP subset, with `initialize`, `ping`, `tools/list`, `tools/call` and `notifications/initialized`. It supports POST JSON responses and no SSE stream. Tools: `get_resource_group`, `list_resources`. All methods require a validated Microsoft Entra **access token** with matching issuer, tenant, audience, `Azure.Read` or `Azure.Manage` delegated scope and allowed user OID. Managed identity is used for resource-group Reader calls. No ARM write operations.

## Testing and connection caveats

1. GitHub Actions **Deploy Azure Operator Gateway (manual)** deploys and tests that unauthenticated `tools/list` returns 401; this is NOT proof an authorised tool call works.
2. To test a valid user token, register and consent a **separate confidential OAuth client** for the Entra API scope. Never use ID tokens or paste bearer tokens in GitHub or chat. Test authorised `initialize` and `tools/list` and `tools/call`; test invalid audience, issuer, OID and scope.
3. **ChatGPT connector is NOT yet configured.** ChatGPT remote MCP setup normally requires OAuth client configuration, protected-resource metadata / authorization-server discovery and the ChatGPT OAuth callback. The current endpoint does not implement those discovery endpoints or dynamic client registration. Do not claim it can already be installed/connected in ChatGPT.
4. Keep user-assigned managed identity Reader on the dedicated RG. Retain the separate GitHub deployer with scoped deployment permission. No client secrets in repo or browser.
5. Production gateway access requires a threat-model review (host auth, CORS, API rate limits, transport interoperability, telemetry redaction). Prefer the narrow `Azure.Read` delegated scope and admin consent, not `Azure.Manage`.

This is a staged gateway transport implementation, not completion of ChatGPT integration.
