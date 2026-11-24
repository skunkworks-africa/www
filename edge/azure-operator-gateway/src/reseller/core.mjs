export const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class WorkflowError extends Error {
  constructor(message, status = 503) { super(message); this.status = status; }
}
const obj = properties => ({type:'object',properties,additionalProperties:false});
export const resellerTools = [
  {name:'reseller_readiness',description:'Verify Sales Agents access and Dataverse connectivity. Does not verify document storage or activate intake.', inputSchema:obj({}),annotations:{readOnlyHint:true}},
  {name:'list_reseller_applications',description:'Read up to 50 reseller references, stages and follow-up dates. No documents or contact details.',inputSchema:obj({}),annotations:{readOnlyHint:true}},
  {name:'get_reseller_review',description:'Read one application review checklist and required human approver IDs. This is not an approval decision.',inputSchema:{...obj({applicationId:{type:'string',format:'uuid'}}),required:['applicationId']},annotations:{readOnlyHint:true}},
  {name:'set_reseller_follow_up',description:'Set a follow-up action and due date on an open application using its current ETag. Cannot approve, reject or activate a reseller.',inputSchema:{...obj({applicationId:{type:'string',format:'uuid'},etag:{type:'string',pattern:'^W/"[0-9]+"$'},action:{type:'string',enum:['contact','request_information','review_evidence','prepare_agreement']},dueAt:{type:'string',format:'date-time'}}),required:['applicationId','etag','action','dueAt']},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false}}
];
export function configFrom(env) {
  const fields=['RESELLER_TENANT_ID','RESELLER_API_AUDIENCE','RESELLER_RESOURCE_URL','RESELLER_SALES_GROUP_ID','RESELLER_RAYDO_OID','RESELLER_MARIA_OID','RESELLER_MANAGED_IDENTITY_CLIENT_ID','RESELLER_DATAVERSE_URL','RESELLER_OPERATOR_TEAM_ID','RESELLER_CLIENT_IDS'];
  if(env.RESELLER_MCP_ENABLED!=='true'||fields.some(k=>!env[k]))throw new WorkflowError('Reseller MCP is not configured');
  for(const key of fields.filter(k=>k.endsWith('_ID')||k.endsWith('_OID')))if(!uuid.test(env[key]))throw new WorkflowError('Invalid identity configuration');
  const url=new URL(env.RESELLER_DATAVERSE_URL);
  if(url.protocol!=='https:'||!/^[-a-z0-9]+\.crm[0-9]*\.dynamics\.com$/.test(url.hostname)||url.pathname!=='/'||url.search||url.hash||url.port||url.username||url.password)throw new WorkflowError('Invalid Dataverse origin');
  const resource=new URL(env.RESELLER_RESOURCE_URL);
  if(resource.protocol!=='https:'||resource.pathname!=='/api/reseller/mcp'||resource.search||resource.hash||resource.port||resource.username||resource.password)throw new WorkflowError('Invalid MCP resource');
  const clientIds=env.RESELLER_CLIENT_IDS.split(',').map(s=>s.trim().toLowerCase());
  if(!clientIds.length||clientIds.some(id=>!uuid.test(id)))throw new WorkflowError('Invalid OAuth client allowlist');
  const principals=[env.RESELLER_RAYDO_OID,env.RESELLER_MARIA_OID].map(x=>x.toLowerCase());
  if(new Set(principals).size!==2)throw new WorkflowError('Two distinct named approvers required');
  return {tenant:env.RESELLER_TENANT_ID.toLowerCase(),audience:env.RESELLER_API_AUDIENCE,resource:resource.href,group:env.RESELLER_SALES_GROUP_ID.toLowerCase(),principals,clientId:env.RESELLER_MANAGED_IDENTITY_CLIENT_ID,dataverse:url.origin,team:env.RESELLER_OPERATOR_TEAM_ID.toLowerCase(),clientIds};
}
export function validateClaims(claims, config) {
  if(claims.tid!==config.tenant||!uuid.test(claims.oid||'')||!config.clientIds.includes(String(claims.azp||'').toLowerCase()))throw new WorkflowError('Caller not authorised',403);
  const scopes=String(claims.scp||'').split(' ');
  if(!scopes.includes('Reseller.Read'))throw new WorkflowError('Reseller.Read scope required',403);
  return {oid:claims.oid.toLowerCase(),scopes};
}
export async function executeTool(name,args,actor,config,adapter,now=Date.now()) {
  const tool=resellerTools.find(t=>t.name===name);
  if(!tool||!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>!Object.hasOwn(tool.inputSchema.properties,k))||(tool.inputSchema.required||[]).some(k=>!Object.hasOwn(args,k)))throw new WorkflowError('Unsupported tool or arguments',400);
  if('applicationId' in args&&!uuid.test(args.applicationId))throw new WorkflowError('Invalid application ID',400);
  if(name==='set_reseller_follow_up') {
    if(!actor.scopes.includes('Reseller.Manage'))throw new WorkflowError('Reseller.Manage scope required',403);
    if(typeof args.etag!=='string'||!/^W\/"[0-9]+"$/.test(args.etag)||!tool.inputSchema.properties.action.enum.includes(args.action)||typeof args.dueAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(args.dueAt)||!Number.isFinite(Date.parse(args.dueAt))||Date.parse(args.dueAt)<=now||Date.parse(args.dueAt)>now+90*86400000)throw new WorkflowError('Invalid follow-up or ETag; use a future UTC date within 90 days',400);
  }
  // Resolve on every operation; never trust token group claims or a cached client role.
  const roster=await adapter.roster(config,actor.oid);
  if(!Array.isArray(roster.owners)||!roster.owners.length||!Array.isArray(roster.members)||roster.owners.some(id=>!uuid.test(id)))throw new WorkflowError('Sales Agents owners could not be verified');
  const required=[...new Set([...roster.owners,...config.principals])];
  if(![...roster.members,...required].includes(actor.oid))throw new WorkflowError('Sales Agents membership or approver role required',403);
  if(name==='reseller_readiness')return {groupVerified:true,dataverse:await adapter.probe(),intakeEnabled:false,approvalWritesEnabled:false};
  if(name==='list_reseller_applications')return adapter.list();
  const record=await adapter.get(args.applicationId);
  if(record.team!==config.team)throw new WorkflowError('Application not found',404);
  if(name==='get_reseller_review')return {application:record,requiredApprovers:required,approvalPolicy:'All distinct current group owners plus Raydo and Maria; fresh version required',canActivate:false};
  if(!['submitted','assigned','under_review','awaiting_information','pending_approval','approved'].includes(record.stage))throw new WorkflowError('Application is not open for follow-up',409);
  if(record.etag!==args.etag)throw new WorkflowError('Application changed; fetch current review',412);
  await adapter.followUp(args,actor.oid);
  return {applicationId:args.applicationId,followUpUpdated:true,approvalChanged:false};
}
