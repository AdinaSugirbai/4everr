"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStats } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

const CARDS: { key: string; label: string }[] = [
  { key: "users", label: "Тіркелген қолданушылар|Зарегистрированные пользователи|Registered users" },
  { key: "employers", label: "Жұмыс берушілер|Работодатели|Employers" },
  { key: "vacancies_total", label: "Жарияланған вакансиялар|Опубликованные вакансии|Published vacancies" },
  { key: "vacancies_active", label: "Белсенді вакансиялар|Активные вакансии|Active vacancies" },
  { key: "pending_apps", label: "Күтіп тұрған өтінімдер|Ожидающие заявки|Pending applications" },
  { key: "pending_vacancies", label: "Тексеруді күтетін вакансиялар|Вакансии на проверке|Vacancies awaiting review" },
  { key: "visits_7d", label: "Соңғы 7 күндегі кірулер|Визиты за 7 дней|Visits in last 7 days" },
  { key: "visits_today", label: "Бүгінгі кірулер|Визиты сегодня|Visits today" },
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [s, setS] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const db = supabase();
        const base = await getStats();
        const head = { count: "exact" as const, head: true };
        const [pa, pv, vt, vs] = await Promise.all([
          db.from("applications").select("id", head).eq("status", "NEW"),
          db.from("vacancies").select("id", head).eq("moderation", "PENDING"),
          db.from("vacancies").select("id", head),
          db.from("site_visits").select("day, count").order("day", { ascending: false }).limit(7),
        ]);
        const visits = (vs.data ?? []) as { day: string; count: number }[];
        const today = new Date().toISOString().slice(0, 10);
        setS({
          ...base,
          pending_apps: pa.count ?? 0,
          pending_vacancies: pv.count ?? 0,
          vacancies_total: vt.count ?? 0,
          visits_7d: visits.reduce((a, v) => a + v.count, 0),
          visits_today: visits.find((v) => v.day === today)?.count ?? 0,
        });
      } catch (e) { setErr((e as Error).message); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-line bg-sf p-5">
            <p className="text-sm text-mute">{t(c.label)}</p>
            <p className="mt-2 text-3xl font-bold text-brand">{s ? s[c.key] ?? 0 : "…"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
