"use client";
import Link from "next/link";
import { useState } from "react";
import { vacancies } from "@/lib/data";

export default function VacancySearch() {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const list = vacancies.filter((v) => [v.title, v.company, v.city, v.level].join(" ").toLowerCase().includes(s));

  return (
    <div className="card p-6">
      <h2 className="font-bold text-lg mb-3">Басқа вакансияларды іздеу</h2>
      <input className="inp" placeholder="Атауы, компания немесе қала..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Вакансия іздеу" />
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {list.map((v) => (
          <Link key={v.id} href={"/jobs/" + v.id} className="border border-line rounded-xl p-4 hover:bg-soft">
            <p className="font-semibold">{v.title}</p>
            <p className="text-sm text-mute">{v.company} · {v.city} · {v.level}</p>
          </Link>
        ))}
      </div>
      {!list.length && <p className="py-6 text-center text-mute">Ештеңе табылмады.</p>}
    </div>
  );
}
