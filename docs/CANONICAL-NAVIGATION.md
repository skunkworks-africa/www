# Canonical website and store navigation

## Canonical surfaces

| Surface | Canonical host | Owns |
| --- | --- | --- |
| Corporate | `www.skunkworks.africa` | Company, solutions, services, contact, ecosystem routing |
| Commerce | `store.skunkworks.africa` | Products, collections, search, cart, accounts, checkout |
| Learning | `www.skunkworksacademy.com` | Courses, labs, learner services, credentials, learning pathways |

## Navigation contract

Primary order is always: **Solutions → Services → Store → Academy → Company**.

Desktop and mobile expose the same primary destinations. The mobile implementation may change presentation but not information architecture.

## Canonical URL rules

1. Every indexable corporate page emits a self-referencing canonical URL on `https://www.skunkworks.africa`.
2. Product and collection pages must never be duplicated under the corporate host.
3. Store links use `https://store.skunkworks.africa` rather than `*.myshopify.com` domains.
4. Learning links use the Academy canonical host/property rather than duplicate course content on the corporate site.
5. Checkout and cart actions stay on Shopify.
6. Corporate CTAs may deep-link to canonical Shopify collections, products or search results.
7. UTM parameters may be added for campaigns, but canonical metadata must remain parameter-free.
8. Internal corporate anchor navigation must not create fake indexable routes.

## Design contract

- Exactly two primary visual colours: black and white.
- Light browser preference: white canvas, black foreground.
- Dark browser preference: black canvas, white foreground.
- Muted surfaces, borders and secondary text use opacity derivatives only.
- Top navigation is the only global primary navigation; no persistent left-side navigation.
- Mobile uses a burger-controlled dropdown navigation.
- Focus states, reduced motion and responsive behaviour are mandatory.
- Store and corporate surfaces should share typography, spacing, card geometry, header/footer rhythm and black/white inversion.

## Shopify route policy

All public links should resolve to `store.skunkworks.africa` even when Shopify exposes connected `myshopify.com` hostnames. The primary connected store domain is the public commerce authority.
