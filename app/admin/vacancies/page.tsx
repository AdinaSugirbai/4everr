"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { setVacancyStatus, deleteVacancy } from "@/lib/admin";

type V = {
  id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  level: string;
  status: "ACTIVE" | "PAUSED";
  created_at: string;
};
type Filter = "ALL" | "ACTIVE" | "PAUSED";

export default function AdminVacancies() {
  const [rows, setRows] = useState<V[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const base = supabase()
      .from("vacancies")
      .select("id, title, company, city, salary, level, status, created_at")
      .order("created_at", { ascending: false });
    const { data, error } = filter === "ALL" ? await base : await base.eq("status", filter);
    if (error) setErr(error.message);
    else setRows((data ?? []) as V[]);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function run(id: string, fn: () => Promise<void>) {
    setErr(null);
    setBusy(id);
    try {
      await fn();
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Вакансиялар ({rows.length})</h1>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "PAUSED"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-sm ${
                filter === f ? "bg-brand text-white" : "border border-line bg-sf text-ink"
              }`}
            >
              {f === "ALL" ? "Барлығы" : f === "ACTIVE" ? "Белсенді" : "Тоқтатылған"}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">Атауы</th>
              <th className="px-4 py-3">Компания</th>
              <th className="px-4 py-3">Қала</th>
              <th className="px-4 py-3">Деңгей</th>
              <th className="px-4 py-3">Жалақы</th>
              <th className="px-4 py-3">Күйі</th>
              <th className="px-4 py-3">Әрекет</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">{r.title}</td>
                <td className="px-4 py-3 text-mute">{r.company}</td>
                <td className="px-4 py-3 text-mute">{r.city}</td>
                <td className="px-4 py-3 text-mute">{r.level}</td>
                <td className="px-4 py-3 text-mute">{r.salary}</td>
                <td className="px-4 py-3">
                  <span className={r.status === "ACTIVE" ? "text-brand" : "text-amber-500"}>
                    {r.status === "ACTIVE" ? "Белсенді" : "Тоқтатылған"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      disabled={busy === r.id}
                      onClick={() =>
                        run(r.id, () => setVacancyStatus(r.id, r.status === "ACTIVE" ? "PAUSED" : "ACTIVE"))
                      }
                      className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40"
                    >
                      {r.status === "ACTIVE" ? "Тоқтату" : "Қосу"}
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => {
                        if (confirm(`"${r.title}" вакансиясын өшіресіз бе?`)) run(r.id, () => deleteVacancy(r.id));
                      }}
                      className="rounded-lg bg-red-500/10 px-3 py-1 text-red-500 disabled:opacity-40"
                    >
                      Өшіру
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !err && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-mute">Вакансия жоқ.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
