# Company member profiles

The homepage directory appears immediately before `#contact`. Clicking a member name or job title opens the shareable hash view `/#company/<member-slug>`, with a back link to `/#team`. This approach works with the existing static GitHub Pages site and does not require a router or additional hosting.

## Editing members

Update `team-members.mjs`. Each record has an immutable slug, display name, approved title, summary, biography, focus skills, role details, and optionally a public professional link. The directory and detailed view are both generated from this single source. Avoid direct email, phone numbers, unconsented personal images or speculative certifications.

## Source review before publication

Profiles below were seeded from publicly available professional and company listings. **The team owner should confirm that each person is currently affiliated, agrees to appear publicly, and approves their title and biography before merge.** The skill chips describe role-aligned focus areas; they are not independently verified certifications.

- **Raydo Matthee:** [Public professional profile](https://za.linkedin.com/in/raydo-matthee) and existing Skunkworks company leadership information.
- **Isabel Alvim Swart:** [Skunkworks Academy company listing](https://www.signalhire.com/companies/skunkworks-pty-ltd) (Training Coordinator).
- **MJ Adão-Dercksen:** [Skunkworks Academy company publication](https://za.linkedin.com/company/skunkworksacademy) (Training Coordinator, Portugal).

These sources do not prove that job titles are still current. Do not import other people from third-party directory snapshots without review.

## Acceptance checks

1. Run `node --check team.js && node --check team-members.mjs && node scripts/validate-team.mjs`.
2. Verify both desktop and mobile layouts at `/#team` using light, dark and manual-theme settings.
3. Click a person's **name** and **job title**, confirming the exact hash `/#company/<slug>` opens their detailed profile.
4. Paste `/#company/raydo-matthee` in a new tab; confirm it opens directly and the browser Back button restores the directory.
5. Test `/#company/unknown` and ensure a courteous not-found view, not a blank page.
6. Navigate to `/#contact` and verify the existing sales and assessment calls to action remain functional.
7. Verify screen-reader headings, keyboard focus, Escape menu behaviour, reduced motion and minimum 320 px width.

Changes use black/white adaptive CSS variables and central business enquiry routing.
