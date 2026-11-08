"use client";
import { useState } from "react";
import { useLocal } from "@/lib/store";
import { toast } from "@/lib/fx";

type Company = { name: string; industry: string; city: string; size: string; site: string; about: string };
const empty: Company = { name: "Kaspi Lab", industry: "Финтех", city: "Астана", size: "50-200", site: "", about: "" };
const fields: [keyof Company, string][] = [["name", "Компания атауы"], ["industry", "Сала"], ["city", "Қала"], ["size", "Қызметкер саны"], ["site", "Сайт"]];

export default function CompanyProfilePage() {
  const [saved, save] = useLocal<Company>("4everr:company", empty);
  const [draft, setDraft] = useState<Company | null>(null);
  const c = draft ?? saved;
  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({ ...c, [k]: e.target.value });
  function submit() { save(c); setDraft(null); toast("Профиль сақталды", "Өзгерістер кандидаттарға көрінеді"); }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">Компания профилі</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (<div key={f[0]}><label htmlFor={f[0]} className="font-semibold text-sm">{f[1]}</label><input id={f[0]} className="inp mt-1" value={c[f[0]]} onChange={set(f[0])} /></div>))}
        </div>
        <div><label htmlFor="about" className="font-semibold text-sm">Компания туралы</label><textarea id="about" rows={5} className="inp mt-1" value={c.about} onChange={set("about")} /></div>
        <button className="btn btn-p w-fit" onClick={submit}>Сақтау</button>
      </div>
      <aside className="card p-5 lg:sticky lg:top-20 grid gap-2">
        <p className="text-sm text-mute">Кандидат осылай көреді</p>
        <div className="w-14 h-14 rounded-2xl bg-soft text-brand grid place-items-center text-xl font-bold">{c.name.slice(0, 2).toUpperCase()}</div>
        <h2 className="font-bold text-xl">{c.name}</h2>
        <p className="text-sm text-mute">{c.industry} · {c.city} · {c.size} адам</p>
        {c.about && <p className="text-sm">{c.about}</p>}
      </aside>
    </div>
  );
}
