"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Role = "CANDIDATE" | "EMPLOYER";
export type User = { name: string; email: string; role: Role };
type Stored = User & { pw: string };
export type Res = { error: string | null; role: Role | null };
export type PwCheck = { len: boolean; letter: boolean; digit: boolean; symbol: boolean };

const USERS = "4everr:users";
const SESSION = "4everr:user";

export function checkPassword(p: string): PwCheck {
  return { len: p.length >= 6, letter: /\p{L}/u.test(p), digit: /\d/.test(p), symbol: /[^\p{L}\d\s]/u.test(p) };
}
export const pwOk = (p: string) => { const c = checkPassword(p); return c.len && c.letter && c.digit && c.symbol; };

// ДЕМО: бұл нағыз қорғаныс емес. Нақты хэштеу бэкендте жасалады.
const hash = (email: string, p: string) => {
  const s = email + ":" + p;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h);
};
function readUsers(): Stored[] { try { return JSON.parse(localStorage.getItem(USERS) || "[]"); } catch { return []; } }
const writeUsers = (u: Stored[]) => localStorage.setItem(USERS, JSON.stringify(u));

const E_WRONG = "Құпиясөз қате|Неверный пароль|Wrong password";
const E_RULE = "Құпиясөз талапқа сай емес|Пароль не соответствует требованиям|Password does not meet the rules";
const E_MAIL = "Бұл email тіркелген|Этот email уже зарегистрирован|This email is already registered";

type Ctx = {
  user: User | null; ready: boolean;
  register: (name: string, email: string, pw: string, role: Role) => Res;
  signin: (email: string, pw: string) => Res;
  logout: () => void;
  update: (name: string, email: string) => string | null;
  changePassword: (oldPw: string, newPw: string) => string | null;
  remove: (pw: string) => string | null;
};
const none = () => ({ error: null, role: null } as Res);
const AuthCtx = createContext<Ctx>({ user: null, ready: false, register: none, signin: none, logout: () => {}, update: () => null, changePassword: () => null, remove: () => null });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION);
      if (s) {
        const u: User = JSON.parse(s);
        if (readUsers().some((x) => x.email === u.email)) setUser(u);
        else localStorage.removeItem(SESSION);
      }
    } catch {}
    setReady(true);
  }, []);

  function start(u: User) {
    const s: User = { name: u.name, email: u.email, role: u.role };
    setUser(s);
    localStorage.setItem(SESSION, JSON.stringify(s));
  }

  const register: Ctx["register"] = (name, email, pw, role) => {
    const users = readUsers();
    const em = email.trim().toLowerCase();
    if (users.some((u) => u.email === em)) return { error: E_MAIL, role: null };
    if (!pwOk(pw)) return { error: E_RULE, role: null };
    const u: Stored = { name: name.trim(), email: em, role, pw: hash(em, pw) };
    writeUsers([...users, u]);
    start(u);
    return { error: null, role };
  };

  const signin: Ctx["signin"] = (email, pw) => {
    const em = email.trim().toLowerCase();
    const u = readUsers().find((x) => x.email === em);
    if (!u) return { error: "Аккаунт табылмады|Аккаунт не найден|Account not found", role: null };
    if (u.pw !== hash(em, pw)) return { error: E_WRONG, role: null };
    start(u);
    return { error: null, role: u.role };
  };

  const logout = () => { setUser(null); localStorage.removeItem(SESSION); };

  const update: Ctx["update"] = (name, email) => {
    if (!user) return null;
    const users = readUsers();
    const em = email.trim().toLowerCase();
    if (users.some((x) => x.email === em && x.email !== user.email)) return E_MAIL;
    writeUsers(users.map((x) => (x.email === user.email ? { ...x, name: name.trim(), email: em } : x)));
    if (em !== user.email) {
      const old = localStorage.getItem("4everr:resume:" + user.email);
      if (old) { localStorage.setItem("4everr:resume:" + em, old); localStorage.removeItem("4everr:resume:" + user.email); }
    }
    start({ ...user, name: name.trim(), email: em });
    return null;
  };

  const changePassword: Ctx["changePassword"] = (oldPw, newPw) => {
    if (!user) return null;
    const users = readUsers();
    const u = users.find((x) => x.email === user.email);
    if (!u || u.pw !== hash(u.email, oldPw)) return E_WRONG;
    if (!pwOk(newPw)) return E_RULE;
    if (oldPw === newPw) return "Жаңа құпиясөз ескісімен бірдей|Новый пароль совпадает со старым|New password equals the old one";
    writeUsers(users.map((x) => (x.email === user.email ? { ...x, pw: hash(x.email, newPw) } : x)));
    return null;
  };

  const remove: Ctx["remove"] = (pw) => {
    if (!user) return null;
    const users = readUsers();
    const u = users.find((x) => x.email === user.email);
    if (!u || u.pw !== hash(u.email, pw)) return E_WRONG;
    writeUsers(users.filter((x) => x.email !== user.email));
    localStorage.removeItem("4everr:resume:" + user.email);
    localStorage.removeItem(SESSION);
    setUser(null);
    return null;
  };

  return <AuthCtx.Provider value={{ user, ready, register, signin, logout, update, changePassword, remove }}>{children}</AuthCtx.Provider>;
}
