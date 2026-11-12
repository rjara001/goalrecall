import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";

interface AuthContextValue {
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  upgradeToPro: (priceId: string, tenantId?: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<UserProfile | null>(null);

  const login = (user: UserProfile) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  const upgradeToPro = async (priceId: string, tenantId?: string): Promise<string | null> => {
    try {
      const data = await fetch("/stripe/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          tier: "pro",
          tenantId, // Asegurar que se envía al backend
          successUrl: `${window.location.origin}/admin?tab=billing&session=success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });
      
      if (!data.ok) throw new Error("Network response was not ok");
      const result = await data.json();
      if (result.url) {
        window.location.href = result.url;
        return result.url;
      }
      return null;
    } catch (err) {
      console.error("Upgrade error:", err);
      throw err;
    }
  };

  return <AuthContext.Provider value={{ user, login, logout, upgradeToPro }}>{children}</AuthContext.Provider>;
};
