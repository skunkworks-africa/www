import {verifiedDestination} from './portal-config.mjs';
const root=document.querySelector('[data-portal]');
if(root){
  const url=verifiedDestination(root.dataset.portal);
  if(url){
    const link=root.querySelector('[data-launch]');
    const status=root.querySelector('[data-status]');
    link.href=url;
    link.hidden=false;
    status.textContent='Sign in through the dedicated Microsoft Power Pages portal.';
  }
}
