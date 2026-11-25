# Canonical website and store navigation

## Canonical surfaces

| Surface | Canonical host | Owns |
| --- | --- | --- |
| Corporate | `www.skunkworks.africa` | Company, solutions, services, contact, ecosystem routing |
| Commerce | `store.skunkworks.africa` | Products, collections, search, cart, accounts, checkout |
| Learning | `www.skunkworksacademy.com` | Courses, labs, learner services, credentials, learning pathways |

## Navigation contract

Primary order is always: **Solutions → Services → Academy → Skunkworks**. The **Skunkworks** link points to the About/Company section at `/#company`. The Store remains accessible through the **Shop** button and other commerce CTAs, rather than a primary navigation item. The Software collection is not featured in the homepage commerce quick-links.

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

The [Skunkworks Design System](https://brand.skunkworks.africa/) defines the canonical semantic roles, group palette, typography and component geometry. Apply updates by page or journey and validate both themes before changing existing mappings.

- Migrated pages use semantic roles such as `--sk-bg`, `--sk-text`, `--sk-muted`, `--sk-border` and `--sk-focus` for their light/dark appearance.
- Approved group palette tokens may be used for branded emphasis. The licensing hero uses ink navy, blue actions and an orange accent, with accessible foreground colours.
- Legacy pages retain the existing black/white and opacity-derived mappings in `styles.css` and `adaptive-shell.css` until individually migrated. Do not assume these mappings are equivalent to the semantic tokens or change the independently pinned pilot token snapshot as part of a page migration.
- Top navigation is the only global primary navigation; no persistent left-side navigation.
- Mobile exposes the same destinations through a burger-controlled menu or native navigation dialog.
- Migrated controls use visible 3px focus outlines, at least 44px icon targets and a navigation logo at least 32px high. Preserve these dimensions on narrow screens by adjusting layout rather than shrinking controls.
- Focus restoration, reduced motion, light/dark contrast and responsive behaviour are mandatory.
- Store and corporate surfaces should share typography, spacing, card geometry and header/footer rhythm; each surface requires validation before its migration is considered complete.

### Licensing migration scope

| Route | Implementation |
| --- | --- |
| `/licensing/` | Licensing overview and platform cards |
| `/licensing/microsoft-365/` | Microsoft 365 guide and reference-price table |
| `/licensing/google-workspace/` | Google Workspace guide and reference-price table |

These three pages use the shared corporate navigation and footer, `assets/brand-navigation-tokens.css`, the native `vendor/skunkworks/components-1.0.0.css` components and scoped `licensing/licensing.css` styles. Preserve their canonical URLs, commercial content and quotation destinations when changing presentation. Linked assessment pages and the Windows Server calculator are separate migration work; this scope does not establish whole-site conformance.

## Shopify route policy

All public links should resolve to `store.skunkworks.africa` even when Shopify exposes connected `myshopify.com` hostnames. The primary connected store domain is the public commerce authority.

## My Skunkworks account navigation

All canonical-header pages expose Employee / Microsoft 365, Customer Portal, Partner Portal and Academy Portal in the same order, including mobile and search. Customer and partner links resolve to first-party gateway pages under `/account/`. These are public informational pages, not authentication endpoints. `account/portal-config.mjs` is fail-closed until each approved Power Pages custom domain is bound, authenticated and independently validated. Do not store credentials or business records in this public repository. Power Pages source and activation instructions belong in `skunkworks-africa/portal`.
