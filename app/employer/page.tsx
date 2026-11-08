"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLocal } from "@/lib/store";
import { OFFERS_KEY, seedOffers, type Offer } from "@/lib/offers";

const tiles = [
  { href: "/employer/vacancies/new", t: "Вакансия жариялау", d: "Жаңа вакансия жасап, модерацияға жіберу" },
  { href: "/employer/applications", t: "Келген өтінімдер", d: "Кандидаттарды қарау және бағалау" },
  { href: "/employer/offers", t: "Ұсыныстар", d: "Кандидатқа ұсыныс жіберу және жауабын көру" },
  { href: "/employer/profile", t: "Компания профилі", d: "Компания туралы ақпаратты өңдеу" },
];

export default function EmployerHome() {
  const { user } = useAuth();
  const [offers] = useLocal<Offer[]>(OFFERS_KEY, seedOffers);
  const stats = [
    ["Жіберілген ұсыныс", offers.length],
    ["Жауап күтуде", offers.filter((o) => o.status === "NEW" || o.status === "VIEWED" || o.status === "THINKING").length],
    ["Қабылданды", offers.filter((o) => o.status === "ACCEPTED").length],
  ];
  return (
    <>
      <h1 className="font-bold text-2xl">Сәлем, {user?.name}</h1>
      <p className="text-sm text-mute mt-1 mb-5">Жұмыс беруші кабинеті</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (<div key={String(s[0])} className="card p-5"><p className="text-3xl font-bold text-brand">{s[1]}</p><p className="text-sm text-mute">{s[0]}</p></div>))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {tiles.map((t) => (<Link key={t.href} href={t.href} className="card p-5 hover:bg-soft block"><p className="font-bold">{t.t}</p><p className="text-sm text-mute mt-1">{t.d}</p></Link>))}
      </div>
    </>
  );
}
