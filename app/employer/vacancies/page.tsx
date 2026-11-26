"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FiEye, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { deleteMyJob, fetchMyJobs, fetchReceivedApplications, type DbJob } from "@/lib/db";

type Tab = "ACTIVE" | "PENDING" | "REJECTED" | "EXPIRED";
const TABS: [Tab, string][] = [["ACTIVE", "Белсенді|Активные|Active"], ["PENDING", "Тексеруде|На проверке|Pending"], ["REJECTED", "Қабылданбады|Отклонены|Rejected"], ["EXPIRED", "Мерзімі өтті|Истекли|Expired"]];
const tabOf = (j: DbJob): Tab =>
  j.moderation === "PENDING" ? "PENDING" : j.moderation === "REJECTED" ? "REJECTED"
    : j.expiresAt && new Date(j.expiresAt) < new Date() ? "EXPIRED" : "ACTIVE";

export default function EmployerVacancies() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [counts, setCounts] = useState<Record<string, { all: number; fresh: number }>>({});
  const [tab, setTab] = useState<Tab>("ACTIVE");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [j, a] = await Promise.all([fetchMyJobs(user.id), fetchReceivedApplications(user.id)]);
      const c: Record<string, { all: number; fresh: number }> = {};
      a.forEach((x) => { const e = (c[x.vacancyId] ??= { all: 0, fresh: 0 }); e.all++; if (x.status === "NEW") e.fresh++; });
      setJobs(j); setCounts(c);
    } catch (e) { setErr((e as Error).message); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm(t("Вакансияны өшіресіз бе?|Удалить вакансию?|Delete this vacancy?"))) return;
    try { await deleteMyJob(id); await load(); } catch (e) { setErr((e as Error).message); }
  }
  const list = jobs.filter((j) => tabOf(j) === tab);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Менің вакансияларым|Мои вакансии|My jobs")}</h1>
        <Link href="/employer/vacancies/new" className="btn btn-p"><FiPlus className="mr-1 inline" />{t("Жаңа вакансия|Новая вакансия|New job")}</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <button key={k} aria-pressed={tab === k} className={"btn " + (tab === k ? "btn-p" : "btn-s")} onClick={() => setTab(k)}>{t(l)} {jobs.filter((j) => tabOf(j) === k).length}</button>)}
      </div>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      {list.length === 0 && <p className="text-mute">{t("Бұл бөлімде вакансия жоқ.|В этом разделе нет вакансий.|No jobs here.")}</p>}
      {list.map((j) => {
        const c = counts[j.id];
        return (
          <div key={j.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="grid gap-1"><b>{t(j.title)}</b><span className="text-sm text-mute">{t(j.city)} · {j.salary}</span>
              <span className="text-xs text-mute"><FiEye className="mr-1 inline" />{j.views}{j.expiresAt ? ` · ${new Date(j.expiresAt).toLocaleDateString("ru-RU")}` : ""}</span></div>
            <div className="flex items-center gap-2">
              <Link href="/employer/applications" className="btn btn-s"><FiUsers className="mr-1 inline" />{c?.all ?? 0}{c?.fresh ? <span className="chip c-w ml-2">+{c.fresh}</span> : null}</Link>
              <button className="btn btn-s" aria-label="Delete" onClick={() => remove(j.id)}><FiTrash2 /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
