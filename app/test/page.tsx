"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import Silhouette from "@/components/Silhouette";
import { tests } from "@/lib/quizdata";
import { burst } from "@/lib/fx";

type Result = { topic: string; score: number; total: number; date: string };
type Card = { q: string; a: string[]; ok: number };

function shuffle<T>(x: T[]): T[] {
  const a = [...x];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function deal(id: string): Card[] {
  return tests[id].q.map((q) => {
    const order = shuffle(q.a.map((_, k) => k));
    return { q: q.q, a: order.map((k) => q.a[k]), ok: order.indexOf(0) };
  });
}

export default function TestPage() {
  const { t } = useI18n();
  const [results, saveResults] = useLocal<Result[]>("4everr:results", []);
  const [topic, setTopic] = useState<string | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = topic !== null && i >= deck.length;

  function start(id: string) { setTopic(id); setDeck(deal(id)); setI(0); setSel(null); setScore(0); }
  function pick(n: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (sel !== null) return;
    setSel(n);
    if (n === deck[i].ok) { setScore(score + 1); burst(e.currentTarget); }
  }
  function next() {
    if (i + 1 >= deck.length) saveResults([{ topic: topic as string, score, total: deck.length, date: new Date().toLocaleDateString("ru-RU") }, ...results]);
    setI(i + 1); setSel(null);
  }

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto grid gap-5">
        <div><h1 className="font-bold text-2xl">{t("Тест тапсыру|Пройти тест|Take a test")}</h1><p className="text-sm text-mute mt-1">{t("Әр дұрыс жауап IT-маман силуэтінің бір бөлігін береді.|Каждый верный ответ добавляет часть силуэта IT-специалиста.|Each correct answer adds a part of the IT specialist silhouette.")}</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(tests).map((id) => {
            const best = Math.max(0, ...results.filter((r) => r.topic === id).map((r) => Math.round((r.score / r.total) * 100)));
            return (<button key={id} onClick={() => start(id)} className="card p-5 text-left hover:bg-soft"><p className="font-bold text-lg">{t(tests[id].name)}</p><p className="text-sm text-mute">{tests[id].q.length} {t("сұрақ|вопросов|questions")}{best > 0 ? " · " + t("үздік|лучший|best") + " " + best + "%" : ""}</p></button>);
          })}
        </div>
        {results.length > 0 && (
          <div className="card p-5"><h2 className="font-bold mb-3">{t("Менің нәтижелерім|Мои результаты|My results")}</h2>
            <div className="grid gap-2">{results.slice(0, 10).map((r, k) => { const p = Math.round((r.score / r.total) * 100); return (<div key={k} className="flex items-center justify-between text-sm"><span className="font-semibold">{t(tests[r.topic]?.name ?? r.topic)}</span><span className="text-mute">{r.date}</span><span className={"chip " + (p >= 75 ? "c-ok" : p >= 50 ? "c-w" : "c-b")}>{r.score}/{r.total}</span></div>); })}</div></div>
        )}
      </div>
    );
  }

  if (done) {
    const p = Math.round((score / deck.length) * 100);
    return (
      <div className="max-w-xl mx-auto card p-8 grid gap-4 justify-items-center text-center">
        <h1 className="font-bold text-2xl">{t(tests[topic].name)}: {t("нәтиже|результат|result")}</h1>
        <Silhouette progress={score / deck.length} />
        <p className="text-3xl font-bold text-brand">{score} / {deck.length} · {p}%</p>
        <p className="text-mute">{p === 100 ? t("Силуэт толық жиналды, тамаша!|Силуэт собран полностью, отлично!|Silhouette complete, great job!") : p >= 50 ? t("Жаман емес, толықтыру үшін қайталаңыз.|Неплохо, повторите, чтобы собрать полностью.|Not bad, retry to complete it.") : t("Тақырыпты қайталап, қайта тапсырыңыз.|Повторите тему и пройдите заново.|Review the topic and try again.")}</p>
        <div className="flex gap-2"><button className="btn btn-p" onClick={() => start(topic)}>{t("Қайта тапсыру|Пройти снова|Retry")}</button><button className="btn btn-s" onClick={() => setTopic(null)}>{t("Басқа тест|Другой тест|Other test")}</button></div>
      </div>
    );
  }

  const q = deck[i];
  return (
    <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_200px] gap-5 items-start">
      <div className="card p-6 grid gap-5">
        <div><div className="flex justify-between text-sm text-mute"><span>{t(tests[topic].name)}</span><span>{i + 1} / {deck.length}</span></div>
          <div className="h-2 rounded-full bg-line overflow-hidden mt-2"><div className="h-full bg-brand" style={{ width: (i / deck.length) * 100 + "%", transition: "width .4s" }} /></div></div>
        <h1 className="font-bold text-xl">{t(q.q)}</h1>
        <div className="grid gap-2">
          {q.a.map((o, n) => {
            const style: React.CSSProperties | undefined = sel === null ? undefined : n === q.ok ? { borderColor: "#22c55e", background: "rgba(34,197,94,.18)" } : n === sel ? { borderColor: "#ef4444", background: "rgba(239,68,68,.15)" } : undefined;
            return <button key={n} disabled={sel !== null} onClick={(e) => pick(n, e)} className="btn btn-s justify-start text-left" style={style}>{t(o)}</button>;
          })}
        </div>
        {sel !== null && <button className="btn btn-p w-fit" onClick={next}>{i + 1 >= deck.length ? t("Нәтижені көру|Показать результат|See result") : t("Келесі|Далее|Next")}</button>}
      </div>
      <div className="card p-4 grid gap-2 justify-items-center">
        <Silhouette progress={score / deck.length} />
        <p className="text-sm text-mute">{t("Дұрыс жауап|Верных|Correct")}: {score}</p>
      </div>
    </div>
  );
}
