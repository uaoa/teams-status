const baseUrl = window.location.origin + window.location.pathname;

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID || "common"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || baseUrl,
    postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || baseUrl,
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
