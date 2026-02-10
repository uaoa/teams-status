export const msalConfig = {
  auth: {
    // Replace with your Azure AD App Registration client ID
    clientId: import.meta.env.VITE_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID || "common"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Presence.ReadWrite"],
};

export const graphScopes = {
  scopes: ["User.Read", "Presence.ReadWrite"],
};
