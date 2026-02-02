import { createContext, useContext } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export type AuthContextValue = ReturnType<typeof useSupabaseAuth>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useSupabaseAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
