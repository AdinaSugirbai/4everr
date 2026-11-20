"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { setAppStatus, type AppStatus } from "@/lib/admin";

type Row = {
  id: string;
  job_title: string;
  company: string;
  status: AppStatus;
  created_at: string;
  profiles: { name: string; email: string } | null;
};

const STATUSES: { v: AppStatus; label: string }[] = [
  { v: "NEW", label: "Жаңа" },
  { v: "VIEWED", label: "Қаралды" },
  { v: "INTERVIEW", label: "Сұхбат" },
  { v: "HIRED", label: "Қабылданды" },
  { v: "REJECTED", label: "Бас тартылды" },
];

export default function AdminApplications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase()
      .from("applications")
      .select("id, job_title, company, status, created_at, profiles!candidate_id(name, email)")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setRows((data ?? []) as unknown as Row[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function change(id: string, status: AppStatus) {
    setErr(null);
    setBusy(id);
    try {
      await setAppStatus(id, status);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Өтінімдер ({rows.length})</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">Кандидат</th>
              <th className="px-4 py-3">Вакансия</th>
              <th className="px-4 py-3">Компания</th>
              <th className="px-4 py-3">Күні</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="text-ink">{r.profiles?.name || "—"}</p>
                  <p className="text-xs text-mute">{r.profiles?.email}</p>
                </td>
                <td className="px-4 py-3 text-ink">{r.job_title}</td>
                <td className="px-4 py-3 text-mute">{r.company}</td>
                <td className="px-4 py-3 text-mute">{new Date(r.created_at).toLocaleDateString("kk-KZ")}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    disabled={busy === r.id}
                    onChange={(e) => change(r.id, e.target.value as AppStatus)}
                    className="rounded-lg border border-line bg-bg px-2 py-1 text-ink"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.v} value={s.v}>{s.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !err && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-mute">Өтінім жоқ.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
