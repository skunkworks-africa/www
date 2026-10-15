import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';import {pathToFileURL} from 'node:url';
const html=readFileSync('technology-assessment/index.html','utf8');
const js=readFileSync('technology-assessment/assessment.js','utf8');
const worker=readFileSync('edge/technology-assessment-worker/worker.js','utf8');
new vm.Script(js);new vm.SourceTextModule(worker);
for(const required of ['company','contactName','email','accuracy','privacyConsent','payments','add-payment','submit-assessment']) assert.match(html,new RegExp(required));
assert.match(html,/technology-assessment\/assessment\.js/);
for(const name of ['companySmartphones','companyTablets','mobileHotspots','byodDevices','mobileSims','mobileCarriers','mobilePlatforms','mobileFunding','mobileContractTypes','mobileRenewals90','mobileManagement','mobileSecurity','mobileMonthlySpend','mobileSpendCurrency','mobileNotes']) {assert.match(html,new RegExp('name="'+name+'"'));assert.match(worker,new RegExp("'"+name+"'"));}
assert.match(js,/fetch\('\/api\/technology-assessment'/);
assert.match(worker,/sales@skunkworks\.africa/);
let calls=0;const originalFetch=globalThis.fetch;
globalThis.fetch=async (_url,req)=>{calls++;assert.equal(JSON.parse(req.body).to[0],'sales@skunkworks.africa');return new Response('{"id":"mock-mail-id"}',{status:200})};
try{const module=await import('data:text/javascript;base64,'+Buffer.from(worker).toString('base64'));
const handler=module.default.fetch,endpoint='https://www.skunkworks.africa/api/technology-assessment';
const env={RESEND_API_KEY:'test_only',MAIL_FROM:'Skunkworks <forms@example.org>'};
const send=(payload,override={})=>handler(new Request(endpoint,{method:'POST',headers:{'content-type':'application/json',origin:'https://www.skunkworks.africa'},body:JSON.stringify(payload),...override}),env);
const good={fields:{company:'Example Ltd',contactName:'Jane Doe',email:'jane@example.org',accuracy:true,privacyConsent:true},payments:[{supplier:'Example ISP',service:'Fibre',amount:'1200',currency:'ZAR',frequency:'Monthly'}]};
const ok=await send(good);assert.equal(ok.status,200);assert.equal((await ok.json()).ok,true);
assert.equal((await send({...good,fields:{...good.fields,privacyConsent:false}})).status,400);
assert.equal((await send({...good,fields:{...good.fields,email:'notanemail'}})).status,400);
assert.equal((await send({...good,payments:Array(151).fill(good.payments[0])})).status,400);
assert.equal(calls,1);
console.log('PASS static structure, JavaScript syntax, mocked email submission, privacy consent, validation, 151-row limit');
}finally{globalThis.fetch=originalFetch}