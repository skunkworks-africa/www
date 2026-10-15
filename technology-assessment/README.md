# Business Technology & Expenditure Assessment
Public form: `/technology-assessment/`.

## Hosting policy: no Netlify
- GitHub Pages hosts the corporate site using `.github/workflows/static.yml`.
- Cloudflare Workers handles only the secure `/api/technology-assessment` endpoint, after configuration.
- Netlify must not be used for builds, previews, hosting, form collection, or email delivery.
- The Netlify checks currently visible in GitHub originate from an existing external Netlify GitHub integration, not this repository's GitHub Actions workflows. To stop those checks, disconnect the repository from the Netlify project or remove Netlify's repository access in GitHub organization settings. This requires an administrator; editing repository files cannot revoke the external integration.

## Deployment limitation
This website is hosted by **GitHub Pages**, which is static. The new form sends a POST to `/api/technology-assessment`; GitHub Pages alone **cannot** execute this endpoint. Until the Worker route below is configured, the form correctly shows an error rather than claiming an email was sent.

## Configure automated email
1. Use Cloudflare-proxied DNS for `www.skunkworks.africa` and create a Worker from `edge/technology-assessment-worker/worker.js`.
2. Set a Worker route `www.skunkworks.africa/api/technology-assessment*` in the same Cloudflare zone. Ensure requests continue to GitHub Pages for the rest of the site.
3. In Worker **Secrets**, set `RESEND_API_KEY` (Resend transactional email API key). Configure `MAIL_FROM` as a verified sender on a domain you control, e.g. `Skunkworks Sales <forms@skunkworks.africa>`. Verify domain DNS records with provider.
4. Enable Cloudflare WAF and rate limiting for POST `/api/technology-assessment`; deploy Turnstile with **server-side verification** to mitigate automated abuse before opening to public submissions.
5. Submit an authorised test assessment and confirm actual delivery to `sales@skunkworks.africa` and reply-to handling. Check logs and spam. No delivery is guaranteed until verified.

## Privacy and operational controls
- Data submitted includes company/contact names and commercial supplier-cost information. Protect it under applicable privacy law (including POPIA in South Africa). Publish the real privacy-policy URL before production launch, define lawful purpose, retention period and data-subject access process.
- **Do not request bank statements directly on the static site**. If later added, upload to private object storage with expiring signed URLs, malware scans, redaction, strict access control and retention/deletion policies. Do not email unredacted statements or store responses in public GitHub issues.
- Do not collect bank/card numbers, passwords, secret access keys or unrelated personal transactions.
- No client-side `mailto:` fallback falsely claims delivery; failures preserve entered form content.
- Worker uses allowed fields and server-side mandatory-consent/email checks; use logging without raw submission payloads and apply Cloudflare rate limits to prevent abuse.
- Complete a privacy/legal review, test accessibility and configure monitoring before marking production-ready.
