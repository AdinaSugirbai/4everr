"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { useAuth, type Role } from "@/lib/auth";

const common = [{ href: "/test", label: "Тест" }, { href: "/survey", label: "Сауалнама" }];
const menus: Record<Role, { href: string; label: string }[]> = {
  CANDIDATE: [{ href: "/profile", label: "Кабинет" }, { href: "/jobs/1", label: "Вакансиялар" }, { href: "/resume", label: "Резюме" }, { href: "/me/offers", label: "Ұсыныстар" }, ...common],
  EMPLOYER: [{ href: "/employer", label: "Басты" }, { href: "/employer/vacancies/new", label: "Вакансия жариялау" }, { href: "/employer/applications", label: "Өтінімдер" }, { href: "/employer/offers", label: "Ұсыныстар" }, { href: "/employer/profile", label: "Компания" }, ...common],
};

export default function Header() {
  const path = usePathname();
  const { user } = useAuth();
  const links = user ? menus[user.role] : [];
  const active = (h: string) => (h === "/employer" ? path === h : path === h || path.startsWith(h + "/") || (h === "/jobs/1" && path.startsWith("/jobs")));
  return (
    <header className="sticky z-40 border-b border-line bg-sf" style={{ top: "env(safe-area-inset-top,0px)" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href={user ? (user.role === "EMPLOYER" ? "/employer" : "/profile") : "/start"} className="font-bold text-lg tracking-tight text-brand">4everr</Link>
        <nav className="flex gap-1 text-sm overflow-x-auto" aria-label="Негізгі навигация">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={"px-3 py-2 rounded-lg hover:bg-soft whitespace-nowrap " + (active(l.href) ? "bg-soft" : "")}>{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2"><ThemeToggle /><UserMenu /></div>
      </div>
    </header>
  );
}
