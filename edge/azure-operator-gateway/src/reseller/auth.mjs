import {createRemoteJWKSet,jwtVerify} from 'jose';
export function createVerifier(resolveKeys=url=>createRemoteJWKSet(url)) {
  const keys=new Map();
  return async (token,c)=>{
    if(!keys.has(c.tenant))keys.set(c.tenant,resolveKeys(new URL('https://login.microsoftonline.com/'+c.tenant+'/discovery/v2.0/keys')));
    const {payload}=await jwtVerify(token,keys.get(c.tenant),{audience:c.audience,issuer:'https://login.microsoftonline.com/'+c.tenant+'/v2.0',algorithms:['RS256'],requiredClaims:['exp','iat','oid','tid','scp','azp'],clockTolerance:30});
    return payload;
  };
}
