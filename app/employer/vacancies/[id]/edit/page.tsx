"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { fetchMyJob, updateMyJob, type DbJob, type NewJob } from "@/lib/db";

type Draft = {
  title: string; city: string; address: string; format: DbJob["format"];
  salary: string; level: string; direction: string; tags: string; description: string;
  requirements: string; experience: string; employment: string;
};

const lines = (s: string) => s.split("\n").map((v) => v.trim()).filter(Boolean);
const fromJob = (job: DbJob): Draft => ({
  title: job.title, city: job.city, address: job.address, format: job.format,
  salary: job.salary, level: job.level, direction: job.direction ?? "", tags: job.tags.join(", "),
  description: job.description, requirements: job.requirements.join("\n"),
  experience: job.experience, employment: job.employment,
});

export default function EditVacancyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [job, setJob] = useState<DbJob | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return () => { active = false; };
    fetchMyJob(id, user.id).then((value) => {
      if (active) { setJob(value); setDraft(fromJob(value)); }
    }).catch((e) => { if (active) setError((e as Error).message); });
    return () => { active = false; };
  }, [id, user]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function submit() {
    if (!user || !job || !draft) return;
    if (draft.title.trim().length < 3 || draft.description.trim().length < 30 || !draft.city.trim()) {
      setError(t("Атауын, қаласын және кемінде 30 таңбалы сипаттаманы толтырыңыз.|Заполните название, город и описание от 30 символов.|Enter a title, city and a description of at least 30 characters."));
      return;
    }
    setBusy(true); setError("");
    const update: NewJob = {
      title: draft.title.trim(), city: draft.city.trim(), address: draft.address.trim(), format: draft.format,
      salary: draft.salary.trim(), salaryFrom: job.salaryFrom, salaryTo: job.salaryTo, salaryTax: job.salaryTax,
      level: draft.level.trim(), direction: draft.direction.trim() || null, tags: lines(draft.tags.replaceAll(",", "\n")),
      description: draft.description.trim(), requirements: lines(draft.requirements), experience: draft.experience,
      employment: draft.employment, questions: job.questions,
    };
    try { await updateMyJob(job.id, user.id, update); router.push("/employer/vacancies"); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const field = (key: keyof Draft, label: string, multiline = false) => (
    <label className="grid gap-1 text-sm font-semibold" key={key}>{t(label)}
      {multiline
        ? <textarea className="inp" rows={key === "description" ? 6 : 4} value={draft?.[key] ?? ""} onChange={(e) => set(key, e.target.value as Draft[typeof key])} />
        : <input className="inp" value={draft?.[key] ?? ""} onChange={(e) => set(key, e.target.value as Draft[typeof key])} />}
    </label>
  );

  if (!draft || !job) return <div className="grid gap-3"><p className={error ? "text-red-500" : "text-mute"}>{error || t("Жүктелуде...|Загрузка...|Loading...")}</p><Link className="btn btn-s w-fit" href="/employer/vacancies">{t("Вакансияларға оралу|Назад к вакансиям|Back to jobs")}</Link></div>;
  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <header><Link href="/employer/vacancies" className="text-sm text-mute underline">‹ {t("Менің вакансияларым|Мои вакансии|My jobs")}</Link><h1 className="mt-3 text-2xl font-bold">{t("Вакансияны өңдеу|Редактировать вакансию|Edit vacancy")}</h1></header>
      <p className="rounded-xl bg-soft p-3 text-sm text-mute">{t("Маңызды өзгерістер қайта тексеруге жіберіледі.|Важные изменения отправляются на повторную проверку.|Material changes are sent for review again.")}</p>
      {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
      <section className="card grid gap-4 p-5">
        {field("title", "Вакансия атауы|Название вакансии|Job title")}
        <div className="grid gap-4 sm:grid-cols-2">{field("city", "Қала|Город|City")}{field("address", "Мекенжай|Адрес|Address")}</div>
        <label className="grid gap-1 text-sm font-semibold">{t("Формат|Формат|Work format")}
          <select className="inp" value={draft.format} onChange={(e) => set("format", e.target.value as Draft["format"])}><option value="office">{t("Офис|Офис|Office")}</option><option value="hybrid">{t("Гибрид|Гибрид|Hybrid")}</option><option value="remote">{t("Қашықтан|Удалённо|Remote")}</option></select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">{field("level", "Деңгей|Уровень|Level")}{field("direction", "Бағыт|Направление|Direction")}</div>
        <div className="grid gap-4 sm:grid-cols-2">{field("salary", "Жалақы|Зарплата|Salary")}{field("tags", "Дағдылар (үтірмен)|Навыки (через запятую)|Skills (comma separated)")}</div>
        {field("description", "Сипаттама|Описание|Description", true)}
        {field("requirements", "Талаптар (әр жолға біреу)|Требования (по одному в строке)|Requirements (one per line)", true)}
        <div className="grid gap-4 sm:grid-cols-2">{field("experience", "Тәжірибе|Опыт|Experience")}{field("employment", "Жұмыс түрі|Тип занятости|Employment")}</div>
        <button className="btn btn-p w-fit" disabled={busy} onClick={submit}>{busy ? t("Сақталуда...|Сохранение...|Saving...") : t("Өзгерістерді сақтау|Сохранить изменения|Save changes")}</button>
      </section>
    </div>
  );
}
