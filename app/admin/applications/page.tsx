"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { deleteApplication, setAppStatus, type AppStatus } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

type Row = {
  id: string;
  job_title: string;
  company: string;
  status: AppStatus;
  created_at: string;
  profiles: { name: string; email: string } | null;
};

const STATUSES: { v: AppStatus; label: string }[] = [
  { v: "NEW", label: "Жаңа|Новая|New" },
  { v: "VIEWED", label: "Қаралды|Просмотрена|Viewed" },
  { v: "INTERVIEW", label: "Сұхбат|Собеседование|Interview" },
  { v: "HIRED", label: "Қабылданды|Принят|Hired" },
  { v: "REJECTED", label: "Бас тартылды|Отклонена|Rejected" },
];

export default function AdminApplications() {
  const { t, lang } = useI18n();
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

  async function changeDelete(id: string) {
    setErr(null);
    setBusy(id);
    try {
      await deleteApplication(id);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

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
      <h1 className="text-2xl font-bold text-ink">{t("Өтінімдер|Заявки|Applications")} ({rows.length})</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">{t("Үміткер|Кандидат|Candidate")}</th>
              <th className="px-4 py-3">{t("Вакансия|Вакансия|Vacancy")}</th>
              <th className="px-4 py-3">{t("Компания|Компания|Company")}</th>
              <th className="px-4 py-3">{t("Күні|Дата|Date")}</th>
              <th className="px-4 py-3">{t("Күйі|Статус|Status")}</th>
              <th className="px-4 py-3">{t("Әрекет|Действия|Actions")}</th>
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
                <td className="px-4 py-3 text-mute">{new Date(r.created_at).toLocaleDateString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    disabled={busy === r.id}
                    onChange={(e) => change(r.id, e.target.value as AppStatus)}
                    className="rounded-lg border border-line bg-bg px-2 py-1 text-ink"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.v} value={s.v}>{t(s.label)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button disabled={busy === r.id} onClick={() => { if (confirm(t("Өтінімді өшіресіз бе?|Удалить заявку?|Delete this application?"))) changeDelete(r.id); }} className="rounded-lg bg-red-500/10 px-3 py-1 text-red-500 disabled:opacity-40">
                    {t("Өшіру|Удалить|Delete")}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !err && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-mute">{t("Өтінім жоқ.|Заявок нет.|No applications.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
