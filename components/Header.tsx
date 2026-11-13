"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import LangSwitch from "./LangSwitch";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

const common = [{ href: "/test", label: "Тест|Тест|Test" }, { href: "/survey", label: "Сауалнама|Опрос|Survey" }];
const menus: Record<Role, { href: string; label: string }[]> = {
  CANDIDATE: [
    { href: "/profile", label: "Кабинет|Кабинет|Dashboard" },
    { href: "/jobs", label: "Вакансиялар|Вакансии|Jobs" },
    { href: "/resume", label: "Резюме|Резюме|Resume" },
    { href: "/me/offers", label: "Ұсыныстар|Предложения|Offers" },
    ...common,
  ],
  EMPLOYER: [
    { href: "/employer/applications", label: "Өтінімдер|Заявки|Applications" },
    { href: "/employer/vacancies/new", label: "Вакансия жариялау|Опубликовать вакансию|Post a job" },
    { href: "/employer/offers", label: "Ұсыныстар|Предложения|Offers" },
    { href: "/employer/profile", label: "Компания|Компания|Company" },
    ...common,
  ],
};

export default function Header() {
  const path = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();
  const links = user ? menus[user.role] : [];
  const home = user ? (user.role === "EMPLOYER" ? "/employer/applications" : "/profile") : "/start";
  const active = (h: string) => path === h || path.startsWith(h + "/");
  return (
    <header className="sticky z-40 border-b border-line bg-sf" style={{ top: "env(safe-area-inset-top,0px)" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href={home} className="font-bold text-lg tracking-tight" aria-label={BRAND}>
          <span className="text-brand">{BRAND.slice(0, 2)}</span>{BRAND.slice(2)}
        </Link>
        <nav className="flex gap-1 text-sm overflow-x-auto" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={"px-3 py-2 rounded-lg hover:bg-soft whitespace-nowrap " + (active(l.href) ? "bg-soft" : "")}>{t(l.label)}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2"><LangSwitch /><ThemeToggle /><UserMenu /></div>
      </div>
    </header>
  );
}
