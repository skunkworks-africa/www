# Skunkworks assessment — Azure Functions API

GitHub Pages continues to host the corporate website. This is a separate Azure Functions v4 Node.js app providing `POST /api/technology-assessment`, and sends mail through Resend. Do **not** deploy the API files on GitHub Pages.

## Azure setup
1. Create an Azure Function App with supported Node.js runtime and HTTPS-only mode, and deploy this folder using Azure Functions Core Tools or GitHub Actions. Set project root to `edge/azure-assessment-api`.
2. Configure Function App environment values `RESEND_API_KEY`, `MAIL_FROM` (verified sender/domain), `TURNSTILE_SECRET_KEY`. Keep secrets in Azure App Settings or Key Vault references. Never commit values.
3. Configure Function App **CORS** to allow exactly `https://www.skunkworks.africa` and optionally `https://skunkworks.africa`. No wildcard origins.
4. Register a Cloudflare Turnstile widget for the hostname (Turnstile works without changing DNS or using Cloudflare hosting). Add site key to the frontend and verify it works; server-side secret must match. Alternatively implement another approved CAPTCHA with equivalent server-side validation.
5. Set a frontend endpoint to the deployed HTTPS URL, for example `https://<function-app>.azurewebsites.net/api/technology-assessment` (or `https://api.skunkworks.africa/api/technology-assessment` after custom-domain configuration).
6. Use Azure monitoring, adaptive rate limiting with Azure Front Door/WAF or API Management, and restrictive logging (no personal or commercial submission payloads). Add retention and POPIA controls.
7. Submit a legitimate test from the website, verify sales inbox delivery and reply-to before claiming the service works. Resend's 2xx response only confirms provider acceptance, not final inbox placement.

The API rejects submissions without a valid Turnstile token; deploy and configure the widget **before** switching the frontend endpoint. Anonymous HTTP route is protected by server CAPTCHA and origin checks; Origin is not authentication.

Never request card details, account numbers, employee personal IDs, device serial numbers or full bank statements.
