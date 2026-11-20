"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { DATA_KEYS } from "@/lib/sections";
import { JOBS_KEY, fmtLabel, seedJobs, type Job } from "@/lib/jobs";

export default function SavedSection() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [ids, saveIds] = useLocal<string[]>(DATA_KEYS.saved(user?.email ?? ""), []);
  const [mine] = useLocal<Job[]>(JOBS_KEY, []);
  const jobs = [...mine, ...seedJobs].filter((j) => ids.includes(j.id));

  if (jobs.length === 0)
    return (
      <div className="card p-6 grid gap-3 justify-items-start">
        <p className="text-mute">{t("Сақталған вакансия жоқ.|Сохранённых вакансий нет.|No saved jobs yet.")}</p>
        <Link href="/jobs" className="btn btn-p">{t("Вакансияларды қарау|Смотреть вакансии|Browse jobs")}</Link>
      </div>
    );
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {jobs.map((j) => (
        <div key={j.id} className="card p-5 grid gap-2">
          <p className="font-bold leading-snug">{t(j.title)}</p>
          <p className="text-sm text-mute">{t(j.company)} · {t(j.city)} · {t(fmtLabel[j.format])}</p>
          <p className="font-semibold text-brand text-sm">{j.salary}</p>
          <div className="flex flex-wrap gap-2">{j.tags.map((g) => <span key={g} className="chip c-i">{g}</span>)}</div>
          <div className="flex gap-2 mt-1">
            <Link href={`/jobs?job=${encodeURIComponent(j.id)}`} className="btn btn-p">{t("Ашу|Открыть|Open")}</Link>
            <button className="btn btn-s" onClick={() => saveIds(ids.filter((x) => x !== j.id))}>{t("Өшіру|Убрать|Remove")}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
