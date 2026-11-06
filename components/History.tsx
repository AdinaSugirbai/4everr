"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { applications, savedJobs, statusUi, tests, type AppStatus } from "@/lib/data";

const tabs = ["Тест нәтижелері", "Өтінімдерім", "Таңдаулылар"];
type Opt = { v: string; l: string };

function Toolbar({ chips, value, onChange, sorts, sort, onSort }: { chips: Opt[]; value: string; onChange: (v: string) => void; sorts: Opt[]; sort: string; onSort: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((c) => (
        <button key={c.v} onClick={() => onChange(c.v)} className={`chip min-h-[32px] ${value === c.v ? "c-ok" : "c-i"}`}>{c.l}</button>
      ))}
      <select className="inp ml-auto" style={{ width: "auto" }} value={sort} onChange={(e) => onSort(e.target.value)} aria-label="Сұрыптау">
        {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
      </select>
    </div>
  );
}

function Tests() {
  const [f, setF] = useState("all");
  const [s, setS] = useState("new");
  const base = tests.filter((t) => f === "all" || t.topic === f);
  const rows = s === "best" ? [...base].sort((a, b) => b.score - a.score) : s === "worst" ? [...base].sort((a, b) => a.score - b.score) : s === "old" ? [...base].reverse() : base;
  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={["all", "HTML", "CSS", "JavaScript", "Java"].map((v) => ({ v, l: v === "all" ? "Барлығы" : v }))}
        sorts={[{ v: "new", l: "Жаңасы бірінші" }, { v: "old", l: "Ескісі бірінші" }, { v: "best", l: "Ең жақсы нәтиже" }, { v: "worst", l: "Ең төмен нәтиже" }]} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="text-left text-mute"><tr><th className="py-2 font-medium">Тест</th><th className="font-medium">Деңгей</th><th className="font-medium w-40">Нәтиже</th><th className="font-medium">Уақыт</th><th className="font-medium">Күні</th></tr></thead>
          <tbody key={f + s}>
            {rows.map((t, k) => (
              <tr key={k} className="rv border-t border-line" style={{ "--i": k } as React.CSSProperties}>
                <td className="py-3 font-semibold">{t.topic}</td><td>{t.level}</td>
                <td><div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-line overflow-hidden"><div className="bar h-full bg-brand" style={{ "--w": t.score + "%" } as React.CSSProperties} /></div>
                  <span className={`chip ${t.score >= 80 ? "c-ok" : t.score >= 60 ? "c-w" : "c-b"}`}>{t.score}%</span>
                </div></td>
                <td className="text-mute">{t.time}</td><td className="text-mute">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">Бұл бағыт бойынша тест әлі тапсырылмаған.</p>}
    </div>
  );
}

function Applications() {
  const [f, setF] = useState("all");
  const [s, setS] = useState("new");
  const base = applications.filter((a) => f === "all" || a.status === f);
  const rows = s === "old" ? [...base].reverse() : base;
  const keys: ("all" | AppStatus)[] = ["all", "NEW", "VIEWED", "INVITED", "REJECTED"];
  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={keys.map((v) => ({ v, l: v === "all" ? "Барлығы" : statusUi[v].label }))}
        sorts={[{ v: "new", l: "Жаңасы бірінші" }, { v: "old", l: "Ескісі бірінші" }]} />
      <div id="t2" key={f + s} className="grid gap-3">
        {rows.map((a) => (
          <article key={a.title} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4">
            <div className="grow"><h3 className="font-semibold">{a.title}</h3><p className="text-sm text-mute">{a.meta}</p></div>
            <span className="text-sm text-mute">{a.date}</span>
            <span className={`chip ${statusUi[a.status].cls}`}>{statusUi[a.status].label}</span>
          </article>
        ))}
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">Бұл күйде өтінім жоқ.</p>}
    </div>
  );
}

function Saved() {
  const [f, setF] = useState("all");
  const [s, setS] = useState("high");
  const rows = savedJobs.filter((j) => f === "all" || j.level === f).sort((a, b) => (s === "high" ? b.salary - a.salary : a.salary - b.salary));
  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={["all", "Тағылымдама", "Junior", "Middle"].map((v) => ({ v, l: v === "all" ? "Барлығы" : v }))}
        sorts={[{ v: "high", l: "Жалақы: жоғарыдан төмен" }, { v: "low", l: "Жалақы: төменнен жоғары" }]} />
      <div id="t2" key={f + s} className="grid gap-3">
        {rows.map((j) => (
          <Link key={j.id} href={`/jobs/${j.id}`} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4 hover:bg-soft">
            <div className="grow"><h3 className="font-semibold">{j.title}</h3><p className="text-sm text-mute">{j.company} · {j.city}</p></div>
            <span className="chip c-i">{j.level}</span>
            <span className="font-bold text-brand">{j.salary.toLocaleString("ru-RU")} ₸</span>
          </Link>
        ))}
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">Бұл деңгейде сақталған вакансия жоқ.</p>}
    </div>
  );
}

export default function History() {
  const [tab, setTab] = useState(0);
  const [ink, setInk] = useState({ l: 0, w: 0 });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const b = refs.current[tab];
    if (b) setInk({ l: b.offsetLeft, w: b.offsetWidth });
  }, [tab]);
  return (
    <div className="card p-5 min-w-0">
      <h2 className="font-bold text-xl">Менің тарихым</h2>
      <p className="text-sm text-mute mt-1">Тесттер, өтінімдер және сақталған вакансиялар бір жерде.</p>
      <div role="tablist" className="mt-4 flex gap-4 border-b border-line relative overflow-x-auto">
        <span className="absolute bottom-0 h-0.5 bg-brand rounded" style={{ left: ink.l, width: ink.w, transition: "left .35s cubic-bezier(.2,.8,.2,1),width .35s" }} />
        {tabs.map((t, i) => (
          <button key={t} ref={(el) => { refs.current[i] = el; }} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="tab py-3 font-semibold text-mute min-h-[44px] whitespace-nowrap">{t}</button>
        ))}
      </div>
      {tab === 0 && <Tests />}
      {tab === 1 && <Applications />}
      {tab === 2 && <Saved />}
    </div>
  );
}
