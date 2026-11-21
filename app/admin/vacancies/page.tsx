"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { setVacancyStatus, deleteVacancy, updateVacancy } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

type V = {
  id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  level: string;
  status: "ACTIVE" | "PAUSED";
  created_at: string;
  moderation: "PENDING" | "APPROVED" | "REJECTED";
  expires_at: string | null;
  views: number;
};
type Filter = "ALL" | "ACTIVE" | "PAUSED";

export default function AdminVacancies() {
  const [rows, setRows] = useState<V[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [drafts, setDrafts] = useState<Record<string, Pick<V, "title" | "company" | "city" | "salary" | "level">>>({});
  const { t } = useI18n();
  const expiry = useRef<Record<string, string>>({});
  const moderate = async (id: string, m: V["moderation"], date: string) => {
    const { error } = await supabase().rpc("admin_set_vacancy_moderation", { target: id, new_moderation: m, new_expires: date ? new Date(date).toISOString() : null });
    if (error) throw error;
  };
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const base = supabase()
      .from("vacancies")
      .select("id, title, company, city, salary, level, status, created_at, moderation, expires_at, views")
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

  function edit(id: string, field: "title" | "company" | "city" | "salary" | "level", value: string, row: V) {
    setDrafts({ ...drafts, [id]: { ...(drafts[id] ?? row), [field]: value } });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">{t("Вакансиялар|Вакансии|Vacancies")} ({rows.length})</h1>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "PAUSED"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-sm ${
                filter === f ? "bg-brand text-white" : "border border-line bg-sf text-ink"
              }`}
            >
              {f === "ALL" ? t("Барлығы|Все|All") : f === "ACTIVE" ? t("Белсенді|Активные|Active") : t("Тоқтатылған|Приостановленные|Paused")}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">{t("Атауы|Название|Title")}</th>
              <th className="px-4 py-3">{t("Компания|Компания|Company")}</th>
              <th className="px-4 py-3">{t("Қала|Город|City")}</th>
              <th className="px-4 py-3">{t("Деңгей|Уровень|Level")}</th>
              <th className="px-4 py-3">{t("Жалақы|Зарплата|Salary")}</th>
              <th className="px-4 py-3">{t("Күйі|Статус|Status")}</th>
              <th className="px-4 py-3">{t("Тексеру және мерзім|Модерация и срок|Moderation & expiry")}</th>
              <th className="px-4 py-3">{t("Әрекет|Действия|Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const draft = drafts[r.id] ?? r;
              return (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3"><input aria-label={t("Атауы|Название|Title")} className="w-48 rounded-lg border border-line bg-bg px-2 py-1 text-ink" value={draft.title} onChange={(e) => edit(r.id, "title", e.target.value, r)} /></td>
                <td className="px-4 py-3"><input aria-label={t("Компания|Компания|Company")} className="w-40 rounded-lg border border-line bg-bg px-2 py-1 text-ink" value={draft.company} onChange={(e) => edit(r.id, "company", e.target.value, r)} /></td>
                <td className="px-4 py-3"><input aria-label={t("Қала|Город|City")} className="w-32 rounded-lg border border-line bg-bg px-2 py-1 text-ink" value={draft.city} onChange={(e) => edit(r.id, "city", e.target.value, r)} /></td>
                <td className="px-4 py-3"><input aria-label={t("Деңгей|Уровень|Level")} className="w-24 rounded-lg border border-line bg-bg px-2 py-1 text-ink" value={draft.level} onChange={(e) => edit(r.id, "level", e.target.value, r)} /></td>
                <td className="px-4 py-3"><input aria-label={t("Жалақы|Зарплата|Salary")} className="w-32 rounded-lg border border-line bg-bg px-2 py-1 text-ink" value={draft.salary} onChange={(e) => edit(r.id, "salary", e.target.value, r)} /></td>
                <td className="px-4 py-3">
                  <span className={r.status === "ACTIVE" ? "text-brand" : "text-amber-500"}>
                    {r.status === "ACTIVE" ? t("Белсенді|Активная|Active") : t("Тоқтатылған|Приостановлена|Paused")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-48 flex-col gap-2">
                    <span className={r.moderation === "APPROVED" ? "text-brand" : r.moderation === "PENDING" ? "text-amber-500" : "text-red-500"}>
                      {r.moderation === "APPROVED" ? t("Рұқсат етілген|Одобрена|Approved") : r.moderation === "PENDING" ? t("Тексеруде|На проверке|Pending") : t("Қабылданбады|Отклонена|Rejected")} · 👁 {r.views}
                    </span>
                    <input type="date" aria-label={t("Жарамдылық мерзімі|Срок действия|Valid until")} defaultValue={r.expires_at?.slice(0, 10) ?? ""} onChange={(e) => (expiry.current[r.id] = e.target.value)} className="rounded-lg border border-line bg-bg px-2 py-1 text-ink" />
                    <div className="flex gap-2">
                      <button disabled={busy === r.id} onClick={() => run(r.id, () => moderate(r.id, "APPROVED", expiry.current[r.id] ?? r.expires_at?.slice(0, 10) ?? ""))} className="rounded-lg bg-brand px-3 py-1 text-white disabled:opacity-40">{t("Рұқсат ету|Одобрить|Approve")}</button>
                      <button disabled={busy === r.id} onClick={() => run(r.id, () => moderate(r.id, "REJECTED", expiry.current[r.id] ?? r.expires_at?.slice(0, 10) ?? ""))} className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40">{t("Қабылдамау|Отклонить|Reject")}</button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busy === r.id || JSON.stringify(draft) === JSON.stringify(r)}
                      onClick={() => run(r.id, () => updateVacancy(r.id, draft))}
                      className="rounded-lg bg-brand px-3 py-1 text-white disabled:opacity-40"
                    >
                      {t("Өзгерісті сақтау|Сохранить изменения|Save changes")}
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() =>
                        run(r.id, () => setVacancyStatus(r.id, r.status === "ACTIVE" ? "PAUSED" : "ACTIVE"))
                      }
                      className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40"
                    >
                      {r.status === "ACTIVE" ? t("Тоқтату|Приостановить|Pause") : t("Қосу|Активировать|Activate")}
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => {
                        if (confirm(t("Вакансияны өшіресіз бе?|Удалить вакансию?|Delete this vacancy?"))) run(r.id, () => deleteVacancy(r.id));
                      }}
                      className="rounded-lg bg-red-500/10 px-3 py-1 text-red-500 disabled:opacity-40"
                    >
                      {t("Өшіру|Удалить|Delete")}
                    </button>
                  </div>
                </td>
              </tr>
            );})}
            {rows.length === 0 && !err && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-mute">{t("Вакансия жоқ.|Вакансий нет.|No vacancies.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
