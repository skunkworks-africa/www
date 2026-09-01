import assert from 'node:assert/strict';
import { storefrontDestination } from './worker.mjs';

const destination = (url, method = 'GET') =>
  storefrontDestination(new Request(url, { method }))?.toString() || null;

assert.equal(
  destination('https://skunkworks.africa/products/x?gclid=abc&utm_source=google&utm_campaign=spring'),
  'https://store.skunkworks.africa/products/x?gclid=abc&utm_source=google&utm_campaign=spring'
);
assert.equal(
  destination('https://skunkworks.africa/fr/collections/hp?utm_medium=cpc'),
  'https://store.skunkworks.africa/fr/collections/hp?utm_medium=cpc'
);
assert.equal(
  destination('https://skunkworks.africa/zh'),
  'https://store.skunkworks.africa/zh'
);
assert.equal(destination('https://skunkworks.africa/checkouts/cn/session/en-za?key=secret'), null);
assert.equal(destination('https://skunkworks.africa/pt/checkouts/cn/session/en-za'), null);
assert.equal(destination('https://skunkworks.africa/about'), null);
assert.equal(destination('https://skunkworks.africa/training'), null);
assert.equal(destination('https://www.skunkworks.africa/products/x'), null);
assert.equal(destination('https://skunkworks.africa/products/x', 'POST'), null);

console.log('Storefront redirect tests passed.');
