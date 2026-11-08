"use client";
import Link from "next/link";
import { useState } from "react";
import { useLocal } from "@/lib/store";

const dirs = ["Frontend", "Backend", "QA", "UI/UX"];
const qs: { q: string; o: [string, number][] }[] = [
  { q: "Қандай жұмыс сізге көбірек ұнайды?", o: [["Көрінетін бет жасау", 0], ["Деректермен және логикамен жұмыс", 1], ["Қателерді іздеп табу", 2], ["Сыртқы көрініс пен түс таңдау", 3]] },
  { q: "Жобада кім болғыңыз келеді?", o: [["Интерфейсті кодқа айналдыратын", 0], ["Сервер мен базаны жасайтын", 1], ["Сапаны тексеретін", 2], ["Макет жасайтын", 3]] },
  { q: "Қай тапсырма қызығырақ?", o: [["Түймелер мен анимация жасау", 0], ["API жазу", 1], ["Тест сценарийлерін жазу", 2], ["Қолданушыға ыңғайлы экран ойлап табу", 3]] },
  { q: "Сізге не жақсы шығады?", o: [["Көрінісін дәл келтіру", 0], ["Логикалық есептер шығару", 1], ["Мұқият тексеру", 2], ["Әдемі композиция жасау", 3]] },
];

export default function SurveyPage() {
  const [, saveSurvey] = useLocal<number[]>("4everr:survey", []);
  const [picks, setPicks] = useState<number[]>([]);
  const done = picks.length >= qs.length;
  const counts = dirs.map((_, d) => picks.filter((p) => p === d).length);
  const top = counts.indexOf(Math.max(...counts));

  function answer(d: number) {
    const next = [...picks, d];
    setPicks(next);
    if (next.length >= qs.length) saveSurvey(dirs.map((_, k) => next.filter((p) => p === k).length));
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto card p-6 grid gap-4">
        <h1 className="font-bold text-2xl">Сізге сәйкес бағыт</h1>
        <span className="chip c-ok w-fit text-base">{dirs[top]}</span>
        <div className="grid gap-3">
          {dirs.map((d, k) => (<div key={d}><div className="flex justify-between text-sm"><span className="font-semibold">{d}</span><span className="text-mute">{counts[k]} / {qs.length}</span></div><div className="h-2 rounded-full bg-line overflow-hidden mt-1"><div className="bar h-full bg-brand" style={{ "--w": (counts[k] / qs.length) * 100 + "%" } as React.CSSProperties} /></div></div>))}
        </div>
        <div className="flex gap-2"><Link href="/test" className="btn btn-p">Тест тапсыру</Link><button className="btn btn-s" onClick={() => setPicks([])}>Қайта өту</button></div>
      </div>
    );
  }

  const q = qs[picks.length];
  return (
    <div className="max-w-xl mx-auto card p-6 grid gap-5">
      <div className="flex justify-between text-sm text-mute"><span>Сауалнама</span><span>{picks.length + 1} / {qs.length}</span></div>
      <h1 className="font-bold text-xl">{q.q}</h1>
      <div className="grid gap-2">{q.o.map((o) => (<button key={o[0]} onClick={() => answer(o[1])} className="btn btn-s justify-start text-left">{o[0]}</button>))}</div>
    </div>
  );
}
