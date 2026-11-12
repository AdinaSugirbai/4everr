"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import Modal from "@/components/Modal";
import { JOBS_KEY, fmtLabel, seedJobs, type Job } from "@/lib/jobs";
import { APPS_KEY, appCls, appLabel, seedApps, type Application } from "@/lib/apps";
import { emptyResume, resumeKey, validateResume, type Resume } from "@/lib/resume";
import { bad, FieldErr } from "@/lib/ui";
import { burst, toast } from "@/lib/fx";

export default function JobsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [mine] = useLocal<Job[]>(JOBS_KEY, []);
  const [apps, saveApps] = useLocal<Application[]>(APPS_KEY, seedApps);
  const [resume] = useLocal<Resume>(resumeKey(user?.email ?? ""), emptyResume);
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState("all");
  const [job, setJob] = useState<Job | null>(null);
  const [cover, setCover] = useState("");
  const [ce, setCe] = useState("");

  const all = [...mine, ...seedJobs];
  const list = all.filter((j) => (fmt === "all" || j.format === fmt) && (t(j.title) + " " + t(j.company) + " " + t(j.city) + " " + j.tags.join(" ")).toLowerCase().includes(q.trim().toLowerCase()));
  const complete = Object.keys(validateResume(resume)).length === 0;
  const applied = job ? apps.find((a) => a.vacancyId === job.id && a.email === user?.email) : undefined;

  function openJob(j: Job) { setJob(j); setCover(""); setCe(""); }
  function apply(ev: React.MouseEvent<HTMLButtonElement>) {
    if (!job || !user) return;
    if (cover.trim().length < 10) { setCe("Кемінде 10 таңба жазыңыз|Минимум 10 символов|At least 10 characters"); return; }
    const a: Application = {
      id: Date.now(), vacancyId: job.id, vacancy: job.title, company: job.company,
      name: user.name, email: user.email, position: resume.position, city: resume.city, phone: resume.phone,
      about: resume.about, education: resume.education, skills: resume.skills, photo: resume.photo,
      cover: cover.trim(), date: new Date().toLocaleDateString("ru-RU"), status: "NEW",
    };
    saveApps([a, ...apps]);
    setCe(""); setCover("");
    burst(ev.currentTarget);
    toast(t("Өтініш жіберілді|Отклик отправлен|Application sent"), t("Жұмыс беруші оны өтінімдер бөлімінде көреді|Работодатель увидит его в заявках|The employer will see it in Applications"));
  }

  return (
    <>
      <h1 className="font-bold text-2xl">{t("Вакансиялар|Вакансии|Jobs")}</h1>
      <div className="flex flex-wrap gap-3 mt-4 mb-5">
        <input className="inp grow" style={{ maxWidth: 420 }} aria-label={t("Іздеу|Поиск|Search")} placeholder={t("Атауы, компания, технология...|Название, компания, технология...|Title, company, technology...")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp" style={{ width: "auto" }} aria-label="Format" value={fmt} onChange={(e) => setFmt(e.target.value)}>
          <option value="all">{t("Барлық формат|Любой формат|Any format")}</option>
          {(Object.keys(fmtLabel) as (keyof typeof fmtLabel)[]).map((k) => <option key={k} value={k}>{t(fmtLabel[k])}</option>)}
        </select>
      </div>
      {list.length === 0 && <p className="text-mute">{t("Ештеңе табылмады.|Ничего не найдено.|Nothing found.")}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((j) => {
          const a = apps.find((x) => x.vacancyId === j.id && x.email === user?.email);
          return (
            <button key={j.id} onClick={() => openJob(j)} className="card p-5 text-left hover:bg-soft grid gap-2">
              <div className="flex items-start justify-between gap-2"><p className="font-bold leading-snug">{t(j.title)}</p>{a && <span className={"chip " + appCls[a.status]}>{t(appLabel[a.status])}</span>}</div>
              <p className="text-sm text-mute">{t(j.company)} · {t(j.city)} · {t(fmtLabel[j.format])}</p>
              <p className="font-semibold text-brand text-sm">{j.salary}</p>
              <div className="flex flex-wrap gap-2">{j.tags.map((g) => <span key={g} className="chip c-i">{g}</span>)}</div>
            </button>
          );
        })}
      </div>

      <Modal open={!!job} onClose={() => setJob(null)} title={job ? t(job.title) : ""} wide>
        {job && (
          <>
            <p className="text-mute">{t(job.company)} · {t(job.city)} · {t(fmtLabel[job.format])} · {job.level}</p>
            <p className="font-bold text-brand">{job.salary}</p>
            <div><h3 className="font-semibold mb-1">{t("Сипаттама|Описание|Description")}</h3><p className="text-mute">{t(job.desc)}</p></div>
            <div><h3 className="font-semibold mb-1">{t("Талаптар|Требования|Requirements")}</h3>
              <ul className="list-disc pl-5 text-mute">{job.reqs.map((x, i) => <li key={i}>{t(x)}</li>)}</ul></div>
            {applied ? (
              <p className="text-sm"><span className={"chip " + appCls[applied.status]}>{t(appLabel[applied.status])}</span> <span className="text-mute">{t("Өтініш жіберілген|Отклик отправлен|Application sent")} · {applied.date}</span></p>
            ) : !complete ? (
              <div className="rounded-xl p-3 text-sm" style={{ border: "1px solid var(--bt)", color: "var(--bt)" }}>
                {t("Өтініш қалдыру үшін резюмені толық толтырыңыз.|Для отклика полностью заполните резюме.|Complete your resume to apply.")}{" "}
                <Link href="/resume" className="font-semibold underline">{t("Резюмеге өту|Перейти к резюме|Go to resume")}</Link>
              </div>
            ) : (
              <div className="grid gap-3">
                <div><label htmlFor="cv" className="font-semibold text-sm">{t("Қысқаша хат|Сопроводительное письмо|Cover letter")}</label>
                  <textarea id="cv" rows={4} className="inp mt-1" style={bad(ce)} value={cover} onChange={(e) => setCover(e.target.value)} /><FieldErr e={ce} /></div>
                <button className="btn btn-p w-fit" onClick={apply}>{t("Өтініш қалдыру|Откликнуться|Apply")}</button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
