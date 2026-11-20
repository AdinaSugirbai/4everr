"use client";
import { useEffect, useState } from "react";
import { getStats } from "@/lib/admin";

const CARDS: { key: string; label: string }[] = [
  { key: "users", label: "Барлық пайдаланушы" },
  { key: "candidates", label: "Кандидаттар" },
  { key: "employers", label: "Жұмыс берушілер" },
  { key: "new_users_7d", label: "Соңғы 7 күнде тіркелді" },
  { key: "banned", label: "Бұғатталған" },
  { key: "vacancies_active", label: "Белсенді вакансия" },
  { key: "vacancies_paused", label: "Тоқтатылған вакансия" },
  { key: "applications", label: "Өтінімдер" },
  { key: "favorites", label: "Таңдаулылар" },
];

export default function AdminStats() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch((e) => setErr((e as Error).message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Статистика</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-line bg-sf p-5">
            <p className="text-sm text-mute">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand">{stats ? stats[c.key] ?? 0 : "…"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
