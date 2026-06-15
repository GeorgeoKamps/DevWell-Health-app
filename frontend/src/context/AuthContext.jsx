import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, clearToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Start in "loading" only if there's a token to validate.
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (data) => {
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => handleAuth(await api.login({ email, password }));
  const signup = async (email, password, name) => handleAuth(await api.signup({ email, password, name }));
  const logout = () => { clearToken(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
