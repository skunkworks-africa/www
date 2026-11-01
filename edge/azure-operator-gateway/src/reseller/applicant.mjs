import {createHash} from 'node:crypto';
import {submission,owned} from './lifecycle.mjs';
import {uuid,WorkflowError} from './core.mjs';
export function applicantHandler({env,verify,repository,now=()=>new Date().toISOString()}) {
  return async request=>{
    const response=(status,jsonBody)=>({status,jsonBody,headers:{'Cache-Control':'no-store','Content-Type':'application/json'}});
    try {
      if(env.RESELLER_INTAKE_ENABLED!=='true'||!env.RESELLER_PRIVACY_VERSION||!uuid.test(env.RESELLER_APPLICANT_TENANT_ID||'')||!uuid.test(env.RESELLER_APPLICANT_CLIENT_ID||'')||!env.RESELLER_APPLICANT_AUDIENCE)throw new WorkflowError('Intake unavailable');
      const token=/^Bearer ([^\s]+)$/.exec(request.headers.get('authorization')||'')?.[1];
      if(!token)return response(401,{error:'Authentication required'});
      let claims;
      try {claims=await verify(token,{tenant:env.RESELLER_APPLICANT_TENANT_ID,audience:env.RESELLER_APPLICANT_AUDIENCE});}catch{return response(401,{error:'Invalid access token'});}
      if(claims.tid!==env.RESELLER_APPLICANT_TENANT_ID||claims.azp!==env.RESELLER_APPLICANT_CLIENT_ID||!uuid.test(claims.oid||'')||!String(claims.scp).split(' ').includes('Reseller.Apply'))return response(403,{error:'Applicant access required'});
      const actor={tenant:claims.tid,oid:claims.oid};
      if(request.method==='GET') {
        if(!uuid.test(request.params.id||''))return response(400,{error:'Invalid application ID'});
        const r=owned(await repository.get(request.params.id),actor);
        return response(200,{id:r.id,reference:r.reference,stage:r.stage,version:r.version});
      }
      if(request.method!=='POST')return response(405,{error:'Method not allowed'});
      const key=request.headers.get('idempotency-key');
      if(!uuid.test(key||''))return response(400,{error:'UUID Idempotency-Key required'});
      if(!(request.headers.get('content-type')||'').startsWith('application/json'))return response(415,{error:'JSON required'});
      // Count actual streamed bytes; do not trust Content-Length.
      const chunks=[];let size=0;
      if(!request.body)return response(400,{error:'Body required'});
      for await(const chunk of request.body){size+=chunk.byteLength;if(size>8192)return response(413,{error:'Request too large'});chunks.push(Buffer.from(chunk));}
      let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return response(400,{error:'Invalid JSON'});}
      const data=submission(input,env.RESELLER_PRIVACY_VERSION);
      const digest=createHash('sha256').update(JSON.stringify(data)).digest('hex');
      const r=await repository.submit({actor,key:key.toLowerCase(),digest,data,acceptedAt:now()});
      return response(200,{id:r.id,reference:r.reference,stage:r.stage,version:r.version});
    }catch(e){return response(e instanceof WorkflowError?e.status:503,{error:e instanceof WorkflowError?e.message:'Workflow unavailable'});}
  };
}
