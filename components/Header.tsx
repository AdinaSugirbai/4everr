"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import LangSwitch from "./LangSwitch";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

type MenuItem = { href: string; label: string };

const common: MenuItem[] = [
  { href: "/test", label: "Тест|Тест|Test" },
  { href: "/survey", label: "Сауалнама|Опрос|Survey" },
  { href: "/feedback", label: "Пікір|Отзыв|Feedback" },
];

const menus: Record<Role, MenuItem[]> = {
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
  ADMIN: [
    { href: "/admin", label: "Админ панель|Админ-панель|Admin panel" },
    { href: "/admin/users", label: "Пайдаланушылар|Пользователи|Users" },
    { href: "/admin/vacancies", label: "Вакансиялар|Вакансии|Vacancies" },
    { href: "/admin/applications", label: "Өтінімдер|Заявки|Applications" },
    ...common,
  ],
};

const homes: Record<Role, string> = {
  CANDIDATE: "/profile",
  EMPLOYER: "/employer/applications",
  ADMIN: "/admin",
};

// Visitors who are not signed in can still find the place to leave feedback.
const guestLinks: MenuItem[] = [
  { href: "/feedback", label: "Пікір қалдыру|Оставить отзыв|Leave feedback" },
];

export default function Header() {
  const path = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();

  if (path.startsWith("/admin")) return null;

  const links: MenuItem[] = user ? menus[user.role] ?? [] : guestLinks;
  const home = user ? homes[user.role] ?? "/profile" : "/start";
  const active = (h: string) => path === h || (h !== "/admin" && path.startsWith(h + "/"));

  return (
    <header
      className="sticky z-40 border-b border-line bg-sf"
      style={{ top: "env(safe-area-inset-top,0px)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href={home} className="text-lg font-bold tracking-tight" aria-label={BRAND}>
          <span className="text-brand">{BRAND.slice(0, 2)}</span>
          {BRAND.slice(2)}
        </Link>

        <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 hover:bg-soft ${
                active(l.href) ? "bg-soft" : ""
              }`}
            >
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangSwitch />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
