# Reseller portal activation runbook — GitHub + Microsoft only

**State: NOT LIVE.** This repository contains a feature-flagged applicant UI and an Azure Functions intake API. It does **not** establish tenant consent, Dataverse tables, Azure deployment, malware scanning, Power Automate approvals or production access. Leave `resellers/portal-config.mjs` `enabled:false` and `RESELLER_INTAKE_ENABLED=false` until the release owner signs off.

## 1. Identity boundaries

- Use a **dedicated Microsoft Entra External ID tenant** for self-service customer/reseller registration, or document an approved workforce-federated alternative. The current corporate operator tenant is **not** an acceptable default for global external applicants.
- Create an applicant SPA registration and applicant API registration in that tenant, exposing the delegated `Reseller.Apply` scope. Do not reuse the existing Azure operator or reseller-staff registrations. Register `https://skunkworks.africa/resellers/` and the actual `www` canonical redirect URI if both are offered; configure one canonical origin and exact CORS rules in Azure.
- Verify Entra metadata and persist the **exact** access-token issuer and JWKS URI in server-side `RESELLER_APPLICANT_ISSUER` and `RESELLER_APPLICANT_JWKS_URL`. The API validates both against the configured tenant and Microsoft `ciamlogin.com` authorities. Never set `common` or accept Graph access tokens for this API.
- For staff, separately resolve the actual Microsoft 365 tenant, Sales Agents security-group object ID and every current human owner, plus Raydo and Maria; verify access for disabled/removed people fails. Do not copy object IDs across tenants.
- The public `portal-config.mjs` may contain only client/tenant IDs, API origin, delegated scope, authority and notice version. No secrets.

## 2. Dataverse schema and permissions

Provision a **managed solution** in the verified Dynamics environment. Entity set `sw_resellerapplications`, primary ID `sw_resellerapplicationid`, team ownership and auditing enabled.

| Column (logical name) | Type / intent |
| --- | --- |
| sw_reference | Text, 40+; unique public reference |
| sw_stage | Text: initial value `submitted` |
| sw_version | Whole number, initial 1 |
| sw_applicanttenant / sw_applicantoid | Text 36, applicant identity |
| sw_submissionhash | Text 64, idempotency hash |
| sw_company | Text 160 |
| sw_country | Text 2, ISO code |
| sw_businesstype | Text 16 |
| sw_registration | Text 80, optional for sole traders |
| sw_city | Text 100 |
| sw_website | Text 300, HTTPS URL |
| sw_contactname | Text 120 |
| sw_email | Text 254 |
| sw_phone | Text 40 |
| sw_productfocus | Text 32 |
| sw_paymentpreference | Text 16 |
| sw_leadsource | Text 32 |
| sw_noticeversion | Text 80 |
| sw_acceptedat | DateTime UTC |
| sw_nextaction / sw_nextactiondue / sw_lastoperatoroid | Follow-up fields documented in RESELLER-MCP.md |

Grant the dedicated Azure managed identity narrowly scoped create/read access to the table and owning operator team. Applicant identities receive **no direct Dataverse access**. Preserve `If-None-Match: *` for create-only idempotency. Validate write permissions, audit logs, access isolation and optimistic concurrency with synthetic records.

## 3. Azure deployment

- Confirm the selected Azure subscription actually belongs to the intended Microsoft 365/Dataverse tenant. The previously observed infrastructure tenant and Microsoft 365 tenant differ; don't silently cross that boundary.
- Provision an isolated Azure Function App for applicant intake using approved and compiled infrastructure-as-code. The existing `infra/main.bicep` is explicitly blocked for deployment pending Flex Consumption redesign and cost review.
- Use GitHub Actions OIDC, a narrow deployment identity, environment protection rules, managed identity for runtime, Azure Key Vault, Application Insights/Monitor, HTTPS-only and CORS restricted to the canonical website origin. Never introduce Netlify/Vercel or a public anonymous document store.
- Server config: `RESELLER_INTAKE_ENABLED=false` initially; `RESELLER_PRIVACY_VERSION`, `RESELLER_APPLICANT_TENANT_ID`, `RESELLER_APPLICANT_CLIENT_ID`, `RESELLER_APPLICANT_AUDIENCE`, `RESELLER_APPLICANT_ISSUER`, `RESELLER_APPLICANT_JWKS_URL`, `RESELLER_MANAGED_IDENTITY_CLIENT_ID`, `RESELLER_DATAVERSE_URL`, `RESELLER_OPERATOR_TEAM_ID`.
- Test anonymous/wrong-tenant/wrong-audience/wrong-client/expired/replayed token rejection, duplicate-idempotency handling, unexpected fields, payload size, cross-applicant reads, unavailable dependencies, CORS and request rate limiting.

## 4. Private evidence and approvals — mandatory before general launch

- Build authenticated short-lived private upload authorization to Azure Blob quarantine; 10 MB per file / 10 files; PDF/JPEG/PNG signature verification and account-scoped controls.
- Enable Microsoft Defender for Storage on-upload malware scanning; only trusted clean result for the **exact blob version** can release evidence for staff review. Clean evidence goes to a restricted SharePoint library; failures are never viewable/downloadable.
- Provision Dataverse evidence, activity and approval tables; establish a restricted staff review UI and all-approvers Power Automate flow, plus signed reseller agreement handling. Resolve owners afresh before final activation and audit each approval.
- Add bounded follow-up reminders, alerting, dead-letter/retry operations and operational runbooks. No unreviewed automatic account activation, credit granting or AI rejection.

## 5. Frontend publication and final go/no-go

- The GitHub Pages workflow bundles **Microsoft MSAL Browser v5** (source `scripts/reseller-ui/src/main.js`). No API bearer tokens are embedded in HTML or GitHub secrets; MSAL obtains delegated access tokens after sign-in.
- Keep the public form a preview until the applicant identity flow, upload security, approvals and persistence have passed end-to-end staging tests. Replace the preview acknowledgement with the versioned privacy declaration only on reviewed enablement.
- After all end-to-end acceptance tests, publish verified public config in `resellers/portal-config.mjs` with `enabled:true`, and independently enable the server-side intake flag. Publish the approved privacy notice, remove `noindex` only when ready, and observe logs and error budgets during a controlled rollout.
- Roll back by setting server `RESELLER_INTAKE_ENABLED=false` first, then restoring the last tested UI revision. Do **not** delete Dataverse records or KYC evidence during rollback.

## Outstanding evidence required for sign-off

- Verified External ID tenant, applicant SPA and API app IDs, exact authority/JWKS/scope/redirect details.
- Verified Azure subscription, staging Function App, GitHub OIDC deployment identity and current Azure cost approval.
- Verified Dynamics environment ownership, managed-solution import, Dataverse application user/team roles and end-to-end create/read test.
- Document storage/Defender-for-Storage scan verification, approval roster and full business-process acceptance.
- Signed-off POPIA/privacy notice, retention schedule, vendor agreements and international processing approach.

These are **release blockers**, not steps proven complete by committing code.
