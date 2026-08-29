# Skunkworks Africa — canonical web gateway

This repository owns the public corporate landing surface for `https://www.skunkworks.africa/`.

## Surface ownership

- `www.skunkworks.africa` — company, solutions, services, contact and ecosystem routing.
- `store.skunkworks.africa` — Shopify products, collections, search, cart, account and checkout.
- `www.skunkworksacademy.com` — learning, courses, labs, credentials and learner pathways.

The detailed navigation and canonical policy lives in `docs/CANONICAL-NAVIGATION.md` and the machine-readable route contract is `site-map.json`.

## Design system

The public website and Shopify storefront use the same adaptive monochrome design contract:

- Light preference: white canvas / black foreground.
- Dark preference: black canvas / white foreground.
- No standalone accent colours.
- Muted tones and borders are opacity derivatives of black/white.
- Top navigation is the only global primary navigation.
- Mobile uses a burger-controlled dropdown menu.
- Responsive cards, constrained content width, clear route hierarchy and full footer align structurally with the Skunkworks Academy experience.

## Local validation

No package installation is required.

```bash
node --check site.js
node scripts/validate-site.mjs
```

GitHub Actions runs the same checks on pull requests and pushes to `main`.

## Deployment

The repository includes `CNAME` for `www.skunkworks.africa`. The expected deployment target is GitHub Pages or an equivalent static host that serves the repository root.

Before production cutover, verify DNS and TLS for `www.skunkworks.africa`, then execute the QA matrix in `docs/QA.md`.

## Shopify alignment

The Shopify store uses `store.skunkworks.africa` as its public commerce authority. Public links must never prefer the connected `*.myshopify.com` aliases.

Theme alignment is staged on an unpublished Horizon copy before any live theme publish. Corporate routing rules must not be implemented by duplicating Shopify product or collection pages in this repository.
