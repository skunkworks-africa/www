# Skunkworks Windows Server 2025 Core Licensing Calculator

Public route: https://www.skunkworks.africa/tools/windows-server-licensing-calculator/

## Overview

A free, mobile-first, browser-based Windows Server licensing estimator for Skunkworks Africa.
This implementation is original and uses the shared corporate header, footer, theme
initialisation and the canonical Skunkworks Design System semantic CSS tokens.
No third-party hardware-vendor branding, scripts or fonts are used.

## Licensing models

- Physical cores: count all physical cores, subject to 8 per physical processor and 16 per physical server. Physical totals are rounded to available 2-core purchase units.
- Standard, physical: a full licensing layer covers two OSEs. A physical OSE used only to host and manage guest OSEs can have additional use rights. Additional Windows Server VMs require full additional core layers in increments of two guest OSEs.
- Datacenter, physical: a fully licensed physical server has unlimited virtualisation rights.
- Virtual cores: only for qualifying subscription licences or licences with active Software Assurance. Assign at least 8 core licences to each virtual OSE; apply a 16-core minimum per customer to the estate entered in the calculator. Datacenter virtual-core licensing does not imply unlimited VMs.
- Standard purchase units: 2-core and 16-core packs, displayed as equivalents. Actual available SKUs, channel terms, bundles and licence assignments must be validated by Skunkworks sales.
- The virtual-core minimum across the customer is evaluated using ONLY the included estimate. If the customer has other licensed Windows Server VM workloads outside this estimate, the estimate may overstate the extra purchase units needed to meet the customer minimum.

### Outside scope

Client Access Licences (CALs), Remote Desktop Services, external user connectors, failover and disaster-recovery rights, VM mobility, mixed server editions and licensing agreements, Azure Arc pay-as-you-go, Azure Hybrid Benefit, Azure editions, OEM-specific SKUs, taxes and prices. They require a licensing review.

Official source: https://www.microsoft.com/licensing/guidance/Windows-Server-2025
Binding terms: https://www.microsoft.com/licensing/terms/

## Architecture

- index.html: crawlable HTML, server-side-like static metadata, calculator form and educational content.
- calculator.css: responsive styles, accessible focus states, printing and corporate/brand tokens.
- licensing-engine.mjs: independent, DOM-free, deterministically tested calculation logic.
- calculator.mjs: dynamic server configuration, validation, comparison, CSV, print-to-PDF and mailto quotation request.
- analytics.mjs: optional GTM after explicit consent.
- licensing-engine.test.mjs: Node unit tests, covering host minima, virtualization, packing and injection protection.

No server component is required for calculations, and configuration is not persisted on a server.
The quote action opens the user's email client; it DOES NOT create or submit an online form or Dynamics lead.
A protected Azure Functions + Dynamics/Dataverse quote endpoint is an optional future integration, requiring a deployed API, consent statement, spam controls and approved identity.

## Run & test

From repository root:

    node --check tools/windows-server-licensing-calculator/licensing-engine.mjs
    node --check tools/windows-server-licensing-calculator/calculator.mjs
    node --check tools/windows-server-licensing-calculator/analytics.mjs
    node --test tools/windows-server-licensing-calculator/licensing-engine.test.mjs
    node scripts/validate-windows-server-calculator.mjs

Open via an HTTP static server rooted at the repo; do not open index.html as a file because absolute root paths are used.

### Browser release QA

Check widths 320, 375, 768, 1024 and 1440 pixels; keyboard controls; screen reader field labels; manual dark/light and system mode; no overflow on mobile; multiple host add/remove; invalid values; Standard 2/4/6 VM stacking; Datacenter many VMs; virtual-core eligibility; print/PDF output; CSV injection test and quote mailto. Review accessibility manually; static checks are not a substitute for WCAG 2.2 AA testing.

## Google, Bing, IndexNow, analytics

- Self-canonical URL, meta description, Open Graph and X cards, SoftwareApplication/BreadcrumbList JSON-LD and sitemap entry ship with the page.
- The corporate root robots.txt already declares the canonical sitemap.
- IndexNow key is hosted at the site root. The separate indexnow.yml workflow runs after a successful GitHub Pages deployment, checks that both the key file and calculator URL are live, then submits a URL notification to IndexNow. Successful notification does not guarantee indexing.
- Verify the www.skunkworks.africa property in Google Search Console and Bing Webmaster Tools; submit sitemap.xml, inspect the URL and monitor crawl/coverage reports. These account-level steps require authorized credentials and are not done automatically.
- GA4/GTM is OFF by default. To activate, add an approved metadata tag to the page head:

      <meta name="skw-gtm-id" content="GTM-XXXXXXX">

  Configure GA4 and conversion events in that GTM container. Do not add direct gtag.js plus GTM, to avoid duplicate events. The calculator requests explicit optional analytics consent before loading GTM. Only coarse action event names are sent: skw_calculator_calculated, skw_calculator_csv_download, skw_calculator_print, skw_calculator_copy and skw_calculator_quote_click. No host labels, VM counts, core counts, email addresses or PII are sent to GTM by this application. GTM must itself be configured to honour privacy and consent rules.
- Account registration, tag configuration, business verification, advertisements and earned backlinks require external action and are not implied by the code.

## Operations

GitHub Pages deploys the main branch via .github/workflows/static.yml.
Quality gates run under .github/workflows/site-quality.yml.
Review/merge the PR, observe Pages deployment, smoke-test the deployed URL and request search indexing.
Do not change the site's canonical host, CNAME, navigation order or existing corporate theme rules.
