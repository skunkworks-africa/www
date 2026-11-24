// Public health/auth-boundary checks only. Never accepts or prints a bearer token.
const base='https://func-skunkworks-operator-prod-c0c0gzc2asgmfpa4.southafricanorth-01.azurewebsites.net';
const expectedTenant='338a8916-80d9-467c-a94a-7f61d04ef7d5';
let failed=false;
for(const path of ['/.well-known/oauth-protected-resource','/.well-known/oauth-protected-resource/api/mcp']) {
  const r=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(20000)});
  const m=await r.json();const ok=r.status===200&&m.resource===base+'/api/mcp'&&m.authorization_servers?.includes('https://login.microsoftonline.com/'+expectedTenant+'/v2.0');
  console.log(JSON.stringify({path,status:r.status,expectedTenantMatch:ok}));failed ||= !ok;
}
for(const invalid of [false,true]) {
  const r=await fetch(base+'/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',...(invalid?{Authorization:'Bearer invalid-health-test'}:{})},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'}),redirect:'error',signal:AbortSignal.timeout(20000)});
  const ok=r.status===401&&r.headers.get('www-authenticate')?.includes('/.well-known/oauth-protected-resource');
  console.log(JSON.stringify({path:'/api/mcp',invalidToken:invalid,status:r.status,challengePresent:!!r.headers.get('www-authenticate')}));failed ||= !ok;
}
console.log('Authorised tool calls, managed identity RBAC and Microsoft 365 permissions are NOT verified by these probes.');
if(failed)process.exitCode=1;
