"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/admin/users", label: "Пайдаланушылар" },
  { href: "/admin/vacancies", label: "Вакансиялар" },
  { href: "/admin/applications", label: "Өтінімдер" },
  { href: "/admin/stats", label: "Статистика" },
  { href: "/admin/logs", label: "Журнал" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (ready && (!user || user.role !== "ADMIN")) router.replace("/start");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "ADMIN") {
    return <p className="p-8 text-mute">Тексерілуде...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-line bg-sf p-4">
        <p className="mb-4 text-xs uppercase tracking-wider text-mute">Админ панель</p>
        <nav className="grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-xl px-3 py-2 text-sm ${
                path.startsWith(n.href) ? "bg-brand text-white" : "text-ink hover:bg-soft"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
