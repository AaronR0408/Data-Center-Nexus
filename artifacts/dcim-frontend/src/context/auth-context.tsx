import React, { createContext, useContext, ReactNode } from "react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import type { CurrentUser } from "@workspace/api-client-react";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEngineer: boolean;
  isViewer: boolean;
  canWrite: boolean;
  canManageUsers: boolean;
  canViewIncidents: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAdmin: false,
  isEngineer: false,
  isViewer: false,
  canWrite: false,
  canManageUsers: false,
  canViewIncidents: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();

  const role = user?.role ?? null;
  const isAdmin = role === "ADMIN";
  const isEngineer = role === "ENGINEER";
  const isViewer = role === "VIEWER";

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAdmin,
    isEngineer,
    isViewer,
    canWrite: isAdmin,
    canManageUsers: isAdmin,
    canViewIncidents: isAdmin || isEngineer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
