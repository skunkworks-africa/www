import { app } from '@azure/functions';
import { randomUUID } from 'node:crypto';
const ORIGINS = new Set(['https://www.skunkworks.africa','https://skunkworks.africa']);
const KEY_FIELDS = new Set(['company','contactName','email','phone','companyRegistration','vatNumber','jobTitle','location','website','industry','employees','locations','classification','contactMethod','desktops','laptops','servers','printers','mobiles','companySmartphones','companyTablets','mobileHotspots','byodDevices','mobileSims','mobileCarriers','mobilePlatforms','mobileFunding','mobileContractTypes','mobileRenewals90','mobileManagement','mobileSecurity','mobileMonthlySpend','mobileSpendCurrency','mobileNotes','ownership','hardwareVendors','refreshCycle','hardwareNotes','spendCategories','itManagement','supportContract','approver','timeline','renewalHelp','assetInventory','contractNotes','interests','trainingAttendees','trainingFormat','notes','accuracy','privacyConsent','marketingConsent']);
const clean=(value,max=2000)=>String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').slice(0,max);
function reply(status,payload,origin){return {status,jsonBody:payload,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(ORIGINS.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}};}
app.http('technology-assessment', {methods:['POST'],authLevel:'anonymous',route:'technology-assessment',handler:async(req,context)=>{
 const origin=req.headers.get('origin')||'';
 if(!ORIGINS.has(origin))return reply(403,{ok:false,error:'Invalid origin'},origin);
 if(!(req.headers.get('content-type')||'').startsWith('application/json'))return reply(415,{ok:false,error:'JSON required'},origin);
 let raw;try{raw=await req.text();if(raw.length>100000)return reply(413,{ok:false,error:'Payload too large'},origin);}catch{return reply(400,{ok:false,error:'Unreadable request'},origin)}
 let body;try{body=JSON.parse(raw)}catch{return reply(400,{ok:false,error:'Invalid JSON'},origin)}
 if(!body||typeof body!=='object'||!body.fields||typeof body.fields!=='object'||Array.isArray(body.fields)||!Array.isArray(body.payments)||body.payments.length>150)return reply(400,{ok:false,error:'Invalid assessment'},origin);
 const f=body.fields;
 if(!f.accuracy||!f.privacyConsent||!clean(f.company,160).trim()||!clean(f.contactName,120).trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(f.email,254)))return reply(400,{ok:false,error:'Required fields missing'},origin);
 const key=process.env.RESEND_API_KEY,from=process.env.MAIL_FROM;
 if(!key||!from)return reply(503,{ok:false,error:'Email service not configured'},origin);
 const token=body.turnstileToken;
 if(!process.env.TURNSTILE_SECRET_KEY)return reply(503,{ok:false,error:'Spam protection not configured'},origin);
 if(typeof token!=='string'||token.length<10)return reply(400,{ok:false,error:'Verification required'},origin);
 let verify;try{const v=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:token})});verify=await v.json();if(!v.ok||!verify.success||!['skunkworks.africa','www.skunkworks.africa'].includes(verify.hostname))return reply(403,{ok:false,error:'Verification failed'},origin)}catch{return reply(502,{ok:false,error:'Verification service unavailable'},origin)}
 const reference='SW-IT-'+Date.now().toString(36).toUpperCase()+'-'+randomUUID().slice(0,8).toUpperCase();
 const lines=Object.entries(f).filter(([k])=>KEY_FIELDS.has(k)).map(([k,v])=>k+': '+(Array.isArray(v)?v.map(x=>clean(x,120)).join(', '):clean(v)));
 const payments=body.payments.map((p,i)=>'Payment '+(i+1)+' — '+['supplier','service','category','amount','currency','frequency','quantity','renewal','contract'].map(k=>k+': '+clean(p?.[k],200)).join(' | '));
 const message=['TECHNOLOGY EXPENDITURE ASSESSMENT','Reference: '+reference,'Submitted: '+new Date().toISOString(),'','Company details',...lines,'','Supplier payments',...payments].join('\n').slice(0,90000);
 try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:['sales@skunkworks.africa'],reply_to:clean(f.email,254),subject:'Technology Assessment — '+clean(f.company,120),text:message})});if(!response.ok){context.error('Email transport failure, status '+response.status);return reply(502,{ok:false,error:'Email delivery rejected'},origin)}return reply(200,{ok:true,reference},origin)}catch(e){context.error('Email transport unavailable');return reply(502,{ok:false,error:'Email transport unavailable'},origin)}
 }});
