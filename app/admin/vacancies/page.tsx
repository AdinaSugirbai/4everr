"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { FiEye } from "react-icons/fi";
import AdminListToolbar from "@/components/AdminListToolbar";
import AdminLoading from "@/components/AdminLoading";

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
type Sort = "newest" | "oldest" | "title" | "views";

export default function AdminVacancies() {
  const [rows, setRows] = useState<V[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function moderate(id: string, moderation: V["moderation"]) {
    const { error } = await supabase().rpc("admin_set_vacancy_moderation", {
      target: id,
      new_moderation: moderation,
      new_expires: null,
    });
    if (error) throw error;
  }

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let base = supabase()
      .from("vacancies")
      .select("id, title, company, city, salary, level, status, created_at, moderation, expires_at, views");
    if (filter !== "ALL") base = base.eq("status", filter);
    const safeQuery = query.trim().replace(/[^\p{L}\p{N}@._+\-\s]/gu, " ").replace(/\s+/g, " ");
    if (safeQuery) base = base.or(`title.ilike.%${safeQuery}%,company.ilike.%${safeQuery}%,city.ilike.%${safeQuery}%`);
    if (sort === "title") base = base.order("title", { ascending: true });
    else if (sort === "views") base = base.order("views", { ascending: false }).order("created_at", { ascending: false });
    else base = base.order("created_at", { ascending: sort === "oldest" });
    const { data, error } = await base;
    if (error) setErr(error.message);
    else setRows((data ?? []) as V[]);
    setLoading(false);
  }, [filter, query, sort]);

  useEffect(() => { load(); }, [load]);

  async function run(id: string, moderation: V["moderation"]) {
    setErr(null);
    setBusy(id);
    try {
      await moderate(id, moderation);
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
        <h1 className="text-2xl font-bold text-ink">{t("Вакансиялар|Вакансии|Vacancies")} ({rows.length})</h1>
      </div>

      <p className="text-sm text-mute">{t("Вакансия мазмұнын өзгертуге болмайды. Әкімші тек мақұлдайды немесе қабылдамайды.|Содержание вакансии нельзя редактировать. Администратор может только одобрить или отклонить её.|Vacancy content is read-only. Admins may only approve or reject a vacancy.")}</p>
      <AdminListToolbar search={query} onSearch={setQuery} placeholder="Вакансия, компания немесе қала|Вакансия, компания или город|Search vacancy, company or city" sort={sort} onSort={(value) => setSort(value as Sort)} sortOptions={[{ value: "newest", label: "Жаңадан ескіге|Сначала новые|Newest first" }, { value: "oldest", label: "Ескіден жаңаға|Сначала старые|Oldest first" }, { value: "title", label: "Атауы бойынша|По названию|By title" }, { value: "views", label: "Көп қаралғаны|По просмотрам|Most viewed" }]} filters={<select className="inp min-w-0" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label={t("Күй бойынша сүзу|Фильтр по статусу|Filter by status")}><option value="ALL">{t("Барлығы|Все|All")}</option><option value="ACTIVE">{t("Белсенді|Активные|Active")}</option><option value="PAUSED">{t("Тоқтатылған|Приостановленные|Paused")}</option></select>} />

      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      {loading && <AdminLoading />}

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
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              return (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">{r.title}</td>
                <td className="px-4 py-3 text-ink">{r.company}</td>
                <td className="px-4 py-3 text-ink">{r.city}</td>
                <td className="px-4 py-3 text-ink">{r.level}</td>
                <td className="px-4 py-3 text-ink">{r.salary}</td>
                <td className="px-4 py-3">
                  <span className={r.status === "ACTIVE" ? "text-brand" : "text-amber-500"}>
                    {r.status === "ACTIVE" ? t("Белсенді|Активная|Active") : t("Тоқтатылған|Приостановлена|Paused")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-48 flex-col gap-2">
                    <span className={r.moderation === "APPROVED" ? "text-brand" : r.moderation === "PENDING" ? "text-amber-500" : "text-red-500"}>
                      {r.moderation === "APPROVED" ? t("Рұқсат етілген|Одобрена|Approved") : r.moderation === "PENDING" ? t("Тексеруде|На проверке|Pending") : t("Қабылданбады|Отклонена|Rejected")} · <FiEye className="inline" aria-hidden="true" /> {r.views}
                    </span>
                    <span className="text-xs text-mute">{t("Жарамдылық мерзімі|Срок действия|Valid until")}: {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "—"}</span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={busy === r.id || r.moderation === "APPROVED"} onClick={() => void run(r.id, "APPROVED")} className="rounded-lg bg-brand px-3 py-1 text-white disabled:opacity-40">{t("Мақұлдау|Одобрить|Approve")}</button>
                      <button type="button" disabled={busy === r.id || r.moderation === "REJECTED"} onClick={() => void run(r.id, "REJECTED")} className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40">{t("Қабылдамау|Отклонить|Reject")}</button>
                    </div>
                  </div>
                </td>
              </tr>
            );})}
            {rows.length === 0 && !err && !loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-mute">{t("Вакансия жоқ.|Вакансий нет.|No vacancies.")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
