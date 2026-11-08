"use client";
import { useState } from "react";
import ProgressRing from "@/components/ProgressRing";
import { useLocal } from "@/lib/store";
import { burst } from "@/lib/fx";

type Q = { q: string; a: string[]; ok: number };
type Result = { topic: string; score: number; date: string };

const bank: Record<string, Q[]> = {
  HTML: [
    { q: "Қай тег ең үлкен тақырыпты жасайды?", a: ["h1", "h6", "head", "title"], ok: 0 },
    { q: "Сілтеме жасайтын тег қайсы?", a: ["a", "link", "href", "p"], ok: 0 },
    { q: "Суретті қосатын тег қайсы?", a: ["picture", "img", "src", "image"], ok: 1 },
    { q: "Нөмірленген тізімді қай тег жасайды?", a: ["ul", "li", "ol", "dl"], ok: 2 },
  ],
  JavaScript: [
    { q: "Өзгермейтін айнымалыны қай кілт сөз жариялайды?", a: ["let", "const", "var", "set"], ok: 1 },
    { q: "typeof null нәтижесі қандай?", a: ["null", "undefined", "object", "number"], ok: 2 },
    { q: "Массивтің соңына элемент қосатын әдіс қайсы?", a: ["push", "pop", "shift", "slice"], ok: 0 },
    { q: "=== операторы нені тексереді?", a: ["Тек мәнін", "Мәні мен түрін", "Тек түрін", "Тек атын"], ok: 1 },
  ],
};

export default function TestPage() {
  const [results, saveResults] = useLocal<Result[]>("4everr:results", []);
  const [topic, setTopic] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const qs = topic ? bank[topic] : [];
  const done = topic !== null && i >= qs.length;
  const calc = (p: number[]) => Math.round((p.filter((x, k) => x === qs[k].ok).length / qs.length) * 100);

  function answer(n: number, e: React.MouseEvent<HTMLButtonElement>) {
    const next = [...picks, n];
    setPicks(next);
    setI(i + 1);
    if (i + 1 >= qs.length) {
      const s = calc(next);
      saveResults([{ topic: topic as string, score: s, date: new Date().toLocaleDateString("ru-RU") }, ...results]);
      if (s >= 75) burst(e.currentTarget);
    }
  }
  function reset() { setTopic(null); setI(0); setPicks([]); }

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto grid gap-5">
        <div><h1 className="font-bold text-2xl">Тест тапсыру</h1><p className="text-sm text-mute mt-1">Тақырыпты таңдаңыз, әр тестте 4 сұрақ бар.</p></div>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.keys(bank).map((t) => (<button key={t} onClick={() => setTopic(t)} className="card p-5 text-left hover:bg-soft"><p className="font-bold text-lg">{t}</p><p className="text-sm text-mute">{bank[t].length} сұрақ</p></button>))}
        </div>
        {results.length > 0 && (
          <div className="card p-5"><h2 className="font-bold mb-3">Менің нәтижелерім</h2>
            <div className="grid gap-2">{results.map((r, k) => (<div key={k} className="flex items-center justify-between text-sm"><span className="font-semibold">{r.topic}</span><span className="text-mute">{r.date}</span><span className={"chip " + (r.score >= 75 ? "c-ok" : r.score >= 50 ? "c-w" : "c-b")}>{r.score}%</span></div>))}</div></div>
        )}
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto card p-8 grid gap-4 justify-items-center text-center">
        <h1 className="font-bold text-2xl">{topic}: нәтиже</h1>
        <ProgressRing value={calc(picks)} size={140} className="text-3xl" />
        <p className="text-mute">{calc(picks) >= 75 ? "Тамаша нәтиже!" : calc(picks) >= 50 ? "Жаман емес, қайталап көріңіз." : "Тақырыпты қайталап, қайта тапсырыңыз."}</p>
        <div className="flex gap-2"><button className="btn btn-p" onClick={() => { setI(0); setPicks([]); }}>Қайта тапсыру</button><button className="btn btn-s" onClick={reset}>Басқа тест</button></div>
      </div>
    );
  }

  const q = qs[i];
  return (
    <div className="max-w-xl mx-auto card p-6 grid gap-5">
      <div><div className="flex justify-between text-sm text-mute"><span>{topic}</span><span>{i + 1} / {qs.length}</span></div>
        <div className="h-2 rounded-full bg-line overflow-hidden mt-2"><div className="h-full bg-brand" style={{ width: (i / qs.length) * 100 + "%", transition: "width .4s" }} /></div></div>
      <h1 className="font-bold text-xl">{q.q}</h1>
      <div className="grid gap-2">{q.a.map((o, n) => (<button key={n} onClick={(e) => answer(n, e)} className="btn btn-s justify-start text-left">{o}</button>))}</div>
    </div>
  );
}
