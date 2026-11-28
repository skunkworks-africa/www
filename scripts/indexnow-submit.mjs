/**
 * Notify participating IndexNow search engines after a successful GitHub Pages deployment.
 * The IndexNow verification key is a public proof-of-ownership token, hosted at the site root.
 * A 200/202 response acknowledges submission, not guaranteed indexing.
 */
const key = 'c1f4d8e72a395bc60d4e91f87b2a50c6';
const origin = 'https://www.skunkworks.africa';
const url = origin + '/tools/windows-server-licensing-calculator/';
const keyLocation = origin + '/' + key + '.txt';

async function ensurePublished(location, expected) {
  const response = await fetch(location, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(location + ' returned HTTP ' + response.status);
  if (expected !== null && (await response.text()).trim() !== expected) {
    throw new Error('IndexNow verification file does not match its key.');
  }
}
await ensurePublished(keyLocation, key);
await ensurePublished(url, null);

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'www.skunkworks.africa',
    key,
    keyLocation,
    urlList: [url]
  }),
  signal: AbortSignal.timeout(15000)
});
if (!response.ok) {
  throw new Error('IndexNow submission failed: HTTP ' + response.status + ' ' + (await response.text()).slice(0, 500));
}
console.log('IndexNow accepted calculator URL notification (HTTP ' + response.status + '). This does not guarantee indexing.');
