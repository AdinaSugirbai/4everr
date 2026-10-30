"use client";
import { useEffect, useRef, useState } from "react";
import { applications, statusUi, tests } from "@/lib/data";

const topics = ["all", "HTML", "CSS", "JavaScript", "Java"];

export default function History() {
  const [tab, setTab] = useState(0);
  const [f, setF] = useState("all");
  const [ink, setInk] = useState({ l: 0, w: 0 });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const b = refs.current[tab];
    if (b) setInk({ l: b.offsetLeft, w: b.offsetWidth });
  }, [tab]);
  const rows = tests.filter((t) => f === "all" || t.topic === f);

  return (
    <div className="card p-5 min-w-0">
      <h2 className="font-bold text-xl">Менің тарихым</h2>
      <p className="text-sm text-mute mt-1">Тапсырған тесттер мен жіберілген өтінімдер бір жерде.</p>
      <div role="tablist" className="mt-4 flex gap-4 border-b border-line relative">
        <span className="absolute bottom-0 h-0.5 bg-brand rounded" style={{ left: ink.l, width: ink.w, transition: "left .35s cubic-bezier(.2,.8,.2,1),width .35s" }} />
        {["Тест нәтижелері", "Өтінімдерім"].map((t, i) => (
          <button key={t} ref={(el) => { refs.current[i] = el; }} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="tab py-3 font-semibold text-mute min-h-[44px]">{t}</button>
        ))}
      </div>

      {tab === 0 ? (
        <div className="pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {topics.map((t) => (
              <button key={t} onClick={() => setF(t)} className={`chip min-h-[32px] ${f === t ? "c-ok" : "c-i"}`}>{t === "all" ? "Барлығы" : t}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="text-left text-mute"><tr><th className="py-2 font-medium">Тест</th><th className="font-medium">Деңгей</th><th className="font-medium w-40">Нәтиже</th><th className="font-medium">Уақыт</th><th className="font-medium">Күні</th></tr></thead>
              <tbody id="rows" key={f}>
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
      ) : (
        <div id="t2" className="pt-4 grid gap-3">
          {applications.map((a) => (
            <article key={a.title} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4">
              <div className="grow"><h3 className="font-semibold">{a.title}</h3><p className="text-sm text-mute">{a.meta}</p></div>
              <span className="text-sm text-mute">{a.date}</span>
              <span className={`chip ${statusUi[a.status].cls}`}>{statusUi[a.status].label}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
