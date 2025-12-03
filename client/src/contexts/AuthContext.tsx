import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, storageKeys } from "@/lib/api";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  register: (payload: { fullName: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(storageKeys.authToken));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: profile } = await authApi.me(token);
        setUser(profile);
      } catch (error) {
        console.warn("Auth bootstrap failed:", error);
        localStorage.removeItem(storageKeys.authToken);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const persistSession = (nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(storageKeys.authToken, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const register = async (payload: { fullName: string; email: string; password: string }) => {
    const { token: nextToken, user: nextUser } = await authApi.register(payload);
    persistSession(nextToken, nextUser);
  };

  const login = async (payload: { email: string; password: string }) => {
    const { token: nextToken, user: nextUser } = await authApi.login(payload);
    persistSession(nextToken, nextUser);
  };

  const logout = () => {
    localStorage.removeItem(storageKeys.authToken);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

