"use client";

import { createContext, useContext } from "react";

type AuthenticatedSessionContextValue = {
  token: string;
};

const AuthenticatedSessionContext =
  createContext<AuthenticatedSessionContextValue | null>(null);

export function AuthenticatedSessionProvider({
  children,
  token,
}: Readonly<{
  children: React.ReactNode;
  token: string;
}>) {
  return (
    <AuthenticatedSessionContext.Provider value={{ token }}>
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
