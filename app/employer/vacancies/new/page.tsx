"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiPlus, FiX } from "react-icons/fi";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createJob, fetchCompany, fetchDirections, type CompanyInfo } from "@/lib/db";
import { toast } from "@/lib/fx";

const STEPS = ["Негізгі|Основное|Basics", "Талаптар|Требования|Requirements", "Шарттар|Условия|Conditions", "Сұрақтар|Вопросы|Questions"];
const EXP = [["NONE", "Тәжірибесіз|Без опыта|No experience"], ["1-3", "1–3 жыл|1–3 года|1–3 years"], ["3-6", "3–6 жыл|3–6 лет|3–6 years"], ["6+", "6 жылдан артық|Более 6 лет|6+ years"]];
const EMP = [["FULL", "Толық күн|Полная занятость|Full-time"], ["PART", "Жартылай|Частичная|Part-time"], ["INTERN", "Тағылымдама|Стажировка|Internship"], ["PROJECT", "Жоба|Проект|Project"]];
const FMT = [["office", "Офис|Офис|Office"], ["hybrid", "Гибрид|Гибрид|Hybrid"], ["remote", "Қашықтан|Удалённо|Remote"]];
const init = { title: "", direction: "", level: "Junior", city: "", address: "", experience: "NONE", skills: [] as string[], reqs: "", desc: "", employment: "FULL", format: "hybrid", from: "", to: "", tax: "GROSS", questions: [] as string[] };
const digits = (s: string) => s.replace(/\D/g, "");
const n = (s: string) => Number(s).toLocaleString("ru-RU");

export default function NewVacancyPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [f, setF] = useState(init);
  const [step, setStep] = useState(0);
  const [skill, setSkill] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirs, setDirs] = useState<string[]>([]);
  const [co, setCo] = useState<CompanyInfo | null>(null);
  const set = <K extends keyof typeof init>(k: K, v: (typeof init)[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => { fetchDirections().then(setDirs).catch(() => {}); }, []);
  useEffect(() => { if (user) fetchCompany(user.id).then(setCo); }, [user]);

  function check(s: number): string {
    if (s === 0 && (f.title.trim().length < 3 || !f.city.trim())) return "Атауы мен қаланы толтырыңыз|Заполните название и город|Fill in the title and city";
    if (s === 1 && (!f.skills.length || f.desc.trim().length < 30 || !f.reqs.trim())) return "Дағды, сипаттама (30+ таңба) және талаптарды толтырыңыз|Укажите навыки, описание (30+ символов) и требования|Add skills, a description (30+ chars) and requirements";
    if (s === 2 && f.from && f.to && Number(f.to) < Number(f.from)) return "Жалақы «дейін» «бастаптан» кем болмауы керек|«До» не может быть меньше «от»|“To” cannot be below “from”";
    return "";
  }
  function next() { const e = check(step); setErr(e && t(e)); if (!e) setStep(step + 1); }
  function addSkill() { const v = skill.trim(); if (v && !f.skills.includes(v)) set("skills", [...f.skills, v]); setSkill(""); }

  async function submit() {
    if (!user) return;
    for (let s = 0; s < 3; s++) { const e = check(s); if (e) { setStep(s); setErr(t(e)); return; } }
    const from = f.from ? Number(f.from) : null, to = f.to ? Number(f.to) : null;
    const salary = from && to ? `${n(f.from)} – ${n(f.to)} ₸` : from ? `${n(f.from)} ₸+` : to ? `≤ ${n(f.to)} ₸` : "Келісім бойынша|По договорённости|Negotiable";
    setBusy(true); setErr("");
    try {
      await createJob(user.id, {
        title: f.title.trim(), company: co?.name || user.name, city: f.city.trim(), format: f.format, salary, level: f.level,
        direction: f.direction || null, tags: f.skills, description: f.desc.trim(), reqs: f.reqs.split("\n").map((x) => x.trim()).filter(Boolean),
        salaryFrom: from, salaryTo: to, salaryTax: f.tax, experience: f.experience, employment: f.employment,
        address: f.address.trim(), questions: f.questions.map((x) => x.trim()).filter(Boolean),
      });
      toast(t("Вакансия тексеруге жіберілді|Вакансия отправлена на проверку|Job sent for review"), t("Әкімші растағаннан кейін жарияланады|Будет опубликована после одобрения|Published after admin approval"));
      router.push("/employer/vacancies");
    } catch (e) { setErr(t((e as Error).message)); } finally { setBusy(false); }
  }

  const sel = (k: "experience" | "employment" | "format", list: string[][]) => (
    <select className="inp mt-1" value={f[k]} onChange={(e) => set(k, e.target.value)}>{list.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}</select>
  );
  const L = (s: string) => <label className="text-sm font-semibold">{t(s)}</label>;

  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Жаңа вакансия|Новая вакансия|New job")}</h1>
        <Link href="/employer/vacancies" className="text-sm text-mute underline">{t("Вакансиялар тізімі|К списку вакансий|All jobs")}</Link>
      </div>
      {co && !co.verified && (
        <p className="rounded-xl p-3 text-sm" style={{ border: "1px solid var(--bt)" }}>
          {t("Компанияңыз әлі расталмаған: вакансия жарияланбайды.|Компания ещё не подтверждена: вакансия не будет опубликована.|Your company is not verified yet: the job will not be published.")}{" "}
          <Link href="/employer/profile" className="font-semibold underline">{t("БИН-ді толтыру|Указать БИН|Add BIN")}</Link>
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => <div key={s} className={"rounded-lg px-3 py-2 text-sm font-semibold " + (i === step ? "bg-brand text-white" : "bg-soft text-mute")}>{i + 1}. {t(s)}</div>)}
      </div>
      <div className="card grid gap-4 p-5">
        {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
        {step === 0 && <>
          <div>{L("Вакансия атауы *|Название вакансии *|Job title *")}<input className="inp mt-1" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>{L("IT бағыты|IT-направление|IT direction")}<select className="inp mt-1" value={f.direction} onChange={(e) => set("direction", e.target.value)}><option value="">—</option>{dirs.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div>{L("Деңгей|Уровень|Level")}<select className="inp mt-1" value={f.level} onChange={(e) => set("level", e.target.value)}>{["Intern", "Junior", "Middle", "Senior"].map((x) => <option key={x}>{x}</option>)}</select></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>{L("Қала *|Город *|City *")}<input className="inp mt-1" value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div>{L("Мекенжай|Адрес|Address")}<input className="inp mt-1" value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
          </div>
        </>}
        {step === 1 && <>
          <div>{L("Тәжірибе|Опыт|Experience")}{sel("experience", EXP)}</div>
          <div>{L("Негізгі дағдылар *|Ключевые навыки *|Key skills *")}
            <div className="mt-1 flex gap-2"><input className="inp" value={skill} onChange={(e) => setSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} /><button type="button" className="btn btn-s" aria-label="Add" onClick={addSkill}><FiPlus /></button></div>
            <div className="mt-2 flex flex-wrap gap-2">{f.skills.map((s) => <span key={s} className="chip c-ok inline-flex items-center gap-1">{s}<button type="button" aria-label="Remove" onClick={() => set("skills", f.skills.filter((x) => x !== s))}><FiX /></button></span>)}</div></div>
          <div>{L("Сипаттама *|Описание *|Description *")}<textarea rows={4} className="inp mt-1" value={f.desc} onChange={(e) => set("desc", e.target.value)} /></div>
          <div>{L("Талаптар (әр жолға біреуден) *|Требования (по одному в строке) *|Requirements (one per line) *")}<textarea rows={3} className="inp mt-1" value={f.reqs} onChange={(e) => set("reqs", e.target.value)} /></div>
        </>}
        {step === 2 && <>
          <div className="grid gap-4 sm:grid-cols-2"><div>{L("Жұмыс түрі|Тип занятости|Employment")}{sel("employment", EMP)}</div><div>{L("График|График|Schedule")}{sel("format", FMT)}</div></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>{L("Жалақы: бастап (₸)|Зарплата: от (₸)|Salary from (₸)")}<input inputMode="numeric" className="inp mt-1" value={f.from} onChange={(e) => set("from", digits(e.target.value))} /></div>
            <div>{L("Жалақы: дейін (₸)|Зарплата: до (₸)|Salary to (₸)")}<input inputMode="numeric" className="inp mt-1" value={f.to} onChange={(e) => set("to", digits(e.target.value))} /></div>
            <div>{L("Салық|Налог|Tax")}<select className="inp mt-1" value={f.tax} onChange={(e) => set("tax", e.target.value)}><option value="GROSS">{t("Салыққа дейін|До вычета налогов|Before tax")}</option><option value="NET">{t("Салықтан кейін|На руки|After tax")}</option></select></div>
          </div>
        </>}
        {step === 3 && <>
          <p className="text-sm text-mute">{t("Кандидатқа 5-ке дейін сұрақ қоюға болады. Міндетті емес.|До 5 вопросов кандидату. Необязательно.|Up to 5 questions for the candidate. Optional.")}</p>
          {f.questions.map((q, i) => (
            <div key={i} className="flex gap-2"><input className="inp" value={q} onChange={(e) => set("questions", f.questions.map((x, j) => (j === i ? e.target.value : x)))} /><button type="button" className="btn btn-s" aria-label="Remove" onClick={() => set("questions", f.questions.filter((_, j) => j !== i))}><FiX /></button></div>
          ))}
          {f.questions.length < 5 && <button type="button" className="btn btn-s w-fit" onClick={() => set("questions", [...f.questions, ""])}><FiPlus className="mr-1 inline" />{t("Сұрақ қосу|Добавить вопрос|Add question")}</button>}
          <div className="rounded-xl bg-soft p-4 text-sm"><b>{f.title || "—"}</b><br />{f.city} · {t(FMT.find((x) => x[0] === f.format)![1])} · {f.from || f.to ? `${f.from ? n(f.from) : ""} – ${f.to ? n(f.to) : ""} ₸` : t("Келісім бойынша|По договорённости|Negotiable")}<br />{f.skills.join(", ")}</div>
        </>}
        <div className="flex justify-between">
          <button type="button" className="btn btn-s" disabled={step === 0} onClick={() => { setErr(""); setStep(step - 1); }}><FiArrowLeft className="mr-1 inline" />{t("Артқа|Назад|Back")}</button>
          {step < 3 ? <button type="button" className="btn btn-p" onClick={next}>{t("Әрі қарай|Далее|Next")}<FiArrowRight className="ml-1 inline" /></button>
            : <button type="button" className="btn btn-p" disabled={busy} onClick={submit}>{t("Тексеруге жіберу|Отправить на проверку|Submit for review")}</button>}
        </div>
      </div>
    </div>
  );
}
