"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { bad, FieldErr } from "@/lib/ui";
import { toast } from "@/lib/fx";

type Company = { name: string; industry: string; city: string; size: string; site: string; about: string };
const empty: Company = { name: "Kaspi Lab", industry: "Fintech", city: "Astana", size: "50-200", site: "", about: "" };
const fields: [keyof Company, string][] = [["name", "Компания атауы|Название компании|Company name"], ["industry", "Сала|Сфера|Industry"], ["city", "Қала|Город|City"], ["size", "Қызметкер саны|Число сотрудников|Employees"], ["site", "Сайт|Сайт|Website"]];
const required: (keyof Company)[] = ["name", "industry", "city"];

export default function CompanyProfilePage() {
  const { t } = useI18n();
  const [saved, save] = useLocal<Company>("4everr:company", empty);
  const [draft, setDraft] = useState<Company | null>(null);
  const [tried, setTried] = useState(false);
  const c = draft ?? saved;
  const bads = (k: keyof Company) => (tried && required.includes(k) && !c[k].trim() ? "Міндетті өріс|Обязательное поле|Required field" : "");
  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({ ...c, [k]: e.target.value });

  function submit() {
    setTried(true);
    if (required.some((k) => !c[k].trim())) return;
    save(c); setDraft(null); setTried(false);
    toast(t("Профиль сақталды|Профиль сохранён|Profile saved"), t("Өзгерістер кандидаттарға көрінеді|Изменения увидят кандидаты|Candidates will see the changes"));
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">{t("Компания профилі|Профиль компании|Company profile")}</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (<div key={f[0]}><label htmlFor={f[0]} className="font-semibold text-sm">{t(f[1])}{required.includes(f[0]) ? " *" : ""}</label><input id={f[0]} className="inp mt-1" style={bad(bads(f[0]))} value={c[f[0]]} onChange={set(f[0])} /><FieldErr e={bads(f[0])} /></div>))}
        </div>
        <div><label htmlFor="about" className="font-semibold text-sm">{t("Компания туралы|О компании|About the company")}</label><textarea id="about" rows={5} className="inp mt-1" value={c.about} onChange={set("about")} /></div>
        <button className="btn btn-p w-fit" onClick={submit}>{t("Сақтау|Сохранить|Save")}</button>
      </div>
      <aside className="card p-5 lg:sticky lg:top-20 grid gap-2">
        <p className="text-sm text-mute">{t("Кандидат осылай көреді|Так увидит кандидат|Candidates will see this")}</p>
        <div className="w-14 h-14 rounded-2xl bg-soft text-brand grid place-items-center text-xl font-bold">{c.name.slice(0, 2).toUpperCase()}</div>
        <h2 className="font-bold text-xl">{c.name}</h2>
        <p className="text-sm text-mute">{c.industry} · {c.city} · {c.size}</p>
        {c.about && <p className="text-sm">{c.about}</p>}
      </aside>
    </div>
  );
}
