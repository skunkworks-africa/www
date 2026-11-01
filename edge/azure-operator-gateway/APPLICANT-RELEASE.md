# Applicant service increment — not production ready

Implemented: bearer-token validation using existing signature verifier, dedicated applicant tenant/client/audience and Reseller.Apply scope, POST /api/reseller/applications, GET /api/reseller/applications/{id}, ownership isolation, current privacy notice acceptance, 8 KiB actual body limit, deterministic applicant-scoped idempotency IDs with create-only Dataverse PATCH, minimal status responses. Intake defaults disabled. Applicant sign-in UI and external identity provisioning are not implemented. The verifier currently supports standard Entra tenant issuers; do not assume External ID ciamlogin issuers work without additional implementation and tests.

Required environment: RESELLER_INTAKE_ENABLED (keep false), RESELLER_PRIVACY_VERSION, RESELLER_APPLICANT_TENANT_ID, RESELLER_APPLICANT_CLIENT_ID, RESELLER_APPLICANT_AUDIENCE, RESELLER_MANAGED_IDENTITY_CLIENT_ID, RESELLER_DATAVERSE_URL (origin without trailing slash), RESELLER_OPERATOR_TEAM_ID.

## Dataverse schema contract (not provisioned)

Existing sw_resellerapplication requires sw_reference (text, 40+), sw_stage (text), sw_version (integer), sw_applicanttenant / sw_applicantoid (text, 36), sw_submissionhash (text, 64), sw_company / sw_contactname / sw_email (text, 200), sw_country (text, 2), sw_businesstype (text), sw_noticeversion (text), sw_acceptedat (UTC DateTime). Team-owned, auditing enabled. Runtime create/read rights; applicant identities receive no direct Dataverse role. This is a schema contract, not an importable managed solution.

## Outstanding implementation and release blockers

- Applicant sign-in frontend, conditional-access design, rate limits, CORS and live consent verification.
- Private Azure Blob quarantine uploads with immutable unique object names, bounded sizes and no applicant read/list/tag rights. Defender for Storage scans; trusted results must bind to the exact blob version. Unknown/error/not-scanned is not clean. No uploads are currently accepted.
- Trusted scan-result ingestion, malware rejection, authorised review and transfer of clean evidence to restricted SharePoint. Never expose quarantine URLs or trust applicant-supplied scan verdicts.
- Dataverse managed solution, transactional approval persistence and activation service. lifecycle.mjs only validates trusted inputs; it does not resolve the directory, store decisions or activate accounts. Use atomic compare-and-set against the application version and outbox/idempotency for account creation.
- Scheduled reminders with a durable unique application/version/action key; Teams notifications restricted to verified recipients.
- Monitoring resources, alerts, deployment health tests and live access tests.

## Staging deployment and rollback

Dedicated manual reseller-staging workflow uses GitHub environment OIDC and accepts an immutable commit SHA. It only targets func-skunkworks-reseller-staging, runs tests and verifies disabled intake. Provision the isolated app and environment variables before running. This is code deployment only; it does not create Azure resources, change permissions or create Dataverse tables. No production deployment is supplied yet.

Rollback: keep intake disabled, run the workflow with a previously successful reviewed commit SHA containing this service, verify the closed-intake probe, then run authenticated staging tests before enabling. Schema rollback is separate and must not delete applications or audit evidence. Monitor request failures, authentication denials, dependency latency, scan backlog and approval backlog; do not log tokens, request bodies or documents.

Microsoft scanning reference: https://learn.microsoft.com/en-us/azure/defender-for-cloud/introduction-malware-scanning
