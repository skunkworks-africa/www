// Public SPA configuration. Client and tenant IDs are not secrets.
// The redirect URL must exactly match a registered SPA redirect URI, including the slash.
export const authConfig = {
  clientId: "d5cff578-a135-4fc9-b884-45677ec05b1c", // Skunkworks Azure Operator application
  tenantId: "338a8916-80d9-467c-a94a-7f61d04ef7d5",
  redirectPath: "/auth/"
};
