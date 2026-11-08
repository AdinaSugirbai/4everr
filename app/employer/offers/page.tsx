"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocal } from "@/lib/store";
import { OFFERS_KEY, seedOffers, statusCls, statusLabel, type Offer } from "@/lib/offers";
import { burst, toast } from "@/lib/fx";

const vacs = ["Junior Frontend әзірлеуші", "React тағылымдама", "UI/UX дизайнер (Junior)"];

export default function EmployerOffersPage() {
  const { user } = useAuth();
  const [offers, save] = useLocal<Offer[]>(OFFERS_KEY, seedOffers);
  const [company] = useLocal("4everr:company", { name: "Kaspi Lab", city: "Астана" });
  const [f, setF] = useState({ vacancy: vacs[0], salary: "300 000 – 400 000 ₸", format: "Гибрид", deadline: "", message: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  function send(e: React.MouseEvent<HTMLButtonElement>) {
    if (f.message.trim().length < 10) { toast("Хабарлама қысқа", "Кемінде 10 таңба жазыңыз"); return; }
    const d = new Date().toLocaleDateString("ru-RU");
    const o: Offer = { id: Date.now(), vacancy: f.vacancy, company: company.name, salary: f.salary, format: f.format, city: company.city, message: f.message, date: d, deadline: f.deadline || "—", contact: user?.email ?? "", status: "NEW", history: [{ s: "NEW", d }] };
    save([o, ...offers]);
    setF({ ...f, message: "" });
    burst(e.currentTarget);
    toast("Ұсыныс жіберілді", "Кандидат оны өз кабинетінде көреді");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">Ұсыныс жіберу</h1>
        <div><label htmlFor="v" className="font-semibold text-sm">Вакансия</label><select id="v" className="inp mt-1" value={f.vacancy} onChange={set("vacancy")}>{vacs.map((v) => <option key={v}>{v}</option>)}</select></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label htmlFor="s" className="font-semibold text-sm">Жалақы</label><input id="s" className="inp mt-1" value={f.salary} onChange={set("salary")} /></div>
          <div><label htmlFor="fm" className="font-semibold text-sm">Формат</label><select id="fm" className="inp mt-1" value={f.format} onChange={set("format")}><option>Офис</option><option>Қашықтан</option><option>Гибрид</option></select></div>
        </div>
        <div><label htmlFor="dl" className="font-semibold text-sm">Жауап беру мерзімі</label><input id="dl" className="inp mt-1" value={f.deadline} onChange={set("deadline")} placeholder="20.11.2026" /></div>
        <div><label htmlFor="m" className="font-semibold text-sm">Хабарлама кандидатқа</label><textarea id="m" rows={4} className="inp mt-1" value={f.message} onChange={set("message")} /></div>
        <button className="btn btn-p w-fit" onClick={send}>Ұсыныс жіберу</button>
      </div>
      <div className="grid gap-3">
        <h2 className="font-bold text-lg">Жіберілген ұсыныстар</h2>
        {offers.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex items-start justify-between gap-2"><p className="font-semibold">{o.vacancy}</p><span className={"chip " + statusCls[o.status]}>{statusLabel[o.status]}</span></div>
            <p className="text-sm text-mute mt-1">{o.salary} · {o.format} · {o.date}</p>
            <p className="text-xs text-mute mt-2">Соңғы өзгеріс: {o.history[o.history.length - 1].d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
