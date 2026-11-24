import { PublicClientApplication, BrowserCacheLocation } from 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.28.1/+esm';
import { authConfig } from './config.js';
const status=document.getElementById('auth-status');
const profile=document.getElementById('auth-profile');
const login=document.getElementById('auth-login');
const logout=document.getElementById('auth-logout');
function message(text,error=false){status.textContent=text;status.classList.toggle('error',error);}
if(!/^[0-9a-fA-F-]{36}$/.test(authConfig.clientId)){
  message('Sign-in is not configured yet. Register the single-tenant Entra application, then add its Application (client) ID to auth/config.js.',true);
}else{
  const msal=new PublicClientApplication({auth:{clientId:authConfig.clientId,authority:'https://login.microsoftonline.com/'+authConfig.tenantId,redirectUri:location.origin+authConfig.redirectPath,postLogoutRedirectUri:location.origin+authConfig.redirectPath,navigateToLoginRequestUrl:false},cache:{cacheLocation:BrowserCacheLocation.SessionStorage,storeAuthStateInCookie:false}});
  try{
    await msal.initialize();
    await msal.handleRedirectPromise();
    const show=()=>{const user=msal.getAllAccounts()[0];profile.hidden=!user;logout.hidden=!user;login.hidden=!!user;login.disabled=false;if(user){profile.textContent='Signed in: '+(user.name||user.username||'Organisational account');message('Microsoft authentication completed. Azure resource permissions are configured separately.')}else message('Ready to sign in to your Skunkworks Microsoft Entra tenant.')};
    login.addEventListener('click',()=>msal.loginRedirect({scopes:['openid','profile'],prompt:'select_account'}).catch(e=>message('Microsoft sign-in could not start: '+e.message,true)));
    logout.addEventListener('click',()=>msal.logoutRedirect().catch(e=>message('Sign-out could not start: '+e.message,true)));
    show();
  }catch(e){message('Authentication configuration error: '+e.message,true)}
}
