# Skunkworks Africa website QA matrix

This document defines the repeatable acceptance checks for `www.skunkworks.africa` and its hand-off to `store.skunkworks.africa` and Skunkworks Academy.

## Automated acceptance

Run:

```bash
node --check site.js
node scripts/validate-site.mjs
```

The validator checks required files, canonical hosts, primary navigation order, responsive-menu hooks, reduced-motion support, keyboard focus styling, absence of persistent sidebar navigation, and the strict black/white explicit colour contract.

## Responsive acceptance matrix

| Viewport | Expected result |
| --- | --- |
| 320px | Single-column content, burger visible, no horizontal overflow |
| 375px | Burger/dropdown usable, CTA buttons stack cleanly |
| 390px | Hero and cards remain readable without clipping |
| 430px | Mobile menu exposes all canonical routes |
| 768px | Tablet content remains single-column where necessary |
| 820px | Mobile/desktop navigation breakpoint behaves deterministically |
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
7. Use both light and dark OS/browser preferences; verify black/white inversion.
8. Enable reduced motion; verify transitions effectively stop.

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

Goal: open the burger menu, understand the five primary destinations and complete the same routing tasks at 375px width.

### Keyboard-only visitor

Goal: navigate the full header, landing-page cards and footer using keyboard input with visible focus at every actionable element.

## Release gate

Do not describe the site as human user-tested until the human scenarios above have been executed and results recorded. Automated/static QA is a separate gate.
