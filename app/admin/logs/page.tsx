"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type Log = { id: string; action: string; target_id: string | null; details: string | null; created_at: string };
const ACTION_LABELS: Record<string, string> = {
  UPDATE_PROFILE: "Профиль өзгертілді|Профиль изменён|Profile updated",
  UPDATE_VACANCY: "Вакансия өзгертілді|Вакансия изменена|Vacancy updated",
  DELETE_APPLICATION: "Өтінім өшірілді|Заявка удалена|Application deleted",
  SET_ROLE: "Рөл өзгертілді|Роль изменена|Role changed",
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

  useEffect(() => {
    supabase()
      .from("admin_log")
      .select("id, action, target_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => (error ? setErr(error.message) : setLogs((data ?? []) as Log[])));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("Әрекет журналы|Журнал действий|Activity log")}</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="divide-y divide-line rounded-2xl border border-line bg-sf">
        {logs.map((l) => (
          <div key={l.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
            <span className="text-ink">
              <b className="font-medium">{ACTION_LABELS[l.action] ? t(ACTION_LABELS[l.action]) : l.action}</b>
              {l.details ? ` → ${l.details}` : ""}
            </span>
            <span className="text-mute">{new Date(l.created_at).toLocaleString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US")}</span>
          </div>
        ))}
        {logs.length === 0 && !err && <p className="px-4 py-6 text-mute">{t("Журнал әзірге бос.|Журнал пока пуст.|The activity log is empty.")}</p>}
      </div>
    </div>
  );
}
