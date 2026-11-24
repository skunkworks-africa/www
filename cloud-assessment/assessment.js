(() => {
  const form=document.getElementById('cloud-assessment-form');
  if(!form) return;
  const output=document.getElementById('assessment-output');
  const summaryEl=document.getElementById('assessment-summary');
  const warning=document.getElementById('persona-warning');
  const number=(name)=>Number(form.elements[name]?.value||0);
  const values=(name)=>[...form.querySelectorAll('[name="'+name+'"]:checked')].map(i=>i.value);
  function checkPersonas(){
    const total=number('totalUsers'), assigned=number('fullAppsUsers')+number('emailOnlyUsers')+number('frontlineUsers');
    if(!total){warning.textContent='';return;}
    warning.textContent=assigned===total?'Licence personas account for all '+total+' users.':assigned<total?(total-assigned)+' user(s) are not yet assigned to a licence persona.':'Licence persona counts exceed total users by '+(assigned-total)+'.';
  }
  ['totalUsers','fullAppsUsers','emailOnlyUsers','frontlineUsers'].forEach(n=>form.elements[n]?.addEventListener('input',checkPersonas));
  function summary(){
    const d=new FormData(form);
    const total=number('totalUsers'), full=number('fullAppsUsers'), email=number('emailOnlyUsers'), frontline=number('frontlineUsers'), sec=number('securityUsers');
    const personaTotal=full+email+frontline;
    return [
      'SKUNKWORKS AFRICA — CLOUD PRODUCTIVITY ASSESSMENT',
      'Generated: '+new Date().toLocaleString(),
      '',
      'ORGANISATION',
      'Company: '+(d.get('company')||''),
      'Country: '+(d.get('country')||''),
      'Contact: '+(d.get('contactName')||''),
      'Email: '+(d.get('email')||''),
      'Phone / WhatsApp: '+(d.get('phone')||''),
      'Preferred contact: '+(d.get('contactMethod')||''),
      '',
      'PLATFORM & OBJECTIVE',
      'Evaluating: '+(d.get('targetPlatform')||''),
      'Current environment: '+(d.get('currentPlatform')||''),
      'Primary requirement: '+(d.get('primaryRequirement')||''),
      'Timeline: '+(d.get('timeline')||''),
      '',
      'USERS & LICENCE PERSONAS',
      'Total users: '+total,
      'Full desktop apps: '+full,
      'Email + web/mobile only: '+email,
      'Frontline/shared/kiosk: '+frontline,
      'Advanced security/device management: '+sec,
      'Shared mailboxes: '+number('sharedMailboxes'),
      'Persona reconciliation: '+personaTotal+' of '+total+' users',
      '',
      'SERVICES REQUIRED',
      (values('services').join(', ')||'None selected'),
      '',
      'DOMAINS & MIGRATION',
      'Primary domain: '+(d.get('domain')||''),
      'Domain count: '+(d.get('domainCount')||''),
      'Email data: '+(d.get('mailData')||''),
      'Files/shared-drive data: '+(d.get('fileData')||''),
      'Source system: '+(d.get('sourceSystem')||''),
      'Existing admin access: '+(d.get('adminAccess')||''),
      '',
      'SECURITY & COMPLIANCE',
      'Managed devices: '+(d.get('managedDevices')||''),
      'Device platforms: '+(d.get('devicePlatforms')||''),
      'Compliance: '+(d.get('compliance')||''),
      'MFA status: '+(d.get('mfa')||''),
      '',
      'IMPLEMENTATION & SUPPORT',
      (values('support').join(', ')||'None selected'),
      '',
      'NOTES',
      (d.get('notes')||'None'),
      '',
      'Sizing note: Final licences, quantities, pricing, tax and implementation scope require Skunkworks review and vendor price validation.'
    ].join('\n');
  }
  function showSummary(){
    if(!form.reportValidity()) return false;
    summaryEl.textContent=summary(); output.hidden=false; output.scrollIntoView({behavior:'smooth',block:'start'}); return true;
  }
  document.getElementById('preview-assessment')?.addEventListener('click',showSummary);
  document.getElementById('copy-summary')?.addEventListener('click',async()=>{await navigator.clipboard.writeText(summary());});
  document.getElementById('download-summary')?.addEventListener('click',()=>{
    const blob=new Blob([summary()],{type:'text/plain;charset=utf-8'}), a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='skunkworks-cloud-assessment.txt'; a.click(); URL.revokeObjectURL(a.href);
  });
  form.addEventListener('submit',(event)=>{
    event.preventDefault();
    if(!showSummary()) return;
    const subject='Cloud productivity assessment — '+(form.elements.company.value||'New enquiry');
    const body=summary();
    window.location.href='mailto:sales@skunkworks.africa?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
  checkPersonas();
})();