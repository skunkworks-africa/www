import {WorkflowError,uuid} from './core.mjs';
const fail=(message,status=400)=>{throw new WorkflowError(message,status);};
export function submission(input,noticeVersion) {
  const lengths={company:160,country:2,businessType:16,registration:80,city:100,website:300,contactName:120,email:254,phone:40,focus:32,paymentTerms:16,source:32,noticeVersion:80};
  const required=['company','country','businessType','city','contactName','email','phone','focus','paymentTerms','noticeVersion'];
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!(k in lengths)&&k!=='accepted'))fail('Invalid submission');
  const data={};
  for(const [key,max] of Object.entries(lengths)) {
    const value=input[key];
    if(value===undefined||value===null||value==='') {
      if(required.includes(key))fail('Invalid '+key);
      data[key]='';
      continue;
    }
    if(typeof value!=='string'||!value.trim()||value.length>max||/[\x00-\x1f\x7f]/.test(value))fail('Invalid '+key);
    data[key]=value.trim();
  }
  if(!/^[A-Z]{2}$/.test(data.country)||!['company','sole_trader'].includes(data.businessType)||!/^\S+@\S+\.\S+$/.test(data.email))fail('Invalid business details');
  if(data.businessType==='company'&&!data.registration)fail('Company registration required');
  if(!/^[+0-9().\s-]{7,40}$/.test(data.phone)||!/[0-9]{6}/.test(data.phone.replace(/\D/g,'')))fail('Invalid phone');
  if(!['licensing','hardware','training','services','mixed'].includes(data.focus)||!['prepaid','credit'].includes(data.paymentTerms)||!['','referral','facebook','website','sales','other'].includes(data.source))fail('Invalid reseller preferences');
  if(data.website) {
    let url;try{url=new URL(data.website);}catch{fail('Invalid website');}
    if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.'))fail('Invalid website');
  }
  if(!noticeVersion||data.noticeVersion!==noticeVersion||input.accepted!==true)fail('Current privacy notice acceptance required');
  return {...data,accepted:true};
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
