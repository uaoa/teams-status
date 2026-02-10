import { Client } from "@microsoft/microsoft-graph-client";

function getGraphClient(accessToken) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

export async function getPresence(accessToken) {
  const client = getGraphClient(accessToken);
  return client.api("/me/presence").get();
}

export async function getUserProfile(accessToken) {
  const client = getGraphClient(accessToken);
  return client.api("/me").select("displayName,mail,userPrincipalName").get();
}

export async function setUserPreferredPresence(accessToken, availability, activity, expirationDuration = "PT480M") {
  const client = getGraphClient(accessToken);
  return client.api("/me/presence/setUserPreferredPresence").post({
    availability,
    activity,
    expirationDuration,
  });
}

export async function clearUserPreferredPresence(accessToken) {
  const client = getGraphClient(accessToken);
  return client.api("/me/presence/clearUserPreferredPresence").post({});
}

export const STATUSES = [
  {
    id: "Available",
    label: "Available",
    activity: "Available",
    color: "#92c353",
    icon: "✓",
  },
  {
    id: "Busy",
    label: "Busy",
    activity: "Busy",
    color: "#c4314b",
    icon: "−",
  },
  {
    id: "DoNotDisturb",
    label: "Do Not Disturb",
    activity: "DoNotDisturb",
    color: "#c4314b",
    icon: "⊘",
  },
  {
    id: "BeRightBack",
    label: "Be Right Back",
    activity: "BeRightBack",
    color: "#ffaa44",
    icon: "↻",
  },
  {
    id: "Away",
    label: "Away",
    activity: "Away",
    color: "#ffaa44",
    icon: "⏱",
  },
  {
    id: "Offline",
    label: "Appear Offline",
    activity: "OffWork",
    color: "#b4b4b4",
    icon: "○",
  },
];
