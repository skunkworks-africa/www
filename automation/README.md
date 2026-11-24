# Sales Automation Control Centre

Static operator prototype for the Skunkworks Africa product-launch and omnichannel sales workflow.

## Route

Production after merge:

`https://www.skunkworks.africa/automation/`

The page is deliberately marked `noindex,nofollow`. GitHub Pages is public, so this version must not contain credentials, customer personal information, private supplier pricing or other confidential data.

## What it does

- manages one product/campaign master record
- calculates net selling price, gross profit and gross margin from VAT-inclusive selling price and VAT-exclusive supplier cost
- enforces eight workflow gates
- applies Tier A/B/C channel policy
- tracks channel status, evidence URL and blockers
- builds campaign UTM URLs
- tracks a basic weekly sales/marketing scorecard
- produces a next-action queue
- saves non-sensitive state in browser `localStorage`
- exports workflow JSON and channel CSV

## Files

```text
automation/
├── index.html
├── automation.css
├── config.js
├── app.js
└── README.md
```

The operating procedure and production integration design are documented in [`docs/SALES-AUTOMATION-SOP.md`](../docs/SALES-AUTOMATION-SOP.md).

## Local testing

Serve the repository root rather than opening the file directly:

```bash
python -m http.server 8080
```

Then open:

`http://localhost:8080/automation/`

Run quality checks:

```bash
node --check automation/config.js
node --check automation/app.js
node scripts/validate-site.mjs
```

## Production boundary

This prototype performs workflow automation only in the browser. Direct API synchronisation with Shopify, Google Merchant, Meta, WhatsApp, Microsoft/Dynamics, Business Central, Amazon, Takealot or other platforms must be implemented behind authenticated server-side integrations with secrets management, audit logging, retries and idempotency.
