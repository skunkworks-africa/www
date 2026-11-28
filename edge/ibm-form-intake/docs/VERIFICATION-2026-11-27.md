# Local verification — 27 November 2026

Source base: `skunkworks-africa/www`, `origin/main` commit `8a8b1896f3a2d604d983634e108e4a6b3b4fe744`. Work was prepared in isolated branch `draft/ibm-form-intake-20261127`.

## Observed

| Check | Result |
| --- | --- |
| `npm test` on Node `v24.22.3` | 35 passed, 0 failed. |
| `npm exec --yes --package=node@22 -- node --test tests/*.test.mjs` on Node `v22.23.5` | 35 passed, 0 failed. |
| Function entry-point syntax | Passed after enabling HTTP streaming. |
| `npm audit --omit=dev --json` | No known vulnerabilities reported by the registry at the time of the check. |
| `host.json`, `package.json`, disabled app-settings template | Valid JSON. |
| APIM policy template | Well-formed XML; not a validation by the APIM policy engine. |
| `git diff --cached --check` | Passed. |
| Public form and existing operator/reseller implementation | Unmodified. New files confined to `edge/ibm-form-intake/`. |

The 35 tests cover all 72 existing form rows (71 named fields plus the excluded preview privacy row), canonicalisation, unknown properties, type/bounds and product/metric checks, explicit reviewed online privacy version, actual-byte request limits, exact origins, cryptographically signed trust-boundary cases, concurrent idempotent creation and persistence failures. All customer data and identity values in tests are synthetic. Test JWTs use locally generated ephemeral signing keys and never contact a live identity provider.

## Not established by these checks

No Azure login, subscription ownership, resource provisioning, managed-identity/RBAC assignment, actual Dataverse schema/role, Function-host startup, APIM policy deployment or rate-limit behaviour was established by this work. No public submission, email, IBM transaction or deployment was performed. The existing form remains a local-download preview.

The service must remain disabled until the target and integration acceptance criteria in `DEPLOYMENT.md` have been observed. A correct code path and passing mock tests are not evidence of a working cloud integration.
