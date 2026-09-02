const STORE_HOST = 'store.skunkworks.africa';
const STORE_ROOTS = new Set([
  'products',
  'collections',
  'cart',
  'search',
  'policies',
  'pages',
  'blogs',
]);
const STOREFRONT_LOCALES = new Set(['fr', 'hi', 'pt', 'zh']);

export function storefrontDestination(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return null;

  const source = new URL(request.url);
  if (source.hostname !== 'skunkworks.africa') return null;

  const segments = source.pathname.split('/').filter(Boolean);
  const first = segments[0] || '';
  const localized = STOREFRONT_LOCALES.has(first);
  const resource = localized ? segments[1] : first;

  // Historical checkout URLs contain session-bound tokens. Shopify must issue
  // a fresh checkout URL from the current storefront rather than rewriting it.
  if (resource === 'checkouts') return null;

  const isLocalizedStoreRoot = localized && segments.length === 1;
  if (!isLocalizedStoreRoot && !STORE_ROOTS.has(resource)) return null;

  source.hostname = STORE_HOST;
  source.protocol = 'https:';
  source.port = '';
  return source;
}

export default {
  async fetch(request) {
    const destination = storefrontDestination(request);
    if (destination) return Response.redirect(destination.toString(), 301);
    return fetch(request);
  },
};
