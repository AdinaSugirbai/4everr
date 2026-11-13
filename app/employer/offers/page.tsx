"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { OFFERS_KEY, seedOffers, statusCls, statusLabel, type Offer } from "@/lib/offers";
import { JOBS_KEY, seedJobs, type Job } from "@/lib/jobs";
import { bad, FieldErr } from "@/lib/ui";
import { burst, toast } from "@/lib/fx";

const FORMATS = ["Офис|Офис|Office", "Қашықтан|Удалённо|Remote", "Гибрид|Гибрид|Hybrid"];

export default function EmployerOffersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [offers, save] = useLocal<Offer[]>(OFFERS_KEY, seedOffers);
  const [mine] = useLocal<Job[]>(JOBS_KEY, []);
  const [company] = useLocal("4everr:company", { name: "Kaspi Lab", city: "Astana" });
  const vacs = [...mine, ...seedJobs].map((j) => j.title);
  const [f, setF] = useState({ vacancy: "", salary: "300 000 – 400 000 ₸", format: FORMATS[2], deadline: "", message: "" });
  const [me, setMe] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  function send(e: React.MouseEvent<HTMLButtonElement>) {
    if (f.message.trim().length < 10) { setMe("Кемінде 10 таңба жазыңыз|Минимум 10 символов|At least 10 characters"); return; }
    setMe("");
    const d = new Date().toLocaleDateString("ru-RU");
    const o: Offer = { id: Date.now(), vacancy: f.vacancy || vacs[0], company: company.name, salary: f.salary, format: f.format, city: company.city, message: f.message, date: d, deadline: f.deadline || "—", contact: user?.email ?? "", status: "NEW", history: [{ s: "NEW", d }] };
    save([o, ...offers]);
    setF({ ...f, message: "" });
    burst(e.currentTarget);
    toast(t("Ұсыныс жіберілді|Предложение отправлено|Offer sent"), t("Кандидат оны өз кабинетінде көреді|Кандидат увидит его в своём кабинете|The candidate will see it in their dashboard"));
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">{t("Ұсыныс жіберу|Отправить предложение|Send an offer")}</h1>
        <div><label htmlFor="v" className="font-semibold text-sm">{t("Вакансия|Вакансия|Job")}</label>
          <select id="v" className="inp mt-1" value={f.vacancy || vacs[0]} onChange={set("vacancy")}>{vacs.map((v, i) => <option key={i} value={v}>{t(v)}</option>)}</select></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label htmlFor="s" className="font-semibold text-sm">{t("Жалақы|Зарплата|Salary")}</label><input id="s" className="inp mt-1" value={f.salary} onChange={set("salary")} /></div>
          <div><label htmlFor="fm" className="font-semibold text-sm">{t("Формат|Формат|Format")}</label>
            <select id="fm" className="inp mt-1" value={f.format} onChange={set("format")}>{FORMATS.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></div>
        </div>
        <div><label htmlFor="dl" className="font-semibold text-sm">{t("Жауап беру мерзімі|Срок ответа|Reply deadline")}</label><input id="dl" className="inp mt-1" value={f.deadline} onChange={set("deadline")} placeholder="20.11.2026" /></div>
        <div><label htmlFor="m" className="font-semibold text-sm">{t("Хабарлама кандидатқа|Сообщение кандидату|Message to the candidate")}</label><textarea id="m" rows={4} className="inp mt-1" style={bad(me)} value={f.message} onChange={set("message")} /><FieldErr e={me} /></div>
        <button className="btn btn-p w-fit" onClick={send}>{t("Ұсыныс жіберу|Отправить предложение|Send offer")}</button>
      </div>
      <div className="grid gap-3">
        <h2 className="font-bold text-lg">{t("Жіберілген ұсыныстар|Отправленные предложения|Sent offers")}</h2>
        {offers.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex items-start justify-between gap-2"><p className="font-semibold">{t(o.vacancy)}</p><span className={"chip " + statusCls[o.status]}>{t(statusLabel[o.status])}</span></div>
            <p className="text-sm text-mute mt-1">{o.salary} · {t(o.format)} · {o.date}</p>
            <p className="text-xs text-mute mt-2">{t("Соңғы өзгеріс|Последнее изменение|Last change")}: {o.history[o.history.length - 1].d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
