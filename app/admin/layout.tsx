"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  FiActivity, FiBarChart2, FiBriefcase, FiCheckSquare, FiFileText,
  FiHome, FiLogOut, FiMap, FiMenu, FiMessageSquare, FiSettings, FiUser, FiUsers,
} from "react-icons/fi";
import AdminLoading from "@/components/AdminLoading";
import LangSwitch from "@/components/LangSwitch";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

const NAV = [
  { href: "/admin", label: "Басты бет|Главная|Dashboard", icon: FiHome, exact: true },
  { href: "/admin/users", label: "Қолданушылар|Пользователи|Users", icon: FiUsers },
  { href: "/admin/employers", label: "Жұмыс берушілер|Работодатели|Employers", icon: FiBriefcase },
  { href: "/admin/vacancies", label: "Вакансиялар|Вакансии|Vacancies", icon: FiFileText },
  { href: "/admin/directions", label: "IT бағыттары|IT-направления|IT Directions", icon: FiMap },
  { href: "/admin/applications", label: "Өтінімдер|Заявки|Applications", icon: FiCheckSquare },
  { href: "/admin/reviews", label: "Пікірлер|Отзывы|Reviews & Feedback", icon: FiMessageSquare },
  { href: "/admin/reports", label: "Есептер|Отчёты|Reports", icon: FiBarChart2 },
  { href: "/admin/assessments", label: "Тесттер мен сауалнамалар|Тесты и опросы|Tests and surveys", icon: FiCheckSquare },
  { href: "/admin/logs", label: "Журнал|Журнал|Activity log", icon: FiActivity },
  { href: "/admin/settings", label: "Баптаулар|Настройки|Settings", icon: FiSettings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const path = usePathname();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const expanded = hovered || pinned;

  useEffect(() => {
    if (ready && (!user || user.role !== "ADMIN")) router.replace("/start");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "ADMIN") {
    return <AdminLoading />;
  }

  return (
    <div className="min-h-[calc(100vh-3rem)]">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 flex w-16 flex-col overflow-hidden border-r border-line bg-sf p-2 shadow-lg transition-[width] duration-200 ${expanded ? "w-64" : ""}`}
      >
        <div className="flex h-12 items-center gap-3 border-b border-line px-2">
          <button type="button" aria-label={t("Мәзірді ашу немесе жабу|Открыть или закрыть меню|Toggle menu")} aria-expanded={expanded} onClick={() => setPinned((v) => !v)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink hover:bg-soft">
            <FiMenu size={20} />
          </button>
          <span className={`whitespace-nowrap text-sm font-bold text-ink transition-opacity ${expanded ? "opacity-100" : "opacity-0"}`}>{t("Әкімші панелі|Панель администратора|Admin panel")}</span>
        </div>

        <nav className="mt-3 grid gap-1" aria-label={t("Әкімші мәзірі|Меню администратора|Admin navigation")}>
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path === href || path.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} aria-label={t(label)} title={!expanded ? t(label) : undefined} aria-current={active ? "page" : undefined} className={`flex h-11 items-center gap-3 rounded-xl px-2 text-sm transition-colors ${active ? "bg-brand text-white" : "text-ink hover:bg-soft"}`}>
                <Icon className="ml-1 h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={`whitespace-nowrap transition-opacity ${expanded ? "opacity-100" : "opacity-0"}`}>{t(label)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-line pt-2">
          <div className={`mb-2 px-1 transition-opacity ${expanded ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!expanded}>
            <LangSwitch />
          </div>
          <Link href="/admin/profile" aria-label={t("Әкімші профилі|Профиль администратора|Admin profile")} title={!expanded ? t("Әкімші профилі|Профиль администратора|Admin profile") : undefined} className={`flex h-11 items-center gap-3 rounded-xl px-2 text-sm ${path.startsWith("/admin/profile") ? "bg-brand text-white" : "text-ink hover:bg-soft"}`}>
            <FiUser className="ml-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={`min-w-0 truncate transition-opacity ${expanded ? "opacity-100" : "opacity-0"}`}>{user.email}</span>
          </Link>
          <button type="button" onClick={async () => { await logout(); router.replace("/start"); }} aria-label={t("Шығу|Выйти|Sign out")} title={!expanded ? t("Шығу|Выйти|Sign out") : undefined} className="flex h-11 w-full items-center gap-3 rounded-xl px-2 text-sm text-red-600 hover:bg-red-500/10">
            <FiLogOut className="ml-1 h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={`whitespace-nowrap transition-opacity ${expanded ? "opacity-100" : "opacity-0"}`}>{t("Шығу|Выйти|Sign out")}</span>
          </button>
        </div>
      </aside>
      <section className="ml-16 min-w-0">{children}</section>
    </div>
  );
}
