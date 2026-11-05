import {PublicClientApplication} from '@azure/msal-browser';
import {portalConfig,portalConfigured} from '../../../resellers/portal-config.mjs';
import {applicationPayload} from '../../../resellers/submission.mjs';

const c=portalConfig;
const form=document.querySelector('#application');
const availability=document.querySelector('#availability');
const signIn=document.querySelector('#portal-signin');
const signOut=document.querySelector('#portal-signout');
const send=document.querySelector('#portal-send');
const statusButton=document.querySelector('#portal-check');
const statusId=document.querySelector('#portal-status-id');
const output=document.querySelector('#portal-result');
const review=document.querySelector('#review');
const ackText=document.querySelector('#ack-text');
const mainStatus=document.querySelector('#portal-session');
const setMessage=value=>{output.textContent=value;};
const setBusy=busy=>{for(const button of [signIn,signOut,send,statusButton])button.disabled=busy;};
if(portalConfigured(c)) {
  void start().catch(()=>{
    form.hidden=true;
    setMessage('Secure application sign-in is unavailable. Contact Sales; do not email identity documents.');
  });
}

async function start() {
  const instance=new PublicClientApplication({
    auth:{
      clientId:c.clientId,authority:c.authority,
      redirectUri:window.location.origin+'/resellers/',
      postLogoutRedirectUri:window.location.origin+'/resellers/',
      navigateToLoginRequestUrl:false,
      knownAuthorities:[new URL(c.authority).hostname]
    },
    cache:{cacheLocation:'sessionStorage',storeAuthStateInCookie:false}
  });
  await instance.initialize();
  const response=await instance.handleRedirectPromise();
  let account=response?.account||instance.getAllAccounts()[0]||null;
  availability.textContent='Secure online application requires Microsoft sign-in and a current privacy declaration.';
  ackText.textContent='I have read the Skunkworks privacy notice and agree to the processing described there for reseller onboarding.';
  review.querySelector('p').textContent='Review the details carefully, then use Submit application below.';
  signIn.hidden=false;
  signIn.onclick=()=>instance.loginRedirect({scopes:[c.apiScope]});
  signOut.onclick=()=>instance.logoutRedirect({account});
  function showSession() {
    form.hidden=!account;
    signIn.hidden=Boolean(account);
    signOut.hidden=!account;
    statusId.hidden=!account;
    statusButton.hidden=!account;
    mainStatus.textContent=account?'Signed in to the reseller application portal.':'Sign in before entering application details.';
    send.hidden=true;
  }
  showSession();
  if(!account)return;
  form.addEventListener('submit',()=>{
    if(form.checkValidity())send.hidden=false;
  });
  form.addEventListener('input',()=>{send.hidden=true;});
  form.addEventListener('reset',()=>{send.hidden=true;setMessage('');});
  let pendingKey=crypto.randomUUID();
  let lastFingerprint='';
  async function accessToken() {
    account=instance.getAllAccounts()[0]||null;
    if(!account)throw Error('Session expired. Sign in again.');
    try{return (await instance.acquireTokenSilent({scopes:[c.apiScope],account})).accessToken;}
    catch{throw Error('Your sign-in needs renewal. Sign out and sign in again before resubmitting.');}
  }
  async function api(path,options={}) {
    const token=await accessToken();
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),20000);
    try {
      const response=await fetch(new URL(path,c.apiBaseUrl).href,{
        ...options,redirect:'error',signal:controller.signal,
        headers:{Authorization:'Bearer '+token,Accept:'application/json',...options.headers}
      });
      const contentType=response.headers.get('content-type')||'';
      const result=contentType.includes('application/json')?await response.json():{};
      if(!response.ok)throw Error(typeof result.error==='string'?result.error:'Request unsuccessful ('+response.status+').');
      return result;
    }finally{clearTimeout(timeout);}
  }
  send.addEventListener('click',async()=>{
    if(!form.reportValidity())return;
    const fields=Object.fromEntries(new FormData(form));
    let payload;
    try{payload=applicationPayload(fields,c.privacyVersion);}catch(e){setMessage(e.message);return;}
    const fingerprint=JSON.stringify(payload);
    if(fingerprint!==lastFingerprint){pendingKey=crypto.randomUUID();lastFingerprint=fingerprint;}
    setBusy(true);setMessage('Submitting application securely…');
    try {
      const result=await api('/api/reseller/applications',{
        method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':pendingKey},
        body:JSON.stringify(payload)
      });
      if(!result.id||!result.reference)throw Error('Application response incomplete. Check your status with Sales.');
      statusId.value=result.id;
      setMessage('Application received. Reference: '+result.reference+'. Current stage: '+result.stage+'. Save your reference.');
      send.hidden=true;
    }catch(e){setMessage(e.name==='AbortError'?'Request timed out. Retry with the same details.':e.message);}
    finally{setBusy(false);}
  });
  statusButton.addEventListener('click',async()=>{
    const id=statusId.value.trim();
    if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)){setMessage('Enter the application UUID returned at submission.');return;}
    setBusy(true);setMessage('Checking application status…');
    try{
      const result=await api('/api/reseller/applications/'+encodeURIComponent(id));
      setMessage('Reference: '+result.reference+'. Current stage: '+result.stage+'.');
    }catch(e){setMessage(e.name==='AbortError'?'Status check timed out.':e.message);}
    finally{setBusy(false);}
  });
}
