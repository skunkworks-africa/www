# Skunkworks Azure Operator Microsoft Entra sign-in

Static GitHub Pages path: `/auth/`, canonical URL `https://skunkworks.africa/auth/`. This is an **interactive SPA sign-in page**, not a server-side confidential OAuth callback and not an MCP OAuth endpoint.

## Complete setup
1. In Entra **App registrations** select **Accounts in this organizational directory only** (single tenant). Do not select multitenant + personal accounts.
2. Create an SPA redirect URI **exactly** matching the URL served to users: `https://skunkworks.africa/auth/`. If users authenticate at `www.skunkworks.africa`, add `https://www.skunkworks.africa/auth/` as a separate SPA redirect URI.
3. GitHub Pages may canonicalize `/auth` to `/auth/`; avoid using `https://skunkworks.africa/auth` in Entra if the final browser URL has a trailing slash. OAuth redirect URIs must match exactly.
4. After app registration, set its **Application (client) ID** in `auth/config.js`. No secret belongs in the browser or repo.
5. Use Entra's hosted login and MSAL authorization code + PKCE, with sessionStorage. Do not store bearer tokens in localStorage. This page only requests OpenID Connect sign-in, not Azure resource-management permissions.
6. Verify on desktop and mobile, including a logged-out user, consent behavior, redirect round-trip, incorrect tenant, sign-out and HTTP route checks. Set CSP and SRI/pin/bundle MSAL before high-security production rollout.
7. ChatGPT Azure Operator requires a **separate authenticated Azure management MCP backend**, whose own OAuth callback and scopes must be registered independently. A static browser sign-in does not authorize a plugin to manage Azure.
