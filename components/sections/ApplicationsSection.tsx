"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { APPS_KEY, appCls, appLabel, appStatuses, seedApps, type AppStatus, type Application } from "@/lib/apps";

export default function ApplicationsSection() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [apps] = useLocal<Application[]>(APPS_KEY, seedApps);
  const [f, setF] = useState<"ALL" | AppStatus>("ALL");
  const mine = apps.filter((a) => a.email === user?.email);
  const list = mine.filter((a) => f === "ALL" || a.status === f);

  if (mine.length === 0)
    return (
      <div className="card p-6 grid gap-3 justify-items-start">
        <p className="text-mute">{t("Әлі өтініш жіберілмеген.|Откликов пока нет.|No applications yet.")}</p>
        <Link href="/jobs" className="btn btn-p">{t("Вакансияларды қарау|Смотреть вакансии|Browse jobs")}</Link>
      </div>
    );
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button className={"btn " + (f === "ALL" ? "btn-p" : "btn-s")} onClick={() => setF("ALL")}>{t("Барлығы|Все|All")} · {mine.length}</button>
        {appStatuses.map((s) => (
          <button key={s} className={"btn " + (f === s ? "btn-p" : "btn-s")} onClick={() => setF(s)}>{t(appLabel[s])} · {mine.filter((a) => a.status === s).length}</button>
        ))}
      </div>
      {list.length === 0 && <p className="text-mute">{t("Бұл күйде өтініш жоқ.|Нет откликов с этим статусом.|No applications with this status.")}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((a) => (
          <Link key={a.id} href={`/jobs?job=${encodeURIComponent(a.vacancyId)}`} className="card p-5 grid gap-2 transition-colors hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
            <div className="flex items-start justify-between gap-2"><p className="font-bold leading-snug">{t(a.vacancy)}</p><span className={"chip " + appCls[a.status]}>{t(appLabel[a.status])}</span></div>
            <p className="text-sm text-mute">{t(a.company)} · {a.date}</p>
            <div><p className="text-sm font-semibold">{t("Қысқаша хат|Сопроводительное письмо|Cover letter")}</p><p className="text-sm text-mute">{t(a.cover)}</p></div>
            <span className="mt-1 text-sm font-semibold text-brand">{t("Вакансияны ашу →|Открыть вакансию →|Open vacancy →")}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
