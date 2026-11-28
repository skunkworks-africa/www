# Public enquiry forms

- `/forms/` groups the corporate enquiry and assessment routes.
- `/forms/dynamics-training-licensing/` gathers Dynamics ERP training, Microsoft/Google licensing, optional implementation needs and discovery-call preferences.
- The homepage contact section links directly to the dedicated form and the hub.

## Delivery contract

The discovery form uses a visitor-reviewed email handoff to the existing `sales@skunkworks.africa` address. It does not make a network submission, store answers in browser storage, create a CRM record, book a meeting or claim delivery. The visitor reviews the full summary and explicitly sends it through their own email application. Copy and plain-text download remain available for webmail and long enquiries. Email links exceeding the conservative URI budget open a subject-only draft; the UI instructs the visitor to paste or attach the full summary. Never truncate answers.

The static site currently has no working enquiry API. A direct-submission service requires a dedicated, deployed Azure endpoint with its own validated field contract, abuse protection, restricted origins and configured delivery/storage. Do not point this form at the existing technology-assessment route: that route is not deployed on Pages and its server field whitelist is for a different assessment.

## Behaviour

Only contact information, a service selection and permission to respond are required. Conditional service fieldsets are disabled while hidden, and the summary model independently excludes deselected service fields. Uncertain product details and approximate quantities are accepted. No specific customer is named or preselected on the public page.

The review button is initially disabled and is enabled only after the JavaScript handlers are installed. A no-JavaScript visitor can use the displayed sales email; there is no native form POST that could disclose their answers to the static host.

## Verification

```sh
node --check forms/dynamics-training-licensing/form.mjs
node --test forms/dynamics-training-licensing/model.test.mjs
node scripts/validate-site.mjs
node scripts/validate-theme.mjs
```

Browser checks: required fields and error-summary links; each conditional branch; deselected data omitted from review; changed answers require a fresh review; copy/download include the complete summary; mobile width from 320 px; both themes; Resources/mobile/search links. Do not send a live enquiry or email during automated tests.
