import {createRemoteJWKSet, jwtVerify} from 'jose';

export function createGatewayVerifier(config, {keySet} = {}) {
  const keys = keySet ?? createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${config.tenant}/discovery/v2.0/keys`), {
    timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 600000
  });
  return async token => {
    const {payload} = await jwtVerify(token, keys, {
      audience: config.audience,
      issuer: [`https://login.microsoftonline.com/${config.tenant}/v2.0`, `https://sts.windows.net/${config.tenant}/`],
      algorithms: ['RS256'], requiredClaims: ['exp', 'iat', 'nbf', 'tid', 'oid'], clockTolerance: 30
    });
    const caller = payload.azp ?? payload.appid;
    // An app-only token from the exact dedicated gateway identity is required.
    // A customer, operator or reseller access token is not accepted here.
    if (payload.tid !== config.tenant || payload.oid !== config.objectId || caller !== config.clientId || payload.scp !== undefined || (payload.idtyp !== undefined && payload.idtyp !== 'app')) {
      throw new Error('Gateway access required');
    }
  };
}
