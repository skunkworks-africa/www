# Reseller MCP extension — Azure Functions

This extends the existing Azure Functions project. It does not use Netlify and does not
replace the Azure inventory MCP with Microsoft's Azure MCP Server 3.0. That Microsoft server
is separate developer/operations tooling; our project implements domain-specific tools.

## Routes and current release state

- Existing `/api/mcp`: infrastructure tenant; two ARM inventory read tools, unchanged.
- New `/api/reseller/mcp`: independently configured Microsoft 365 authentication boundary.
- New `/.well-known/oauth-protected-resource/api/reseller/mcp`: matching discovery.
- Disabled (503) unless all required configuration is present AND `RESELLER_MCP_ENABLED=true`.
- No public applicant submissions, KYC uploads, notifications, approval writes or activation.
  Frontend remains a non-submitting preview. This is an operator extension, not a complete portal.

## Implemented tools

| Tool | Scope | Behavior |
| --- | --- | --- |
| reseller_readiness | Reseller.Read | Current group access + Dataverse WhoAmI; explicitly reports intake disabled |
| list_reseller_applications | Reseller.Read | Up to 50 references/stages/follow-ups owned by configured Dataverse team |
| get_reseller_review | Reseller.Read | One team-owned record, ETag and deduplicated owner/Raydo/Maria approver roster |
| set_reseller_follow_up | Reseller.Read + Reseller.Manage | Four allowed follow-up actions, future UTC due date within 90 days, If-Match ETag and authenticated actor |

Each call resolves the current Sales Agents group and direct human members/owners through
Graph. Disabled users and guests are denied. Missing/failed owner or member reads fail closed.
Nested-group members are not supported in this release. Operators cannot use Azure.Read to
access reseller data; token client ID, issuer, audience, expiry, tenant, OID and scopes are
validated. Only configured OAuth clients are accepted. No token or business payload logging.

Graph v1.0 currently may omit service-principal group owners. The returned roster is review
assistance, NOT an authoritative final approval decision. Human-only ownership and a complete
owner roster must be verified before implementing final approvals. `canActivate` is always false.

## Configuration (server-side only; no secrets in the site)

| Setting | Required value |
| --- | --- |
| RESELLER_MCP_ENABLED | false until staging verification; true opts in |
| RESELLER_TENANT_ID | Verified Microsoft 365/Dataverse tenant UUID |
| RESELLER_API_AUDIENCE | Actual v2 API access-token audience for dedicated reseller registration |
| RESELLER_RESOURCE_URL | Exact HTTPS endpoint ending `/api/reseller/mcp` |
| RESELLER_CLIENT_IDS | Comma-separated allowed confidential/SPA OAuth client UUIDs |
| RESELLER_SALES_GROUP_ID | Verified Sales Agents security-enabled Entra group UUID |
| RESELLER_RAYDO_OID / RESELLER_MARIA_OID | Distinct active internal user UUIDs in that tenant |
| RESELLER_MANAGED_IDENTITY_CLIENT_ID | Dedicated user-assigned managed identity client ID |
| RESELLER_DATAVERSE_URL | Verified root environment URL, e.g. https://sw.crm14.dynamics.com |
| RESELLER_OPERATOR_TEAM_ID | Dataverse group team UUID owning reseller application rows |

Use an Entra API registration in the verified Microsoft 365 tenant, exposing Reseller.Read
and Reseller.Manage. Register exact MCP client callbacks. The resource metadata uses these
short scope values: verify client consent and resource scope identifiers during integration.
These are separate from the existing Azure operator registration and Azure.Read scope.

## Permissions and tenant boundaries

The live Azure endpoint advertises tenant `338a8916-80d9-467c-a94a-7f61d04ef7d5`.
Connected Teams reports `972e8de4-e365-43a3-99ec-c86a0cc249e8`. Do not replace the infrastructure
tenant blindly, reuse object IDs across tenants, or broaden issuer validation to `common`.

Runtime calls use ManagedIdentityCredential, with no developer-credential fallback. They
also reject Azure-issued downstream tokens whose tenant differs from RESELLER_TENANT_ID.
An identity in the existing infrastructure tenant does not automatically gain Graph/Dataverse
access in the M365 tenant. A straightforward release target is a separate Function App in
the verified M365 tenant using this same project, configuring only the reseller endpoint.
Keeping both in the existing app would require a separately reviewed cross-tenant workload
federation adapter and service principal consent; that adapter is NOT implemented here.
No production app/identity move or permission grant has been made.

| Principal | Minimum intended permissions | Verification still needed |
| --- | --- | --- |
| Existing inventory MI | ARM Reader on dedicated RG | Current effective assignments and authorised read |
| Dedicated reseller MI | Graph GroupMember.Read.All plus User.Read.All for active/internal user validation | Admin consent in intended tenant; successful directory reads |
| Dedicated reseller MI | Dataverse application user + custom role for reseller table read and follow-up write | Table/team scope, auditing and protected approval columns |
| Sales Agents | Group-based CRM review permissions | Exact group ID/type, direct members, owners and licensing |
| Future document service | Selected SharePoint site permission with explicit site grant | Restricted site/library, sharing and scan controls |

Graph permissions are application permissions and tenant-wide read permissions; scope their
use in code to this group and use a dedicated identity. No Graph write permission is needed.
ARM Reader is not a Graph permission. Existing Teams connector access proves neither service
principal consent nor the Azure runtime's Microsoft 365 access.

## Dataverse schema contract

Provision `sw_resellerapplications` with primary key `sw_resellerapplicationid`, text columns
`sw_reference`, `sw_stage`, `sw_nextaction`, `sw_lastoperatoroid`, integer `sw_version`, and
DateTime `sw_nextactiondue`. Ownership is `_ownerid_value`; optimistic concurrency must be
available with `@odata.etag`. Stage is a TEXT code in this contract, not a guessed Choice value.
Allowed follow-up stages: submitted, assigned, under_review, awaiting_information,
pending_approval, approved. Rejected/withdrawn/active rows cannot be changed by this tool.
Server-generated `sw_lastoperatoroid` is updated atomically with the follow-up; enable native
Dataverse auditing on these columns. Approval columns must not be writable by this app role.
Table provisioning and auditing are deployment prerequisites, not yet performed.

## Verification

`npm ci && npm test` in this folder runs adapter, policy, HTTP and real signed JWT tests.
`node scripts/verify-live.mjs` tests only public discovery and negative authentication.
`scripts/verify-permissions.sh` performs read-only Azure CLI inventory and permission checks;
run using the existing OIDC workflow or an authenticated administrator session. It does not
print tokens or app-setting values. Read failures must be investigated, never treated as grants.

Before release test valid delegated tools/list and tools/call; wrong tenant/audience/client/
OID/scope; removed/disabled agents; cross-team records; stale ETags; Graph outages and tenant
mismatch; live Dataverse updates/audit with synthetic records. Confirm SharePoint isolation
and the final human approval service separately before connecting applicant intake.

Official references:
- https://learn.microsoft.com/en-us/graph/api/group-list-owners?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/power-platform/admin/manage-group-teams
- https://learn.microsoft.com/en-us/power-apps/developer/data-platform/authenticate-oauth
- https://devblogs.microsoft.com/azure-sdk/azure-mcp-server-3-0-stable-release/
