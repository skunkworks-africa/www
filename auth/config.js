// Non-secret public configuration. Add the Application (client) ID after Entra app registration.
// The redirect URL must exactly match a registered SPA redirect URI, including the slash.
export const authConfig = {
  clientId: "", // Microsoft Entra Application (client) ID
  tenantId: "338a8916-80d9-467c-a94a-7f61d04ef7d5",
  redirectPath: "/auth/"
};
