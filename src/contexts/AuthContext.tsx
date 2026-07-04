"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LoginResponse {
  error?: string;
  token?: string;
  user?: AuthUser;
  authMode?: "database" | "demo";
}

interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "employee" | "admin";
  department: string;
  position: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (employeeId: string, password: string, role: "employee" | "admin") => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const storedToken = localStorage.getItem("aurahr-token");
      const storedUser = localStorage.getItem("aurahr-user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      localStorage.removeItem("aurahr-token");
      localStorage.removeItem("aurahr-user");
    }
    setIsLoading(false);
  }, []);

  const login = async (employeeId: string, password: string, role: "employee" | "admin") => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, password, role }),
    });

    const data = await response.json() as LoginResponse;

    if (!response.ok) {
      throw new Error(data.error ?? "Login failed");
    }

    const { token: newToken, user: newUser } = data;
    if (!newToken || !newUser) throw new Error("Invalid response");

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("aurahr-token", newToken);
    localStorage.setItem("aurahr-user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("aurahr-token");
    localStorage.removeItem("aurahr-user");
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("aurahr-user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
