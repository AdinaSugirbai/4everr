"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/lib/supabase/client";

export type Role = "CANDIDATE" | "EMPLOYER" | "ADMIN";
export type User = { id: string; name: string; email: string; role: Role; banned: boolean };
export type Res = { error: string | null; role: Role | null };
export type PwCheck = { len: boolean; letter: boolean; digit: boolean; symbol: boolean };

export function checkPassword(p: string): PwCheck {
  return { len: p.length >= 6, letter: /\p{L}/u.test(p), digit: /\d/.test(p), symbol: /[^\p{L}\d\s]/u.test(p) };
}
export const pwOk = (p: string) => {
  const c = checkPassword(p);
  return c.len && c.letter && c.digit && c.symbol;
};

const E_WRONG = "Құпиясөз немесе email қате|Неверный email или пароль|Wrong email or password";
const E_MAIL = "Бұл email тіркелген|Этот email уже зарегистрирован|This email is already registered";
const E_BANNED = "Аккаунт бұғатталған|Аккаунт заблокирован|Account is blocked";

type Ctx = {
  user: User | null;
  ready: boolean;
  register: (name: string, email: string, pw: string, role: Exclude<Role, "ADMIN">) => Promise<Res>;
  signin: (email: string, pw: string) => Promise<Res>;
  logout: () => Promise<void>;
  update: (name: string, email: string) => Promise<string | null>;
  changePassword: (oldPw: string, newPw: string) => Promise<string | null>;
  remove: (pw: string) => Promise<string | null>;
};
const none = async () => ({ error: null, role: null } as Res);
const AuthCtx = createContext<Ctx>({
  user: null,
  ready: false,
  register: none,
  signin: none,
  logout: async () => {},
  update: async () => null,
  changePassword: async () => null,
  remove: async () => null,
});
export const useAuth = () => useContext(AuthCtx);

async function loadProfile(id: string, email: string): Promise<User | null> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("id, name, email, role, banned")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return { ...data, email: data.email || email } as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!hasSupabaseConfig);

  useEffect(() => {
    let active = true;
    if (!hasSupabaseConfig) return () => { active = false; };
    const client = supabase();
    const sync = async (session: Session | null) => {
      if (!session?.user) {
        if (active) setUser(null);
        return;
      }
      try {
        const p = await loadProfile(session.user.id, session.user.email ?? "");
        if (active) setUser(p && !p.banned ? p : null);
      } catch {
        if (active) setUser(null);
      }
    };
    const timeout = window.setTimeout(() => { if (active) setReady(true); }, 7000);
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => { void sync(session); });
    client.auth.getSession()
      .then(({ data }) => sync(data.session))
      .catch(() => { if (active) setUser(null); })
      .finally(() => { window.clearTimeout(timeout); if (active) setReady(true); });
    return () => { active = false; window.clearTimeout(timeout); sub.subscription.unsubscribe(); };
  }, []);

  const register: Ctx["register"] = async (name, email, pw, role) => {
    if (!hasSupabaseConfig) return { error: "Supabase конфигурациясын .env.local файлына енгізіп, серверді қайта іске қосыңыз.", role: null };
    if (!pwOk(pw)) return { error: "Құпиясөз талапқа сай емес|Пароль не соответствует требованиям|Password does not meet the rules", role: null };
    const { error } = await supabase().auth.signUp({
      email,
      password: pw,
      options: { data: { name, role } },
    });
    if (error) {
      const dup = /already|registered/i.test(error.message);
      return { error: dup ? E_MAIL : error.message, role: null };
    }
    return { error: null, role };
  };

  const signin: Ctx["signin"] = async (email, pw) => {
  if (!hasSupabaseConfig) return { error: "Supabase конфигурациясын .env.local файлына енгізіп, серверді қайта іске қосыңыз.", role: null };
  const { data, error } = await supabase().auth.signInWithPassword({ email, password: pw });
  if (error) return { error: error.message, role: null };
  if (!data.user) return { error: E_WRONG, role: null };
  const p = await loadProfile(data.user.id, email);
  if (!p) return { error: "Профиль табылмады", role: null };
  if (p.banned) {
    await supabase().auth.signOut();
    return { error: E_BANNED, role: null };
  }
  setUser(p);
  return { error: null, role: p.role };
};

  const logout = async () => {
    await supabase().auth.signOut();
    setUser(null);
  };

  const update: Ctx["update"] = async (name, email) => {
    const client = supabase();
    const { error: pErr } = await client.from("profiles").update({ name }).eq("id", user?.id ?? "");
    if (pErr) return pErr.message;
    if (email !== user?.email) {
      const { error: eErr } = await client.auth.updateUser({ email });
      if (eErr) return eErr.message;
    }
    setUser((u) => (u ? { ...u, name, email } : u));
    return null;
  };

  const changePassword: Ctx["changePassword"] = async (oldPw, newPw) => {
    if (!pwOk(newPw)) return "Құпиясөз талапқа сай емес|Пароль не соответствует требованиям|Password does not meet the rules";
    const client = supabase();
    if (!user) return E_WRONG;
    const check = await client.auth.signInWithPassword({ email: user.email, password: oldPw });
    if (check.error) return "Ескі құпиясөз қате|Старый пароль неверный|Old password is wrong";
    const { error } = await client.auth.updateUser({ password: newPw });
    return error ? error.message : null;
  };

  const remove: Ctx["remove"] = async (pw) => {
    if (!user) return E_WRONG;
    const check = await supabase().auth.signInWithPassword({ email: user.email, password: pw });
    if (check.error) return "Құпиясөз қате|Неверный пароль|Wrong password";
    const { error } = await supabase().rpc("delete_own_account");
    if (error) return error.message;
    await logout();
    return null;
  };

  return (
    <AuthCtx.Provider value={{ user, ready, register, signin, logout, update, changePassword, remove }}>
      {children}
    </AuthCtx.Provider>
  );
}
