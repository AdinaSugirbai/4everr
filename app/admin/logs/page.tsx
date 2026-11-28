"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import AdminListToolbar from "@/components/AdminListToolbar";
import AdminLoading from "@/components/AdminLoading";

type Log = { id: string; action: string; target_id: string | null; details: string | null; created_at: string };
const ACTION_LABELS: Record<string, string> = {
  UPDATE_PROFILE: "Профиль өзгертілді|Профиль изменён|Profile updated",
  UPDATE_VACANCY: "Вакансия өзгертілді|Вакансия изменена|Vacancy updated",
  DELETE_APPLICATION: "Өтінім өшірілді|Заявка удалена|Application deleted",
  SET_ROLE: "Рөл өзгертілді|Роль изменена|Role changed",
  CHANGE_USER_ROLE: "Қолданушы рөлі өзгертілді|Роль пользователя изменена|User role changed",
  SET_BANNED: "Пайдаланушы күйі өзгертілді|Статус пользователя изменён|User status changed",
  DELETE_USER: "Пайдаланушы өшірілді|Пользователь удалён|User deleted",
  ARCHIVE_USER: "Аккаунт мұрағатталды|Аккаунт архивирован|Account archived",
  RESTORE_USER: "Аккаунт қалпына келтірілді|Аккаунт восстановлен|Account restored",
  DELETE_VACANCY: "Вакансия өшірілді|Вакансия удалена|Vacancy deleted",
  SET_VACANCY_STATUS: "Вакансия күйі өзгертілді|Статус вакансии изменён|Vacancy status changed",
  SET_APPLICATION_STATUS: "Өтінім күйі өзгертілді|Статус заявки изменён|Application status changed",
};

export default function AdminLogs() {
  const { t, lang } = useI18n();
  const [logs, setLogs] = useState<Log[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase()
      .from("admin_log")
      .select("id, action, target_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setErr(error.message); else { setErr(null); setLogs((data ?? []) as Log[]); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const actions = useMemo(() => [...new Set(logs.map((log) => log.action))].sort(), [logs]);
  const visibleLogs = useMemo(() => logs.filter((log) => (action === "ALL" || log.action === action)
    && `${log.action} ${log.details ?? ""} ${log.target_id ?? ""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => sort === "oldest" ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)), [logs, action, query, sort]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("Әрекет журналы|Журнал действий|Activity log")}</h1>
      <AdminListToolbar search={query} onSearch={setQuery} placeholder="Әрекет, дерек немесе ID бойынша іздеу|Поиск по действию, данным или ID|Search action, details or ID" sort={sort} onSort={setSort} sortOptions={[{ value: "newest", label: "Жаңадан ескіге|Сначала новые|Newest first" }, { value: "oldest", label: "Ескіден жаңаға|Сначала старые|Oldest first" }]} filters={<select className="inp min-w-0" value={action} onChange={(e) => setAction(e.target.value)} aria-label={t("Әрекет түрі|Тип действия|Action type")}><option value="ALL">{t("Барлық әрекет|Все действия|All actions")}</option>{actions.map((value) => <option key={value} value={value}>{ACTION_LABELS[value] ? t(ACTION_LABELS[value]) : value}</option>)}</select>} />
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      {loading && <AdminLoading />}
      <div className="divide-y divide-line rounded-2xl border border-line bg-sf">
        {visibleLogs.map((l) => (
          <div key={l.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
            <span className="text-ink">
              <b className="font-medium">{ACTION_LABELS[l.action] ? t(ACTION_LABELS[l.action]) : l.action}</b>
              {l.details ? ` → ${l.details}` : ""}
            </span>
            <span className="text-mute">{new Date(l.created_at).toLocaleString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}</span>
          </div>
        ))}
        {visibleLogs.length === 0 && !loading && !err && <p className="px-4 py-6 text-mute">{t("Журналда жазба табылмады.|Записи не найдены.|No log entries found.")}</p>}
      </div>
    </div>
  );
}
