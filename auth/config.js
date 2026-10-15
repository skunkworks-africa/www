// Non-secret public configuration. Add the Application (client) ID after Entra app registration.
// The redirect URL must exactly match a registered SPA redirect URI, including the slash.
export const authConfig = {
  clientId: "ba35b11d-fba6-4a3f-8333-35a49747a59f", // Registered Microsoft Entra Application (client) ID
  tenantId: "972e8de4-e365-43a3-99ec-c86a0cc249e8",
  redirectPath: "/auth/"
};
