// Public values only. Do not put secrets, tokens, Dataverse IDs or approval URLs here.
// Production enablement requires passing the release gates in docs/RESELLER-WORKFLOW.md.
export const portalConfig=Object.freeze({
  enabled:false,
  tenantId:'',
  clientId:'',
  authority:'',
  apiBaseUrl:'',
  apiScope:'',
  privacyVersion:''
});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function portalConfigured(c) {
  if(!c||c.enabled!==true||!uuid.test(c.tenantId)||!uuid.test(c.clientId)||!c.privacyVersion||!c.apiScope)return false;
  try {
    const a=new URL(c.authority),u=new URL(c.apiBaseUrl);
    if(a.protocol!=='https:'||a.username||a.password||a.search||a.hash||a.port)return false;
    const workforce=a.hostname==='login.microsoftonline.com'&&a.pathname.replace(/\/$/,'')==='/'+c.tenantId;
    const external=/^[a-z0-9-]+\.ciamlogin\.com$/.test(a.hostname)&&['','/'+c.tenantId].includes(a.pathname.replace(/\/$/,''));
    if(!workforce&&!external)return false;
    if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.port||u.pathname!=='/')return false;
    if(!(/^[-a-z0-9]+\.azurewebsites\.net$/.test(u.hostname)||u.hostname==='api.skunkworks.africa'))return false;
    return /^api:\/\/[0-9a-f-]+\/Reseller\.Apply$/i.test(c.apiScope);
  }catch{return false;}
}
