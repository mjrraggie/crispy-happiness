// Fill in the Application (client) ID from your Microsoft Entra app registration.
// See README.md → "One-time setup". The client ID is not a secret; it's safe to commit.
window.APP_CONFIG = {
  clientId: "",
  // "organizations" = work/school accounts (Liberty's Microsoft 365).
  // Use "common" to also allow personal Outlook.com accounts, or your tenant ID to lock it to one org.
  tenant: "organizations",
};
