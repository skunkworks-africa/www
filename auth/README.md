# Skunkworks Azure Operator Microsoft Entra sign-in

Static GitHub Pages path: `/auth/`, canonical URL `https://skunkworks.africa/auth/`. This is an **interactive SPA sign-in page**, not a server-side confidential OAuth callback and not an MCP OAuth endpoint.

## Registered application
The existing **Skunkworks Azure Operator** Entra application is single tenant and has the exact SPA redirect URI `https://skunkworks.africa/auth/`. Its public application ID is set in `auth/config.js`. No secret belongs in the browser or repo.

## Verify before relying on sign-in
1. Confirm the live page resolves at `https://skunkworks.africa/auth/`. If users instead authenticate at `www.skunkworks.africa`, add that exact URL as a separate SPA redirect URI.
2. GitHub Pages may canonicalize `/auth` to `/auth/`; keep the registered URI matched to the final browser URL.
3. Use Entra's hosted login and MSAL authorization code + PKCE, with sessionStorage. Do not store bearer tokens in localStorage. This page only requests OpenID Connect sign-in, not Azure resource-management permissions.
4. Verify on desktop and mobile, including a logged-out user, consent behavior, redirect round-trip, incorrect tenant, sign-out and HTTP route checks. Set CSP and SRI/pin/bundle MSAL before high-security production rollout.
5. ChatGPT Azure Operator requires a **separate authenticated Azure management MCP backend**, whose own OAuth callback and scopes must be registered independently. A static browser sign-in does not authorize a plugin to manage Azure.
