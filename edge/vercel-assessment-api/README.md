# Secure assessment API (Vercel only)
Deploy this directory as a separate Vercel project with **Root Directory** `edge/vercel-assessment-api`. Keep the website on GitHub Pages. This API does not require the skunkworks.africa domain/DNS to move.

Required Vercel **encrypted Production environment variables**:
- `RESEND_API_KEY` from Resend, restricted to the intended sending account.
- `MAIL_FROM`: sender at a verified domain, e.g. `Skunkworks Forms <forms@skunkworks.africa>` after Resend verification.
- `TURNSTILE_SECRET_KEY`: Turnstile secret for skunkworks.africa hostname (Turnstile does **not** require moving DNS to Cloudflare).

Frontend requires a **Turnstile site key** and the final verified Vercel API URL. Turnstile hostname must include `www.skunkworks.africa` (or apex, as required). Verify actual email receipt at `sales@skunkworks.africa` before advertising submission availability.

Security: accepted origins are only Skunkworks public domains, but origin checks are not authentication. Turnstile must be verified server side; additionally enable Vercel WAF rate limiting and logging without full payloads. Apply POPIA retention and privacy disclosures.

Do not store secrets in GitHub or the browser. Avoid unredacted bank statements.
