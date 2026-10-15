import { app } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { createRemoteJWKSet, jwtVerify } from 'jose';
const tenant='338a8916-80d9-467c-a94a-7f61d04ef7d5';
const sub='9f19b7fc-4a54-4c11-8cea-239dcf3392a4';
const jwks=createRemoteJWKSet(new URL('https://login.microsoftonline.com/'+tenant+'/discovery/v2.0/keys'));
const credential=new DefaultAzureCredential();
const json=(status,obj)=>({status,jsonBody:obj,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function inventory(req,ctx){
 if(req.method!=='GET')return json(405,{error:'Method not allowed'});
 const audience=process.env.AZURE_OPERATOR_API_AUDIENCE;
 const allowed=(process.env.AZURE_OPERATOR_ALLOWED_USER_OIDS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 if(!audience||!allowed.length)return json(503,{error:'Gateway not configured'});
 const bearer=req.headers.get('authorization')||'';
 if(!/^Bearer [^\s]+$/.test(bearer))return json(401,{error:'Bearer access token required'});
 let claims;
 try{({payload:claims}=await jwtVerify(bearer.slice(7),jwks,{audience,issuer:'https://login.microsoftonline.com/'+tenant+'/v2.0',clockTolerance:30}));}
 catch{return json(401,{error:'Invalid token'})}
 if(claims.tid!==tenant||!allowed.includes(String(claims.oid||'').toLowerCase()))return json(403,{error:'Not authorised'});
 const scopes=String(claims.scp||'').split(' ');
 if(!scopes.includes('Azure.Manage')&&!scopes.includes('Azure.Read'))return json(403,{error:'Missing delegated scope'});
 const target=req.query.get('kind')||'resource-groups';
 const targets={'resource-groups':'/subscriptions/'+sub+'/resourcegroups?api-version=2021-04-01','resources':'/subscriptions/'+sub+'/resources?api-version=2021-04-01'};
 if(!Object.hasOwn(targets,target))return json(400,{error:'Unsupported inventory type'});
 try{
  const token=await credential.getToken('https://management.azure.com/.default');
  if(!token) return json(503,{error:'Managed identity unavailable'});
  const result=await fetch('https://management.azure.com'+targets[target],{headers:{Authorization:'Bearer '+token.token,Accept:'application/json'}});
  if(!result.ok){ctx.warn('ARM inventory returned status '+result.status);return json(502,{error:'Azure Resource Manager inventory failed',upstreamStatus:result.status})}
  const body=await result.json();
  return json(200,{subscriptionId:sub,kind:target,items:(body.value||[]).map(x=>({id:x.id,name:x.name,type:x.type,location:x.location,resourceGroup:x.resourceGroup})),nextLinkAvailable:Boolean(body.nextLink)});
 }catch(e){ctx.error('Inventory execution error '+e.name);return json(502,{error:'Azure inventory unavailable'})}
}
app.http('operator-inventory',{methods:['GET'],authLevel:'anonymous',route:'operator/inventory',handler:inventory});
