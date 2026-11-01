import {WorkflowError,uuid} from './core.mjs';
const fail=(message,status=400)=>{throw new WorkflowError(message,status);};
export function submission(input,noticeVersion) {
  const keys=['company','country','businessType','contactName','email','noticeVersion','accepted'];
  if(!input||Array.isArray(input)||Object.keys(input).some(k=>!keys.includes(k)))fail('Invalid submission');
  for(const k of ['company','contactName','email'])if(typeof input[k]!=='string'||!input[k].trim()||input[k].length>200||/[\x00-\x1f]/.test(input[k]))fail('Invalid '+k);
  if(!/^[A-Z]{2}$/.test(input.country)||!['company','sole_trader'].includes(input.businessType)||!/^\S+@\S+\.\S+$/.test(input.email))fail('Invalid business details');
  if(!noticeVersion||input.noticeVersion!==noticeVersion||input.accepted!==true)fail('Current privacy notice acceptance required');
  return Object.fromEntries(keys.map(k=>[k,typeof input[k]==='string'?input[k].trim():input[k]]));
}
export function owned(record,actor) {
  if(!record||record.tenant!==actor.tenant||record.applicant!==actor.oid)fail('Application not found',404);
  return record;
}
// Inputs here MUST come from trusted storage and a fresh complete directory lookup.
export function activationReady(record,roster,principals) {
  if(!roster?.complete||!roster.owners?.length||roster.owners.some(o=>!uuid.test(o)))fail('Owners unavailable',503);
  if(principals.length!==2||new Set(principals).size!==2||principals.some(o=>!uuid.test(o)))fail('Named approvers unavailable',503);
  const required=[...new Set([...roster.owners,...principals])].sort();
  if(record.stage!=='pending_approval'||!record.agreementSigned||!record.evidence?.length)fail('Application not ready',409);
  if(record.evidence.some(e=>e.scan!=='clean'||e.review!=='accepted'||e.applicationVersion!==record.version||!e.sha256||e.scannedVersion!==e.blobVersion))fail('Evidence not verified',409);
  if(JSON.stringify(required)!==JSON.stringify([...(record.requiredApprovers||[])].sort()))fail('Approval roster changed',409);
  for(const id of required) {
    const decisions=record.approvals.filter(a=>a.actor===id&&a.version===record.version);
    if(decisions.length!==1||decisions[0].decision!=='approve')fail('Approval incomplete',409);
  }
  return required;
}
