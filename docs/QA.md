# Skunkworks Africa website QA matrix

This document defines the repeatable acceptance checks for `www.skunkworks.africa` and its hand-off to `store.skunkworks.africa` and Skunkworks Academy.

## Automated acceptance

Run:

```bash
node --check site.js
node --check theme-init.js
node scripts/validate-site.mjs
node scripts/validate-theme.mjs
```

The validators check required files, canonical hosts, primary navigation order, responsive-menu hooks, reduced-motion support, keyboard focus styling and absence of persistent sidebar navigation. They retain the existing monochrome checks for legacy styles and check semantic/group token usage and native components on the three migrated licensing pages. Static checks do not establish visual conformance.

## Licensing design-system acceptance

This acceptance scope covers `/licensing/`, `/licensing/microsoft-365/` and `/licensing/google-workspace/`. Use [brand.skunkworks.africa](https://brand.skunkworks.africa/) and the [design contract](./CANONICAL-NAVIGATION.md#design-contract) as the reference. Other corporate pages and Shopify are separate reviews.

The [licensing browser workflow](../.github/workflows/licensing-browser.yml) installs its pinned test dependency and browser, serves the repository and runs `scripts/test-licensing-browser.mjs`. To run the script locally, use the same dependency setup, start the static server and set `LICENSING_TEST_URL` if it differs from `http://127.0.0.1:4173`.

Validate all three routes in light and dark modes at 320px, 375px, 768px, 1024px and 1440px, including the following:

- The canvas, text, cards, notices and tables use the semantic theme roles; the hero retains the approved navy background with readable text and blue/white actions.
- The header fits without page-wide horizontal scrolling. Icon targets remain at least 44px in each dimension and the navigation logo remains at least 32px high, including at 320px.
- Keyboard focus is visible with 3px outlines in navigation and page controls. Search and navigation dialogs close with Escape and return focus to their trigger; account and ecosystem menus remain usable.
- The theme switch works against either device preference and the selected theme persists after reload. Reduced-motion settings are respected.
- Platform cards and calls to action wrap without clipping. FAQ summaries open and close with keyboard input.
- Each reference-price table has a caption and a labelled, keyboard-focusable scroll region. At narrow widths, overflow remains inside that region and keyboard scrolling reveals the columns.
- Canonical metadata, platform links, vendor reference-price wording and sales enquiry destinations remain intact.

Record browser results separately from human user-test results. Passing these checks covers the licensing journey and does not certify the remaining site.

## Responsive acceptance matrix

| Viewport | Expected result |
| --- | --- |
| 320px | Single-column content, burger visible, no horizontal overflow |
| 375px | Burger/dropdown usable, CTA buttons stack cleanly |
| 390px | Hero and cards remain readable without clipping |
| 430px | Mobile menu exposes all canonical routes |
| 768px | Tablet content remains single-column where necessary |
| 820px | Legacy mobile/desktop navigation breakpoint behaves deterministically |
| 900px / 901px | Shared brand navigation changes between mobile and desktop without clipping |
| 1024px | Desktop navigation and two-column content remain balanced |
| 1280px | Full route-card grid and footer hierarchy visible |
| 1440px | Content remains constrained to canonical shell width |
| 1920px | No uncontrolled line lengths or excessive content stretch |

## Interaction tasks

1. Open and close the burger menu with pointer input.
2. Open burger menu, press Escape, verify it closes.
3. Open burger menu and follow each navigation destination.
4. Verify focus is visible while tabbing through header, cards, CTA and footer.
5. Verify body scrolling is locked while mobile navigation is open.
6. Resize from mobile to desktop while menu is open; verify the mobile menu resets.
7. Use both light and dark OS/browser preferences; verify semantic colour roles on migrated pages and black/white inversion on legacy pages.
8. Enable reduced motion; verify transitions effectively stop.
9. On reseller, technology, cloud and automation forms, switch among Light, Dark and Use system setting. Check field backgrounds and foregrounds, native select popup options, disabled controls and button contrast.
10. In both light and dark OS modes, select the opposite site theme, reload and confirm the choice persists, dropdowns stay readable and focus remains visible. Test desktop and mobile.

## Cross-domain route tasks

Verify these responsibilities remain separate:

- `www.skunkworks.africa`: corporate, solutions, services and company content.
- `store.skunkworks.africa`: products, collections, search, cart, account and checkout.
- `www.skunkworksacademy.com`: courses, labs, training and learner pathways.

Commerce CTAs must never route to `*.myshopify.com` in public navigation. Learning CTAs must not duplicate Academy content under the corporate host.

## Shopify checks

Test the unpublished staging theme before any production publish:

- home page
- collection page
- product page
- search
- cart drawer
- quantity updates
- checkout hand-off
- mobile header/navigation
- footer
- light mode
- dark mode

The staging theme must retain Shopify/Horizon commerce behaviour; styling changes must not override cart, variant, search or checkout logic.

## Human user-test scenarios

These scenarios are defined for an actual tester; they are not considered completed merely because the static validator passes.

### Buyer

Goal: locate Microsoft 365, enter the store, find a product and reach cart/checkout without confusion.

### Security buyer

Goal: navigate from corporate Cybersecurity capability to the live cybersecurity collection and identify the path to request an assessment.

### Learning visitor

Goal: identify Training & Certification and reach Skunkworks Academy without mistaking the store for the learning platform.

### Mobile visitor

Goal: open the burger menu, understand the four primary destinations (Solutions, Services, Academy, Skunkworks) and complete the same routing tasks at 375px width.

### Keyboard-only visitor

Goal: navigate the full header, landing-page cards and footer using keyboard input with visible focus at every actionable element.

## Release gate

Do not describe the site as human user-tested until the human scenarios above have been executed and results recorded. Automated/static QA is a separate gate.
