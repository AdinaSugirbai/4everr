"use client";
import { useEffect, useState } from "react";
import { getStats } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

const CARDS: { key: string; label: string }[] = [
  { key: "users", label: "Барлық пайдаланушы|Все пользователи|All users" },
  { key: "candidates", label: "Кандидаттар|Кандидаты|Candidates" },
  { key: "employers", label: "Жұмыс берушілер|Работодатели|Employers" },
  { key: "new_users_7d", label: "Соңғы 7 күнде тіркелді|Зарегистрированы за 7 дней|Joined in the last 7 days" },
  { key: "banned", label: "Бұғатталған|Заблокированные|Blocked" },
  { key: "vacancies_active", label: "Белсенді вакансия|Активные вакансии|Active vacancies" },
  { key: "vacancies_paused", label: "Тоқтатылған вакансия|Приостановленные вакансии|Paused vacancies" },
  { key: "applications", label: "Өтінімдер|Заявки|Applications" },
  { key: "favorites", label: "Таңдаулылар|Избранное|Favorites" },
];

export default function AdminStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr((e as Error).message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("Статистика|Статистика|Statistics")}</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-line bg-sf p-5">
            <p className="text-sm text-mute">{t(c.label)}</p>
            <p className="mt-2 text-3xl font-bold text-brand">{stats ? stats[c.key] ?? 0 : "…"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
