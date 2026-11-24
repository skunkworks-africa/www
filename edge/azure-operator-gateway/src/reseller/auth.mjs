import {createRemoteJWKSet,jwtVerify} from 'jose';
// The applicant boundary can use a separately verified Entra External ID issuer.
// Operator and infrastructure boundaries retain their original workforce issuer.
export function createVerifier(resolveKeys=url=>createRemoteJWKSet(url)) {
  const keys=new Map();
  return async (token,c)=>{
    const issuer=c.issuer||'https://login.microsoftonline.com/'+c.tenant+'/v2.0';
    const jwksUrl=c.jwksUrl||'https://login.microsoftonline.com/'+c.tenant+'/discovery/v2.0/keys';
    if(!keys.has(jwksUrl))keys.set(jwksUrl,resolveKeys(new URL(jwksUrl)));
    const {payload}=await jwtVerify(token,keys.get(jwksUrl),{
      audience:c.audience,issuer,algorithms:['RS256'],
      requiredClaims:['exp','iat','oid','tid','scp','azp'],clockTolerance:30
    });
    return payload;
  };
}
export function applicantIssuerConfig(env) {
  const tenant=env.RESELLER_APPLICANT_TENANT_ID;
  const issuer=env.RESELLER_APPLICANT_ISSUER||'';
  const jwksUrl=env.RESELLER_APPLICANT_JWKS_URL||'';
  if(!issuer&&!jwksUrl)return {tenant,audience:env.RESELLER_APPLICANT_AUDIENCE};
  if(!issuer||!jwksUrl)throw new Error('Applicant issuer/JWKS pair incomplete');
  for(const address of [issuer,jwksUrl]){
    const u=new URL(address);
    if(u.protocol!=='https:'||u.username||u.password||u.port||u.search||u.hash||!/^[a-z0-9-]+\.ciamlogin\.com$/i.test(u.hostname))throw new Error('Untrusted applicant authority');
  }
  const iss=new URL(issuer),jwks=new URL(jwksUrl);
  if(iss.pathname.replace(/\/$/,'')!=='/'+tenant+'/v2.0')throw new Error('Applicant issuer tenant mismatch');
  if(jwks.pathname!=='/'+tenant+'/discovery/v2.0/keys')throw new Error('Applicant signing key endpoint mismatch');
  return {tenant,audience:env.RESELLER_APPLICANT_AUDIENCE,issuer,jwksUrl};
}
