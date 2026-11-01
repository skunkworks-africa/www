import {createHash} from 'node:crypto';
import {WorkflowError,uuid} from './core.mjs';
export function applicantStore({origin,team,getToken,fetcher=fetch}) {
  const u=new URL(origin);
  if(u.protocol!=='https:'||!/^[-a-z0-9]+\.crm[0-9]*\.dynamics\.com$/.test(u.hostname)||u.origin!==origin||!uuid.test(team))throw new Error('Invalid Dataverse configuration');
  const base=origin+'/api/data/v9.2/sw_resellerapplications';
  const map=r=>({id:r.sw_resellerapplicationid,reference:r.sw_reference,stage:r.sw_stage,version:r.sw_version,tenant:r.sw_applicanttenant,applicant:r.sw_applicantoid,digest:r.sw_submissionhash});
  async function request(url,options={}) {
    return fetcher(url,{...options,headers:{Authorization:'Bearer '+await getToken(origin+'/.default'),'Content-Type':'application/json',...options.headers},redirect:'error',signal:AbortSignal.timeout(15000)});
  }
  async function get(id) {
    if(!uuid.test(id))throw new WorkflowError('Invalid ID',400);
    const r=await request(base+'('+id+')?$select=sw_resellerapplicationid,sw_reference,sw_stage,sw_version,sw_applicanttenant,sw_applicantoid,sw_submissionhash');
    if(r.status===404)return null;
    if(!r.ok)throw new WorkflowError('Storage unavailable');
    return map(await r.json());
  }
  return {get,async submit({actor,key,digest,data,acceptedAt}) {
    const hex=createHash('sha256').update(actor.tenant+':'+actor.oid+':'+key).digest('hex').slice(0,32);
    const id=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
    const payload={sw_resellerapplicationid:id,sw_reference:'SW-'+id,sw_stage:'submitted',sw_version:1,sw_applicanttenant:actor.tenant,sw_applicantoid:actor.oid,sw_submissionhash:digest,sw_company:data.company,sw_country:data.country,sw_businesstype:data.businessType,sw_contactname:data.contactName,sw_email:data.email,sw_noticeversion:data.noticeVersion,sw_acceptedat:acceptedAt,'ownerid@odata.bind':'/teams('+team+')'};
    const r=await request(base+'('+id+')',{method:'PATCH',headers:{'If-None-Match':'*'},body:JSON.stringify(payload)});
    if(!r.ok&&r.status!==412)throw new WorkflowError('Submission unavailable');
    const record=await get(id);
    if(!record||record.tenant!==actor.tenant||record.applicant!==actor.oid)throw new WorkflowError('Submission unavailable');
    if(record.digest!==digest)throw new WorkflowError('Idempotency key already used for different details',409);
    return record;
  }};
}
