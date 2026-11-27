"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

const NAV = [
  { href: "/admin", label: "Басты бет|Главная|Dashboard", exact: true },
  { href: "/admin/users", label: "Қолданушылар|Пользователи|Users" },
  { href: "/admin/employers", label: "Жұмыс берушілер|Работодатели|Employers" },
  { href: "/admin/vacancies", label: "Вакансиялар|Вакансии|Vacancies" },
  { href: "/admin/directions", label: "IT бағыттары|IT-направления|IT Directions" },
  { href: "/admin/applications", label: "Өтінімдер|Заявки|Applications" },
  { href: "/admin/reviews", label: "Пікірлер|Отзывы|Reviews & Feedback" },
  { href: "/admin/reports", label: "Есептер|Отчёты|Reports" },
  { href: "/admin/assessments", label: "Тесттер мен сауалнамалар|Тесты и опросы|Tests and surveys" },
  { href: "/admin/logs", label: "Журнал|Журнал|Activity log" },
  { href: "/admin/settings", label: "Баптаулар|Настройки|Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (ready && (!user || user.role !== "ADMIN")) router.replace("/start");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "ADMIN") {
    return <p className="p-8 text-mute">{t("Тексерілуде...|Проверка доступа...|Checking access...")}</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-line bg-sf p-4">
        <p className="mb-4 text-xs uppercase tracking-wider text-mute">{t("Админ панель|Панель администратора|Admin panel")}</p>
        <nav className="grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-xl px-3 py-2 text-sm ${
                (n.exact ? path === n.href : path.startsWith(n.href)) ? "bg-brand text-white" : "text-ink hover:bg-soft"
              }`}
            >
              {t(n.label)}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
