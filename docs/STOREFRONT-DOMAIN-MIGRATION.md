# Storefront domain migration

The canonical commerce host is `https://store.skunkworks.africa`. The corporate
gateway remains on `https://www.skunkworks.africa`.

## Redirect contract

The edge worker in `edge/storefront-redirect/worker.mjs` issues a permanent,
path-preserving `301` for Shopify-owned routes previously served from the apex
domain:

- `/products`, `/collections`, `/cart`, `/search`, `/policies`, `/pages`, and
  `/blogs`
- The same route families below `/fr`, `/hi`, `/pt`, and `/zh`
- Localized storefront roots such as `/fr` and `/zh`

The redirect changes only the hostname. Paths, percent-encoding, `gclid`, UTM
parameters, and all other query parameters remain unchanged.

`/checkouts` and localized checkout-session paths are deliberately excluded.
Those URLs contain session-bound tokens and Shopify must generate a new checkout
from `store.skunkworks.africa`.

Corporate routes including `/`, `/about`, `/support`, and `/training` are not
redirected.

## Deployment

1. Run `node edge/storefront-redirect/worker.test.mjs`.
2. Deploy the worker to the edge account that proxies `skunkworks.africa`.
3. Assign the worker to `skunkworks.africa/*` only; do not assign it to the
   `www` or `store` host.
4. Verify representative product, collection, localized and checkout URLs.
5. Confirm redirect responses retain `gclid` and UTM parameters.

GitHub Pages cannot emit arbitrary server-side path redirects. The worker must
be attached at the authoritative edge layer for the response to be a true 301.

## Advertising cleanup

- Google Ads final URLs and assets must use `store.skunkworks.africa` for
  commerce destinations.
- Merchant Center link fields and feed fetch URLs must use the canonical store
  host.
- Never use `*.myshopify.com` or historical `/checkouts/...` URLs as advertising
  destinations.
- Keep corporate campaign destinations on `www.skunkworks.africa`.
