"use client";
import { useState } from "react";
import { toast } from "@/lib/fx";

const skills: [string, number][] = [["HTML", 90], ["CSS", 85], ["JavaScript", 64], ["React", 30], ["Git", 70]];
const works = [
  { t: "Оқу жобасы: 4everr", d: "2026 · Next.js, Tailwind", x: "Кабинет пен вакансия беттерінің UI-ын жасады." },
  { t: "Портфолио сайты", d: "2025 · HTML, CSS, JS", x: "Жеке сайт, адаптивті макет, қараңғы режим." },
];

export default function ResumePage() {
  const [visible, setVisible] = useState(true);
  function copy() {
    navigator.clipboard?.writeText(window.location.href);
    toast("Сілтеме көшірілді", "Резюмені жұмыс берушіге жібере аласыз");
  }
  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
      <aside className="card p-5 lg:sticky lg:top-20 grid gap-4">
        <div className="w-20 h-20 rounded-2xl bg-soft text-brand grid place-items-center text-2xl font-bold">ӘЖ</div>
        <div><h1 className="font-bold text-xl">Әсел Жақсылық</h1><p className="text-mute text-sm">Junior Frontend әзірлеуші</p></div>
        <p className="text-sm text-mute">Астана · asel@mail.kz<br />github.com/asel</p>
        <label className="flex items-center justify-between gap-3 text-sm font-semibold">
          Жұмыс берушілерге көрінеді
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="w-5 h-5" />
        </label>
        <span className={"chip " + (visible ? "c-ok" : "c-w")}>{visible ? "Ашық" : "Жасырын"}</span>
        <button className="btn btn-p" onClick={copy}>Сілтемені көшіру</button>
        <button className="btn btn-s" onClick={() => window.print()}>PDF ретінде сақтау</button>
      </aside>
      <div className="grid gap-4 min-w-0">
        <section className="card p-6">
          <h2 className="font-bold text-lg mb-2">Өзім туралы</h2>
          <p className="text-mute max-w-[70ch]">Frontend бағытын оқып жатқан студентпін. Таза әрі ыңғайлы интерфейстер жасағанды ұнатамын, командада жұмыс істеуге дайынмын.</p>
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-lg mb-3">Дағдылар</h2>
          <div className="grid gap-3">
            {skills.map((s) => (
              <div key={s[0]}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{s[0]}</span><span className="text-mute">{s[1]}%</span></div>
                <div className="h-2 rounded-full bg-line overflow-hidden mt-1"><div className="bar h-full bg-brand" style={{ "--w": s[1] + "%" } as React.CSSProperties} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-lg mb-3">Жобалар</h2>
          <div className="grid gap-4">
            {works.map((w) => (
              <div key={w.t} className="border-l-2 border-brand pl-4"><p className="font-semibold">{w.t}</p><p className="text-xs text-mute">{w.d}</p><p className="text-sm text-mute mt-1">{w.x}</p></div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-bold text-lg mb-2">Білім</h2>
          <p className="font-semibold">Астана IT университеті</p><p className="text-sm text-mute">Бағдарламалық инженерия · 2024 – 2028</p>
        </section>
      </div>
    </div>
  );
}
