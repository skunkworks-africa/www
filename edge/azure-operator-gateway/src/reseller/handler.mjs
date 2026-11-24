import {configFrom,validateClaims,executeTool,resellerTools,WorkflowError} from './core.mjs';
const json=(status,jsonBody,headers={})=>({status,jsonBody,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export function metadata(env) {
  try {const c=configFrom(env);return json(200,{resource:c.resource,authorization_servers:['https://login.microsoftonline.com/'+c.tenant+'/v2.0'],scopes_supported:['Reseller.Read','Reseller.Manage'],bearer_methods_supported:['header']});}
  catch{return json(503,{error:'Reseller MCP is not configured'});}
}
export function createHandler({env,verify,adapterFactory}) {
  return async (request,context) => {
    if(request.method!=='POST')return json(405,{error:'POST required'});
    let config;try{config=configFrom(env);}catch{return json(503,{error:'Reseller MCP is not configured'});}
    const challenge='Bearer resource_metadata="'+new URL('/.well-known/oauth-protected-resource/api/reseller/mcp',config.resource).href+'"';
    const header=request.headers.get('authorization')||'';
    if(!/^Bearer [^\s]+$/.test(header))return json(401,{error:'Bearer access token required'},{'WWW-Authenticate':challenge});
    let claims;try{claims=await verify(header.slice(7),config);}catch{return json(401,{error:'Invalid token'},{'WWW-Authenticate':challenge});}
    let actor;try{actor=validateClaims(claims,config);}catch(e){return json(e.status,{error:e.message});}
    if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json(415,{error:'JSON required'});
    const size=Number(request.headers.get('content-length')||0);if(size>16384)return json(413,{error:'Request too large'});
    let raw;try{raw=await request.text();}catch{return json(400,{error:'Unreadable request'});}
    if(Buffer.byteLength(raw)>16384)return json(413,{error:'Request too large'});
    let data;try{data=JSON.parse(raw);}catch{return json(400,{error:'Invalid JSON'});}
    if(!data||Array.isArray(data)||data.jsonrpc!=='2.0'||typeof data.method!=='string')return json(400,{error:'Invalid JSON-RPC request'});
    if(data.method==='notifications/initialized')return {status:202};
    const id=data.id;if(!['string','number'].includes(typeof id))return json(400,{error:'Request ID required'});
    const result=value=>json(200,{jsonrpc:'2.0',id,result:value});
    if(data.method==='initialize')return result({protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'skunkworks-reseller-operator',version:'0.2.0'}});
    if(data.method==='ping')return result({});
    // Tool discovery contains no business data. Every execution separately checks live group access.
    if(data.method==='tools/list')return result({tools:resellerTools.filter(t=>t.name!=='set_reseller_follow_up'||actor.scopes.includes('Reseller.Manage'))});
    if(data.method!=='tools/call')return json(200,{jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}});
    try {
      const output=await executeTool(data.params?.name,data.params?.arguments??{},actor,config,adapterFactory(config));
      return result({content:[{type:'text',text:JSON.stringify(output)}]});
    }catch(e){const expected=e instanceof WorkflowError;context?.warn?.('Reseller MCP operation failed',expected?e.status:500);return result({isError:true,content:[{type:'text',text:expected?e.message:'Reseller service unavailable'}]});}
  };
}
