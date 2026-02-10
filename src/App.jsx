import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useState, useEffect, useCallback, useRef } from "react";
import { loginRequest, graphScopes } from "./authConfig";
import {
  getPresence,
  getUserProfile,
  setUserPreferredPresence,
  clearUserPreferredPresence,
  STATUSES,
} from "./graphService";
import "./App.css";

const REFRESH_INTERVAL = 30_000;

function StatusPanel() {
  const { instance, accounts } = useMsal();
  const [currentPresence, setCurrentPresence] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  const getAccessToken = useCallback(async () => {
    const request = { ...graphScopes, account: accounts[0] };
    try {
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        const response = await instance.acquireTokenPopup(request);
        return response.accessToken;
      }
      throw err;
    }
  }, [instance, accounts]);

  const fetchPresence = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const presence = await getPresence(token);
      setCurrentPresence(presence);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch presence:", err);
      setError("Failed to fetch presence status");
    }
  }, [getAccessToken]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const profile = await getUserProfile(token);
      setUserName(profile.displayName || profile.userPrincipalName);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchPresence();
      fetchProfile();
    }
  }, [accounts, fetchPresence, fetchProfile]);

  // Auto-refresh presence every 30 seconds
  useEffect(() => {
    if (accounts.length === 0) return;

    intervalRef.current = setInterval(fetchPresence, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [accounts, fetchPresence]);

  const handleSetStatus = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await setUserPreferredPresence(
        token,
        status.id,
        status.activity,
        "PT480M"
      );
      setActiveStatus(status.id);
      await fetchPresence();
    } catch (err) {
      console.error("Failed to set presence:", err);
      setError(`Failed to set status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await clearUserPreferredPresence(token);
      setActiveStatus(null);
      await fetchPresence();
    } catch (err) {
      console.error("Failed to clear presence:", err);
      setError(`Failed to clear status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
  };

  const currentStatusColor =
    STATUSES.find((s) => s.id === currentPresence?.availability)?.color ||
    "#b4b4b4";

  return (
    <div className="panel">
      <div className="header">
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        {currentPresence && (
          <div className="current-status">
            <span
              className="status-dot"
              style={{ backgroundColor: currentStatusColor }}
            />
            <span className="status-text">
              {currentPresence.availability}
              {currentPresence.activity &&
              currentPresence.activity !== currentPresence.availability
                ? ` (${currentPresence.activity})`
                : ""}
            </span>
            {activeStatus && (
              <span className="status-badge">Locked</span>
            )}
          </div>
        )}

        {lastRefresh && (
          <div className="last-refresh">
            Last update: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="status-grid">
        {STATUSES.map((status) => (
          <button
            key={status.id}
            type="button"
            className={`status-btn ${activeStatus === status.id ? "active" : ""}`}
            style={{ "--status-color": status.color }}
            onClick={() => handleSetStatus(status)}
            disabled={loading}
          >
            <span className="status-btn-icon">{status.icon}</span>
            <span className="status-btn-label">{status.label}</span>
          </button>
        ))}
      </div>

      {activeStatus && (
        <button
          type="button"
          className="btn-clear"
          onClick={handleClearStatus}
          disabled={loading}
        >
          Reset to automatic status
        </button>
      )}

      {loading && <div className="loading">Updating...</div>}
    </div>
  );
}

function LoginScreen() {
  const { instance } = useMsal();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      await instance.loginPopup(loginRequest);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" role="img" aria-label="Teams icon">
            <title>Teams Status Controller</title>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#6264a7"
            />
          </svg>
        </div>
        <h1>Teams Status Controller</h1>
        <p>Remotely manage your Microsoft Teams presence status</p>
        <button
          type="button"
          className="btn-login"
          onClick={handleLogin}
          disabled={loggingIn}
        >
          {loggingIn ? "Signing in..." : "Sign in with Microsoft"}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <AuthenticatedTemplate>
        <StatusPanel />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginScreen />
      </UnauthenticatedTemplate>
    </div>
  );
}

export default App;
