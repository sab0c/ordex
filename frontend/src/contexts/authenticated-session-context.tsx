"use client";

import { createContext, useContext } from "react";

type AuthenticatedSessionContextValue = {
  isReady: boolean;
  token: string | null;
};

const AuthenticatedSessionContext =
  createContext<AuthenticatedSessionContextValue | null>(null);

export function AuthenticatedSessionProvider({
  children,
  isReady,
  token,
}: Readonly<{
  children: React.ReactNode;
  isReady: boolean;
  token: string | null;
}>) {
  return (
    <AuthenticatedSessionContext.Provider value={{ isReady, token }}>
      {children}
    </AuthenticatedSessionContext.Provider>
  );
}

export function useAuthenticatedSession() {
  const context = useContext(AuthenticatedSessionContext);

  if (!context) {
    throw new Error(
      "useAuthenticatedSession deve ser usado dentro de AuthenticatedSessionProvider.",
    );
  }

  return context;
}
