const ORIGINS = new Set(['https://www.skunkworks.africa','https://skunkworks.africa']);
const KEYS = new Set(['company','contactName','email','phone','companyRegistration','vatNumber','jobTitle','location','website','industry','employees','locations','classification','contactMethod','desktops','laptops','servers','printers','mobiles','companySmartphones','companyTablets','mobileHotspots','byodDevices','mobileSims','mobileCarriers','mobilePlatforms','mobileFunding','mobileContractTypes','mobileRenewals90','mobileManagement','mobileSecurity','mobileMonthlySpend','mobileSpendCurrency','mobileNotes','ownership','hardwareVendors','refreshCycle','hardwareNotes','spendCategories','itManagement','supportContract','approver','timeline','renewalHelp','assetInventory','contractNotes','interests','trainingAttendees','trainingFormat','notes','accuracy','privacyConsent','marketingConsent']);
const CLEAN = v => String(v ?? '').replace(/[\x00-\x1f\x7f]/g,' ').slice(0,2000);
function respond(res,status,data,origin){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');if(origin&&ORIGINS.has(origin)) {res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}return res.status(status).json(data)}
export default async function handler(req,res){
 const origin=req.headers.origin;
 if(origin&&!ORIGINS.has(origin))return respond(res,403,{ok:false,error:'Invalid origin'},origin);
 if(req.method==='OPTIONS')return respond(res,204,{},origin);
 if(req.method!=='POST')return respond(res,405,{ok:false,error:'Method not allowed'},origin);
 if(!origin||!ORIGINS.has(origin))return respond(res,403,{ok:false,error:'Origin required'},origin);
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return respond(res,415,{ok:false,error:'JSON required'},origin);
 if(Number(req.headers['content-length']||0)>100000)return respond(res,413,{ok:false,error:'Payload too large'},origin);
 const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
 if(!body||typeof body!=='object'||typeof body.fields!=='object'||!Array.isArray(body.payments)||body.payments.length>150)return respond(res,400,{ok:false,error:'Invalid assessment'},origin);
 if(body.websiteTrap)return respond(res,200,{ok:true,reference:'RECEIVED'},origin); // bot honeypot
 const f=body.fields;
 if(!f.accuracy||!f.privacyConsent||!CLEAN(f.company).trim()||!CLEAN(f.contactName).trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CLEAN(f.email)))return respond(res,400,{ok:false,error:'Missing required fields'},origin);
 if(!process.env.RESEND_API_KEY||!process.env.MAIL_FROM||!process.env.TURNSTILE_SECRET_KEY)return respond(res,503,{ok:false,error:'Email handler not configured'},origin);
 if(!body.turnstileToken||typeof body.turnstileToken!=='string')return respond(res,400,{ok:false,error:'Verification required'},origin);
 const challenge=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:body.turnstileToken})});
 if(!challenge.ok)return respond(res,502,{ok:false,error:'Verification service unavailable'},origin);
 const verified=await challenge.json();
 if(!verified.success||verified.hostname!=='www.skunkworks.africa'&&verified.hostname!=='skunkworks.africa')return respond(res,403,{ok:false,error:'Verification failed'},origin);
 const id='SW-IT-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomUUID().slice(0,8).toUpperCase();
 const fields=Object.entries(f).filter(([k])=>KEYS.has(k)).map(([k,v])=>k+': '+(Array.isArray(v)?v.map(CLEAN).join(', '):CLEAN(v)));
 const payments=body.payments.map((p,i)=>'Payment '+(i+1)+': '+['supplier','service','category','amount','currency','frequency','quantity','renewal','contract'].map(k=>k+'='+CLEAN(p?.[k]).slice(0,240)).join(' | '));
 const text=['Technology expenditure assessment','Reference: '+id,'Submitted: '+new Date().toISOString(),'','COMPANY & ASSESSMENT',...fields,'','SUPPLIER PAYMENTS',...payments].join('\n').slice(0,95000);
 const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.MAIL_FROM,to:['sales@skunkworks.africa'],reply_to:CLEAN(f.email),subject:'Technology assessment - '+CLEAN(f.company).slice(0,100)+' - '+id,text})});
 if(!mail.ok){console.error('Assessment delivery failed:',mail.status);return respond(res,502,{ok:false,error:'Email provider rejected request'},origin)}
 return respond(res,200,{ok:true,reference:id},origin);
}
