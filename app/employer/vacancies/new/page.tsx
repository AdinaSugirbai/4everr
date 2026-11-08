"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { JOBS_KEY, fmtLabel, type Job } from "@/lib/jobs";
import { bad, FieldErr } from "@/lib/ui";
import { burst, toast } from "@/lib/fx";

const init = { title: "", city: "", format: "hybrid", salary: "", level: "Junior", tags: "", desc: "", reqs: "" };

export default function NewVacancyPage() {
  const { t } = useI18n();
  const [mine, save] = useLocal<Job[]>(JOBS_KEY, []);
  const [company] = useLocal("4everr:company", { name: "Kaspi Lab" });
  const [f, setF] = useState(init);
  const [e, setE] = useState<Record<string, string>>({});
  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: ev.target.value });
  const req = "Міндетті өріс|Обязательное поле|Required field";

  function submit(ev: React.MouseEvent<HTMLButtonElement>) {
    const er: Record<string, string> = {};
    (["title", "city", "salary", "tags", "desc", "reqs"] as const).forEach((k) => { if (!f[k].trim()) er[k] = req; });
    setE(er);
    if (Object.keys(er).length) return;
    const j: Job = {
      id: "u" + Date.now(), title: f.title.trim(), company: company.name, city: f.city.trim(), format: f.format as Job["format"],
      salary: f.salary.trim(), level: f.level, tags: f.tags.split(",").map((x) => x.trim()).filter(Boolean),
      desc: f.desc.trim(), reqs: f.reqs.split("\n").map((x) => x.trim()).filter(Boolean),
    };
    save([j, ...mine]);
    setF(init);
    burst(ev.currentTarget);
    toast(t("Вакансия жарияланды|Вакансия опубликована|Job published"), t("Кандидаттар оны Вакансиялар бөлімінде көреді|Кандидаты увидят её в разделе Вакансии|Candidates will see it in Jobs"));
  }
  const fld = (k: keyof typeof init, label: string, ph?: string) => (
    <div><label htmlFor={k} className="font-semibold text-sm">{t(label)} *</label><input id={k} className="inp mt-1" style={bad(e[k])} value={f[k]} onChange={set(k)} placeholder={ph} /><FieldErr e={e[k]} /></div>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">{t("Вакансия жариялау|Публикация вакансии|Post a job")}</h1>
        {fld("title", "Атауы|Название|Title")}
        <div className="grid sm:grid-cols-2 gap-4">
          {fld("city", "Қала|Город|City")}
          <div><label htmlFor="format" className="font-semibold text-sm">{t("Формат|Формат|Format")}</label>
            <select id="format" className="inp mt-1" value={f.format} onChange={set("format")}>{(Object.keys(fmtLabel) as (keyof typeof fmtLabel)[]).map((k) => <option key={k} value={k}>{t(fmtLabel[k])}</option>)}</select></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {fld("salary", "Жалақы|Зарплата|Salary", "300 000 – 400 000 ₸")}
          <div><label htmlFor="level" className="font-semibold text-sm">{t("Деңгей|Уровень|Level")}</label>
            <select id="level" className="inp mt-1" value={f.level} onChange={set("level")}><option>Intern</option><option>Junior</option><option>Middle</option></select></div>
        </div>
        {fld("tags", "Технологиялар (үтірмен)|Технологии (через запятую)|Technologies (comma separated)", "HTML, CSS, React")}
        <div><label htmlFor="desc" className="font-semibold text-sm">{t("Сипаттама|Описание|Description")} *</label><textarea id="desc" rows={3} className="inp mt-1" style={bad(e.desc)} value={f.desc} onChange={set("desc")} /><FieldErr e={e.desc} /></div>
        <div><label htmlFor="reqs" className="font-semibold text-sm">{t("Талаптар (әр жолға біреуден)|Требования (по одному в строке)|Requirements (one per line)")} *</label><textarea id="reqs" rows={3} className="inp mt-1" style={bad(e.reqs)} value={f.reqs} onChange={set("reqs")} /><FieldErr e={e.reqs} /></div>
        <button className="btn btn-p w-fit" onClick={submit}>{t("Жариялау|Опубликовать|Publish")}</button>
      </div>
      <div className="grid gap-3">
        <h2 className="font-bold text-lg">{t("Менің вакансияларым|Мои вакансии|My jobs")}</h2>
        {mine.length === 0 && <p className="text-mute text-sm">{t("Әзірге жоқ.|Пока нет.|None yet.")}</p>}
        {mine.map((j) => (
          <div key={j.id} className="card p-4 flex items-start justify-between gap-3">
            <div><p className="font-semibold">{j.title}</p><p className="text-sm text-mute">{j.city} · {t(fmtLabel[j.format])} · {j.salary}</p></div>
            <button className="text-mute" aria-label="Delete" onClick={() => save(mine.filter((x) => x.id !== j.id))}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
