import {app} from '@azure/functions';
import {ManagedIdentityCredential} from '@azure/identity';
import {loadConfig} from '../config.mjs';
import {createGatewayVerifier} from '../gateway-auth.mjs';
import {createDataverseStore} from '../dataverse-store.mjs';
import {createHandler} from '../handler.mjs';

app.setup({enableHttpStream: true});

let handler;
async function dispatch(request) {
  try {
    // Read the release flag for every request, including warm instances.
    if (process.env.IBM_INTAKE_ENABLED !== 'true') {
      handler = undefined;
      return createHandler({config: null})(request);
    }
    if (!handler) {
      const config = loadConfig();
      const credential = config.managedIdentityClientId ? new ManagedIdentityCredential(config.managedIdentityClientId) : new ManagedIdentityCredential();
      handler = createHandler({config, verifyGateway: createGatewayVerifier(config.gateway), persist: createDataverseStore(config.dataverse, {credential})});
    }
    return await handler(request);
  } catch {
    return {status: 503, headers: {'Cache-Control': 'no-store', 'Content-Type': 'application/json'}, jsonBody: {error: 'Online submission is unavailable'}};
  }
}

// Host-level "anonymous" means that no Function key is used in a public browser.
// Every POST is authenticated in code as the dedicated API Management identity.
app.http('ibm-storage-protect-intake', {methods: ['POST', 'OPTIONS'], authLevel: 'anonymous', route: 'forms/ibm/storage-protect', handler: dispatch});
