# Favicon search readiness

This implementation gives Bing and other search crawlers explicit favicon signals while reusing the existing Skunkworks Africa brand assets.

## Search-result favicon strategy

- Use the existing high-contrast icon-only asset at `/assets/favicon-black.ico` as the primary favicon.
- Use `/assets/favicon-black.png` as the large PNG icon source for modern browsers, manifests, crawlers and structured data.
- Use `/favicon.svg` as an accessible vector fallback for browsers that support SVG favicons.
- Avoid the full Skunkworks wordmark for favicon display because the text becomes unreadable in small search-result surfaces.

## Files changed

- `index.html`
  - Adds explicit favicon, PNG, Apple touch icon and manifest links.
  - Adds Microsoft tile metadata.
  - Adds a `logo` field to the Organization JSON-LD object.
- `site.webmanifest`
  - Defines Skunkworks Africa app/search icon metadata.
- `favicon.svg`
  - Adds a root-level SVG fallback icon.
- `robots.txt`
  - Explicitly allows crawler access to favicon and manifest assets.

## Deployment validation

After deployment, verify these URLs return `200 OK`:

- `https://www.skunkworks.africa/assets/favicon-black.ico`
- `https://www.skunkworks.africa/assets/favicon-black.png`
- `https://www.skunkworks.africa/assets/favicon-black_350px.png`
- `https://www.skunkworks.africa/favicon.svg`
- `https://www.skunkworks.africa/site.webmanifest`

Then request recrawling in Bing Webmaster Tools for `https://www.skunkworks.africa/`.
