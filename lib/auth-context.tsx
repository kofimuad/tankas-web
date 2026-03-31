"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, authApi, setTokens, clearTokens, getToken } from "@/lib/api";
import { apiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    username: string;
    password: string;
    display_name?: string;
  }) => Promise<{ email: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await apiClient.get("/auth/me");
      setUser(res.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const data = await authApi.login({ username, password });
    setTokens(data.token, data.refresh_token);
    setUser(data.user);
  };

  const signup = async (formData: {
    email: string;
    username: string;
    password: string;
    display_name?: string;
  }) => {
    const data = await authApi.signup(formData);
    setTokens(data.token, data.refresh_token);
    setUser(data.user);
    return { email: formData.email };
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.location.href = "/";
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
