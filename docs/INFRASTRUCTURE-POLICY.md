# Infrastructure policy

User requirement confirmed 1 November 2026: GitHub and Microsoft infrastructure only for this project's implementation and deployment.

- Source, reviews and CI/CD: GitHub repositories and GitHub Actions.
- Corporate static frontend: GitHub Pages; Microsoft Azure hosting may be used when explicitly required.
- APIs and MCP: Azure Functions.
- Identity: Microsoft Entra; verify tenant and runtime permissions before enabling intake.
- Application records: Dynamics 365 / Dataverse.
- KYC: private Azure Storage quarantine, Microsoft Defender for Storage scanning, restricted SharePoint document storage.
- Workflow and staff collaboration: Power Automate / Azure services and Microsoft Teams.
- Secrets and monitoring: Azure Key Vault, Azure Monitor and Application Insights.

Do not introduce Vercel, Netlify, Cloudflare Workers, Resend or other non-Microsoft/GitHub hosted runtime, preview, form-processing or delivery services for this implementation. Existing legacy references are not approval to use those services. Replace any active legacy dependencies through a separately verified migration; documentation alone does not remove external integrations.

This policy does not assert that Azure resources are provisioned, permissions are granted, integrations are removed or the reseller service is production-ready. Maintain the documented release gates and disabled intake until end-to-end validation succeeds.
