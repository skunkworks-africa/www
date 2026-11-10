# Reseller applications and KYC implementation

Status: feature-gated applicant frontend/API implementation; NOT a deployed intake or approval service.
The `/resellers/` page is an explicit, browser-memory-only preview. It makes no submission,
upload, analytics or storage calls. Do not enable collection until the release checks pass.

## Accountability and approval policy

Sales Agents owns application management, assignment, KYC evidence review, maintenance,
follow-up and onboarding. Bind access to the verified Entra group OBJECT ID, not its name.
The group ID, group type, current owners and membership are not verified yet. A security
group is not automatically a Teams team or a Microsoft 365 group.

Final approval requires every distinct current human owner of Sales Agents AND Raydo AND
Maria. Deduplicate identities where a named principal is also an owner. This conservative
interpretation requires all approvers, never first response wins. Resolve owners at approval
creation and again before activation. Block on empty/failed/partial resolution, disabled users,
non-user owners or unresolved identities. If owners change, invalidate the request and create
a new approval version. An owner's group role does not itself grant Dataverse privileges.

Use Power Automate Approve/Reject – Everyone must approve assigned to explicit resolved
users, not to the group address. Store approval ID, application version, required approver
snapshot, authenticated actor, outcome, timestamp and comments. Reject ends that round;
needs-information returns to remediation. A changed application or document invalidates all
prior approvals. Never trust a client-supplied status, score, actor or approval outcome.

## Verified discovery, 1 November 2026

- Repository: skunkworks-africa/www; static GitHub Pages.
- Dynamics URL from supplied screenshot: https://sw.crm14.dynamics.com (tenant association
  still needs verification).
- Connected Teams tenant differs from `auth/config.js`; do not reuse the operator app/token.
- Existing Africa team has RevOps - Sales Operations and RevOps - Dynamics 365 channels.
  These are STANDARD channels, not verified Sales Agents-only spaces. Do not post KYC or
  applicant details there until membership and information exposure are approved.
- Raydo and Maria were resolved to exact Microsoft 365 user identities through Teams.
  Keep production identifiers in environment configuration, not submitted form fields.
- SharePoint search returned personal OneDrive business documents; `/sites/Africa` was not
  found. No suitable restricted shared KYC site/library or permission boundary is verified.
- Available connectors cannot provision Entra group roles, Dataverse tables, SharePoint list
  schemas/ACLs or Power Automate flows. These are deployment dependencies, not completed work.

## Target architecture

Public www/resellers entry -> feature-gated MSAL applicant UI -> dedicated authenticated Azure Functions applicant API ->
Dataverse Reseller Application -> private SharePoint KYC library -> review and approvals ->
Dynamics Account/Contact activation. Azure Functions is the selected backend; no Netlify.
The existing Azure Functions MCP project now has a separately authenticated reseller operator
endpoint; see edge/azure-operator-gateway/RESELLER-MCP.md. Applicant submit/status API code is implemented but the intake is OFF; live tenant authentication, Dataverse provisioning and private uploads remain unverified or unimplemented. partners.skunkworks.africa is a proposed frontend host, not a provisioned domain. See docs/RESELLER-ACTIVATION.md for the current release gate.

Use applicant identity and record-scoped permissions. An applicant sees only their own
application and evidence requests. Public GitHub Pages must not carry Graph credentials,
Power Automate signed webhook URLs, KYC documents or application data. For the selected Azure Functions
API, build and test authentication, authorisation,
anti-abuse, bounded payloads, idempotency and private upload handling before connection.
Do not expose a generic Graph or SharePoint proxy.

Dataverse is authoritative for workflow status; SharePoint holds documents; Teams is a work
surface for authorised people. Use a service principal/managed identity with narrowly scoped
site permissions. Provision separate member and owner Dataverse group teams and explicit
least-privilege security roles. Do not grant all Sales Agents solution-admin privileges.

## Data model to provision in a managed solution

| Table | Key fields / controls |
| --- | --- |
| sw_resellerapplication | UUID, public reference, applicant subject, company, country, city, business type, registration, contact, product focus, source, payment preference, version, status, assigned agent, next action/due, privacy notice version/time; team owned |
| sw_resellerevidence | Application lookup, document category, opaque drive/item IDs, version/hash, scan status, reviewer, reviewed time, result; no public URL |
| sw_resellerapproval | Application/version, approval ID, approver identity, required approver snapshot, decision/time/reason; append-only service-managed evidence |
| sw_reselleractivity | Application, action, actor, time, next action, due date and completion; auditable |
| Account / Contact | Created or linked idempotently only after approval and signed agreement; registration/country duplicate review; partner status |

Unique constraints: applicant + idempotency key for submissions; application + approval
version + approver for decisions; application ID on downstream account linkage. Use ETags
or transactional version checks to prevent concurrent approvals and edits racing activation.
Restrict status/approval mutations to the workflow service; ordinary reviewers cannot patch
an application directly into Approved or Active. Enable auditing and define retention with
Skunkworks' data owner before live collection. No retention duration is presumed here.

## Workflow states

Draft -> Submitted -> Assigned -> Under review -> Awaiting information -> Under review
-> Pending approval -> Approved -> Agreement/setup -> Active.
Rejected, Withdrawn and Expired are explicit outcomes; remediation starts a new version.
Approved means required people approved complete evidence. Active additionally requires the
signed agreement and account setup. `model.mjs` tests the final activation gate, not a live
service. Call it only from an authenticated service with server-owned persisted evidence.

## Conditional form and evidence

Collect business/contact details first, then verify email/identity before requesting files.
Company: registration and representative authority evidence. Sole trader: trading evidence
and appropriate proprietor verification. International: jurisdiction-specific reviewer
checklist. Credit request: separate finance assessment; reseller approval never grants credit.
Obtain only necessary documents, with a published notice explaining use, access, retention
and contact/rights route. The preview acknowledgement is NOT production privacy consent.
Never infer that reseller onboarding is statutory FICA compliance without a separate scope
assessment. Do not request identity numbers or bank details in the public preview.

Intelligence means explainable checklist selection, duplicate suggestions, missing-field
checks, OCR extraction with confidence and staff confirmation, and suggested follow-up.
No automatic rejection, credit decision or activation by AI. Treat uploaded text as untrusted
content; it must never change workflow instructions. Add OCR only after an approved processing
boundary and retention settings exist.

## Power Automate flow build specification

1. Intake: server validation, identity ownership, notice/version and idempotency check; persist
   application; assign Sales Agents owner team and individual agent; create follow-up due next
   business day (Africa/Johannesburg; maintain a business holiday calendar).
2. Evidence: authenticated short-lived, application-scoped upload; allow-listed PDF/JPEG/PNG,
   maximum 10 MB each and 10 files; validate signatures, not just extensions; quarantine and
   malware scan; block reviewers/downloads while pending or failed. Do not create anonymous
   SharePoint sharing links. Audit access. Reject cross-application item IDs.
3. Review: staff verify required evidence and log reasons; request missing information via a
   secure applicant link. Do not attach documents to email or Teams cards.
4. Approval: freeze version; resolve group owners plus named principals; persist exact roster;
   use Everyone must approve; 7-day expiry requires a new review, never implied approval.
   On response verify trusted approval service, actor, version and request correlation.
5. Activation: recheck owner roster, all votes, evidence scan/review and signed agreement;
   create/link Dynamics records transactionally/idempotently. No unrelated privileges granted.
6. Follow-up: scheduled business-day run reminds assignee of overdue tasks; escalates to group
   owners after two business days. Persist notification keys to avoid duplicate reminders.
7. Operations: retries/backoff for throttling, dead-letter queue for exhausted failures,
   reconciliation for partially completed records and alerting without PII in logs.

Teams cards should contain reference, stage, due date and authenticated record link only.
Choose a Sales Agents-restricted channel after verifying membership; existing standard
RevOps channels can hold process documentation only. Do not post unsolicited announcements.

## Release and acceptance checklist

- [ ] Verify Dynamics, Entra, Teams and SharePoint belong to the intended tenant.
- [ ] Resolve Sales Agents object ID/type and owners; verify Raydo and Maria permissions.
- [ ] Provision restricted SharePoint library; test agent access and outsider denial, including
      inherited site access and sharing links; choose retention, versioning and sensitivity.
- [ ] Provision Dataverse solution, member/owner roles, authenticated applicant portal and flows.
- [ ] Publish approved privacy notice, agreement and country-specific evidence rules.
- [ ] Test applicant A cannot read/upload applicant B data; removed agent loses access.
- [ ] Test malicious uploads, oversized payloads, throttling, replay, expired links and retries.
- [ ] Test rejection, absent approver, owner change, stale version, duplicate callback and
      missing/failed scan all prevent activation; only full fresh approval succeeds.
- [ ] Test end-to-end Dynamics record, SharePoint evidence, Teams approval and follow-up with
      synthetic data in staging; verify mobile keyboard, errors, loading and success states.
- [ ] Only then replace preview with verified portal link and publish/index production intake.

## Microsoft implementation references

- https://learn.microsoft.com/en-us/power-platform/admin/manage-group-teams
- https://learn.microsoft.com/en-us/power-automate/all-assigned-must-approve
- https://learn.microsoft.com/en-us/power-automate/group-approvals
- https://learn.microsoft.com/en-us/power-pages/admin/add-custom-domain
