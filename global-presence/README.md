# Global presence map

- Geographic dataset: Natural Earth, 1:110m Admin 0 Countries.
- Source: https://github.com/nvkelso/natural-earth-vector/blob/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_110m_admin_0_countries.geojson
- Public domain terms: https://www.naturalearthdata.com/about/terms-of-use/
- The locally stored JSON retains the source polygon rings, Natural Earth country codes and label positions; coordinates are rounded to 0.001 degrees for compact delivery. Natural Earth boundaries are cartographic, not authoritative legal or territorial assertions.
- The geographic world map and WebGL globe share one local texture. Market markers use the same forward projection as the globe renderer; markers are indicative market locations, not verified premises.
- No API key, external tiles, analytics or map CDN is required. Browsers without WebGL use the interactive 2D geographic map. A searchable static directory remains available if geographic data cannot load or JavaScript is disabled.

## Tests

Run `node --test global-presence/map.test.mjs` for geography, projection, filtering and clustering checks. The dedicated browser workflow installs pinned Playwright and Chromium to verify responsive rendering and the non-WebGL fallback.
