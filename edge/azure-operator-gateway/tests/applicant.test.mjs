import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applicantHandler} from '../src/reseller/applicant.mjs';
import {applicantIssuerConfig} from '../src/reseller/auth.mjs';
const id='11111111-1111-4111-8111-111111111111';
const env={RESELLER_INTAKE_ENABLED:'true',RESELLER_PRIVACY_VERSION:'1',RESELLER_APPLICANT_TENANT_ID:id,RESELLER_APPLICANT_CLIENT_ID:id,RESELLER_APPLICANT_AUDIENCE:'api'};
const claims={tid:id,azp:id,oid:id,scp:'Reseller.Apply'};
const request=(token='x')=>({method:'GET',params:{id},headers:new Headers({authorization:'Bearer '+token})});
test('disabled intake makes no external calls',async()=>{const h=applicantHandler({env:{},verify:()=>assert.fail(),repository:{}});assert.equal((await h(request())).status,503);});
test('invalid token cannot read status',async()=>{const h=applicantHandler({env,verify:()=>{throw Error();},repository:{get:()=>assert.fail()}});assert.equal((await h(request())).status,401);});
test('status hides another applicants record',async()=>{const h=applicantHandler({env,verify:async()=>claims,repository:{get:async()=>({tenant:id,applicant:'other'})}});assert.equal((await h(request())).status,404);});
test('status reveals only public fields',async()=>{const h=applicantHandler({env,verify:async()=>claims,repository:{get:async()=>({tenant:id,applicant:id,id,stage:'submitted',version:1,reference:'ref',digest:'private'})}});assert.deepEqual((await h(request())).jsonBody,{id,stage:'submitted',version:1,reference:'ref'});});

const form={company:'Demo',country:'ZA',businessType:'company',registration:'2020/111111/07',city:'Johannesburg',website:'https://example.com',contactName:'Sample Applicant',email:'example@example.com',phone:'+27 83 123 4567',focus:'licensing',paymentTerms:'credit',source:'referral',noticeVersion:'1',accepted:true};
const post=(body=form)=>new Request('https://example.azurewebsites.net/api/reseller/applications',{method:'POST',headers:{'authorization':'Bearer x','content-type':'application/json','idempotency-key':id},body:JSON.stringify(body)});
test('authenticated applicant submission includes expected operational fields, not approval data',async()=>{let stored;const h=applicantHandler({env,verify:async()=>claims,repository:{submit:async args=>{stored=args;return {id,reference:'SW-'+id,stage:'submitted',version:1}}}});const response=await h(post());assert.equal(response.status,200);assert.equal(stored.data.city,'Johannesburg');assert.equal(stored.data.phone,'+27 83 123 4567');assert.equal(stored.data.paymentTerms,'credit');assert.equal(response.jsonBody.email,undefined);});
test('applicant cannot alter backend-owned workflow status',async()=>{const h=applicantHandler({env,verify:async()=>claims,repository:{submit:()=>assert.fail()}});assert.equal((await h(post({...form,stage:'approved'}))).status,400);});
test('applicant issuer may only target exact Microsoft External ID tenant and signing keys',()=>{
 const good={...env,RESELLER_APPLICANT_ISSUER:'https://'+id+'.ciamlogin.com/'+id+'/v2.0',RESELLER_APPLICANT_JWKS_URL:'https://reseller.ciamlogin.com/'+id+'/discovery/v2.0/keys'};
 assert.equal(applicantIssuerConfig(good).issuer,good.RESELLER_APPLICANT_ISSUER);
 for(const change of [{RESELLER_APPLICANT_ISSUER:'https://evil.test/'+id+'/v2.0'},{RESELLER_APPLICANT_JWKS_URL:'https://evil.test/'+id+'/discovery/v2.0/keys'},{RESELLER_APPLICANT_JWKS_URL:'https://reseller.ciamlogin.com/other/discovery/v2.0/keys'},{RESELLER_APPLICANT_ISSUER:'https://reseller.ciamlogin.com/other/v2.0'},{RESELLER_APPLICANT_JWKS_URL:''}])assert.throws(()=>applicantIssuerConfig({...good,...change}));
});
