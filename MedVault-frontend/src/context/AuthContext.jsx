import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

function safeParseUser(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("adminAuthToken");
    return null;
  }
}

function isJwtExpired(token) {
  if (!token || !token.includes(".")) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    safeParseUser(sessionStorage.getItem("loggedInUser")),
  );

  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (token && isJwtExpired(token)) {
      logout();
    }
  }, [token]);

  function login(userData) {
    if (!userData) return;

    if (userData.token) {
      sessionStorage.setItem("authToken", userData.token);
    }

    sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("adminAuthToken");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
