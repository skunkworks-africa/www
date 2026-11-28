import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair, SignJWT} from 'jose';
import {createGatewayVerifier} from '../src/gateway-auth.mjs';
import {loadConfig} from '../src/config.mjs';
import {env} from './helpers.mjs';

const config = loadConfig(env).gateway;
const {privateKey, publicKey} = await generateKeyPair('RS256');
const verify = createGatewayVerifier(config, {keySet: publicKey});
async function token(overrides = {}, signingKey = privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({tid: config.tenant, oid: config.objectId, azp: config.clientId, idtyp: 'app', aud: config.audience, iss: `https://login.microsoftonline.com/${config.tenant}/v2.0`, iat: now, nbf: now - 1, exp: now + 300, ...overrides})
    .setProtectedHeader({alg: 'RS256'}).sign(signingKey);
}

test('accepts only a cryptographically valid token for the exact gateway and dedicated API', async () => {
  await verify(await token());
  await verify(await token({iss: `https://sts.windows.net/${config.tenant}/`, azp: undefined, appid: config.clientId}));
});

test('rejects wrong tenant, audience, gateway identity, delegated scope and expiry', async () => {
  for (const overrides of [
    {tid: '55555555-5555-4555-8555-555555555555'},
    {aud: 'https://management.azure.com/'},
    {oid: '55555555-5555-4555-8555-555555555555'},
    {azp: '55555555-5555-4555-8555-555555555555'},
    {scp: 'Azure.Read'}, {idtyp: 'user'}, {exp: Math.floor(Date.now() / 1000) - 300},
    {iss: 'https://evil.example/'}, {exp: undefined}
  ]) await assert.rejects(() => token(overrides).then(verify));
  const other = await generateKeyPair('RS256');
  await assert.rejects(() => token({}, other.privateKey).then(verify));
});
