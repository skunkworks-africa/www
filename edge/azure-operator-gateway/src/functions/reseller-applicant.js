import {app} from '@azure/functions';
import {ManagedIdentityCredential} from '@azure/identity';
import {createVerifier} from '../reseller/auth.mjs';
import {applicantHandler} from '../reseller/applicant.mjs';
import {applicantStore} from '../reseller/applicant-store.mjs';
let handler;
async function dispatch(request) {
  if(process.env.RESELLER_INTAKE_ENABLED!=='true')return {status:503,jsonBody:{error:'Intake unavailable'},headers:{'Cache-Control':'no-store'}};
  try {
    if(!handler){
      const credential=new ManagedIdentityCredential(process.env.RESELLER_MANAGED_IDENTITY_CLIENT_ID);
      handler=applicantHandler({env:process.env,verify:createVerifier(),repository:applicantStore({origin:process.env.RESELLER_DATAVERSE_URL,team:process.env.RESELLER_OPERATOR_TEAM_ID,getToken:async scope=>(await credential.getToken(scope)).token})});
    }
    return await handler(request);
  }catch{return {status:503,jsonBody:{error:'Intake unavailable'},headers:{'Cache-Control':'no-store'}};}
}
app.http('reseller-application-submit',{methods:['POST'],authLevel:'anonymous',route:'api/reseller/applications',handler:dispatch});
app.http('reseller-application-status',{methods:['GET'],authLevel:'anonymous',route:'api/reseller/applications/{id}',handler:dispatch});
