import {app} from '@azure/functions';
import {ManagedIdentityCredential} from '@azure/identity';
import {decodeJwt} from 'jose';
import {createVerifier} from '../reseller/auth.mjs';
import {createHandler,metadata} from '../reseller/handler.mjs';
import {createAdapter} from '../reseller/adapters.mjs';
export const resellerHandler=createHandler({
  env:process.env,
  verify:createVerifier(),
  adapterFactory(c) {
    const credential=new ManagedIdentityCredential(c.clientId);
    return createAdapter(c,async scope=>{
      const result=await credential.getToken(scope);
      // Token comes only from Azure Identity, never from the incoming request. This is a
      // routing sanity check, not JWT authentication; Graph/Dataverse validate the signature.
      if(!result||decodeJwt(result.token).tid!==c.tenant)throw new Error('Managed identity tenant mismatch');
      return result.token;
    });
  }
});
app.http('reseller-mcp',{methods:['GET','POST'],authLevel:'anonymous',route:'api/reseller/mcp',handler:resellerHandler});
app.http('reseller-oauth-resource',{methods:['GET'],authLevel:'anonymous',route:'.well-known/oauth-protected-resource/api/reseller/mcp',handler:()=>metadata(process.env)});
