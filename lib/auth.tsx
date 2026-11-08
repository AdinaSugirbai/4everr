"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Role = "CANDIDATE" | "EMPLOYER";
export type User = { name: string; email: string; role: Role };
type Ctx = { user: User | null; ready: boolean; login: (u: User) => void; logout: () => void };

const AuthCtx = createContext<Ctx>({ user: null, ready: false, login: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem("4everr:user");
      if (s) setUser(JSON.parse(s));
    } catch {}
    setReady(true);
  }, []);
  const login = (u: User) => { setUser(u); localStorage.setItem("4everr:user", JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem("4everr:user"); };
  return <AuthCtx.Provider value={{ user, ready, login, logout }}>{children}</AuthCtx.Provider>;
}
