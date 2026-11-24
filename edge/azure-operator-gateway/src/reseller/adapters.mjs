import {WorkflowError,uuid} from './core.mjs';
const GRAPH='https://graph.microsoft.com';
const selection='sw_resellerapplicationid,sw_reference,sw_stage,sw_version,sw_nextaction,sw_nextactiondue,_ownerid_value';
export function createAdapter(config,getToken,fetcher=fetch) {
  async function request(url,method='GET',body,headers={}) {
    const parsed=new URL(url);
    if(![GRAPH,config.dataverse].includes(parsed.origin)||parsed.username||parsed.password)throw new WorkflowError('Untrusted service origin');
    const token=await getToken(parsed.origin+'/.default');
    const response=await fetcher(url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new WorkflowError(response.status===412?'Application changed; fetch current review':'Workflow dependency unavailable',response.status===412?412:503);
    return response.status===204?null:response.json();
  }
  async function pages(path) {
    let url=GRAPH+'/v1.0'+path;const entries=[];
    for(let page=0;url&&page<20;page++) {
      if(new URL(url).origin!==GRAPH||new URL(url).pathname!=='/v1.0'+path.split('?')[0])throw new WorkflowError('Unexpected directory pagination');
      const data=await request(url);
      if(!Array.isArray(data.value))throw new WorkflowError('Incomplete directory result');
      entries.push(...data.value);url=data['@odata.nextLink'];
    }
    if(url)throw new WorkflowError('Directory result exceeds verification limit');
    return entries;
  }
  const map=r=>({id:r.sw_resellerapplicationid,reference:r.sw_reference,stage:r.sw_stage,version:r.sw_version,nextAction:r.sw_nextaction,dueAt:r.sw_nextactiondue,team:r._ownerid_value,etag:r['@odata.etag']});
  const base=config.dataverse+'/api/data/v9.2/';
  return {
    async roster(_config,actorId) {
      if(!uuid.test(actorId))throw new WorkflowError('Invalid actor',403);
      const user=await request(GRAPH+'/v1.0/users/'+actorId+'?$select=id,accountEnabled,userType');
      if(user.id!==actorId||user.accountEnabled!==true||user.userType!=='Member')throw new WorkflowError('Active internal user required',403);
      const group=await request(GRAPH+'/v1.0/groups/'+config.group+'?$select=id,displayName,securityEnabled');
      if(group.id!==config.group||group.securityEnabled!==true||group.displayName!=='Sales Agents')throw new WorkflowError('Configured group does not match Sales Agents security group');
      const owners=await pages('/groups/'+config.group+'/owners');
      if(!owners.length||owners.some(o=>o['@odata.type']!=='#microsoft.graph.user'||!uuid.test(o.id)))throw new WorkflowError('Human group owners could not be verified');
      // Graph v1.0 may omit service-principal owners; this endpoint never makes final approvals.
      const members=await pages('/groups/'+config.group+'/members?$select=id');
      return {owners:owners.map(o=>o.id.toLowerCase()),members:members.filter(m=>m['@odata.type']==='#microsoft.graph.user'&&uuid.test(m.id)).map(m=>m.id.toLowerCase())};
    },
    async probe() {const who=await request(base+'WhoAmI');if(!uuid.test(who.UserId||''))throw new WorkflowError('Dataverse application identity unavailable');return {connected:true,applicationUserId:who.UserId};},
    async list() {const r=await request(base+'sw_resellerapplications?'+new URLSearchParams({'$select':selection,'$filter':'_ownerid_value eq '+config.team,'$top':'50','$orderby':'createdon desc'}));if(!Array.isArray(r.value))throw new WorkflowError('Invalid application result');return {applications:r.value.filter(row=>row._ownerid_value===config.team).slice(0,50).map(map),moreAvailable:Boolean(r['@odata.nextLink'])||r.value.length>50};},
    async get(id) {if(!uuid.test(id))throw new WorkflowError('Invalid application ID',400);return map(await request(base+'sw_resellerapplications('+id+')?$select='+selection));},
    async followUp(args,actorId) {
      // Persist actor and follow-up atomically. Dataverse auditing must be enabled at release.
      await request(base+'sw_resellerapplications('+args.applicationId+')','PATCH',{sw_nextaction:args.action,sw_nextactiondue:args.dueAt,sw_lastoperatoroid:actorId},{'If-Match':args.etag});
    }
  };
}
