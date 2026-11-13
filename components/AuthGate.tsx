"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, type Role } from "@/lib/auth";

type Need = "PUBLIC" | "ANY" | Role;
const home: Record<Role, string> = { CANDIDATE: "/profile", EMPLOYER: "/employer/applications" };
function need(path: string): Need {
  if (path.startsWith("/start")) return "PUBLIC";
  if (path.startsWith("/employer")) return "EMPLOYER";
  if (["/profile", "/resume", "/me", "/jobs"].some((p) => path.startsWith(p))) return "CANDIDATE";
  return "ANY";
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const n = need(path);
  const ok = n === "PUBLIC" || (!!user && (n === "ANY" || user.role === n));
  useEffect(() => {
    if (ready && !ok) router.replace(user ? home[user.role] : "/start");
  }, [ready, ok, user, router]);
  return ready && ok ? <>{children}</> : null;
}
