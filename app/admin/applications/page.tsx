"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { deleteApplication, setAppStatus, type AppStatus } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

// The applicant's details are stored on the application itself, so no join with profiles is needed.
type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  city: string;
  job_title: string;
  company: string;
  status: AppStatus;
  created_at: string;
  cover: string;
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
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase()
      .from("applications")
      .select("id, name, email, phone, position, city, job_title, company, status, created_at, cover")
      .order("created_at", { ascending: false });
    setErr(error ? error.message : null);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
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

  const dateLocale = lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">{t("Өтінімдер|Заявки|Applications")} ({rows.length})</h1>
        <button onClick={() => load()} disabled={loading} className="rounded-xl border border-line px-4 py-2 text-sm text-ink hover:bg-soft disabled:opacity-40">
          {t("Жаңарту|Обновить|Refresh")}
        </button>
      </div>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">{t("Үміткер|Кандидат|Candidate")}</th>
              <th className="px-4 py-3">{t("Позиция, қала|Позиция, город|Position, city")}</th>
              <th className="px-4 py-3">{t("Вакансия|Вакансия|Vacancy")}</th>
              <th className="px-4 py-3">{t("Күні|Дата|Date")}</th>
              <th className="px-4 py-3">{t("Күйі|Статус|Status")}</th>
              <th className="px-4 py-3">{t("Әрекет|Действия|Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-ink">{r.name || "—"}</p>
                    <p className="text-xs text-mute">{r.email}</p>
                    {r.phone && <p className="text-xs text-mute">{r.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-mute">{[r.position, r.city].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{r.job_title}</p>
                    <p className="text-xs text-mute">{r.company}</p>
                  </td>
                  <td className="px-4 py-3 text-mute">{new Date(r.created_at).toLocaleDateString(dateLocale)}</td>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOpenId(openId === r.id ? null : r.id)}
                        className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft"
                      >
                        {openId === r.id ? t("Жасыру|Скрыть|Hide") : t("Хат|Письмо|Letter")}
                      </button>
                      <button
                        disabled={busy === r.id}
                        onClick={() => { if (confirm(t("Өтінімді өшіресіз бе?|Удалить заявку?|Delete this application?"))) remove(r.id); }}
                        className="rounded-lg bg-red-500/10 px-3 py-1 text-red-500 disabled:opacity-40"
                      >
                        {t("Өшіру|Удалить|Delete")}
                      </button>
                    </div>
                  </td>
                </tr>
                {openId === r.id && (
                  <tr className="border-b border-line bg-soft/40 last:border-0">
                    <td colSpan={6} className="px-4 py-4">
                      <p className="whitespace-pre-line text-sm text-ink">
                        {r.cover || t("Сопроводительное письмо жоқ|Сопроводительного письма нет|No cover letter")}
                      </p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {rows.length === 0 && !err && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-mute">
                  {loading ? t("Жүктелуде...|Загрузка...|Loading...") : t("Өтінім жоқ.|Заявок нет.|No applications.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
