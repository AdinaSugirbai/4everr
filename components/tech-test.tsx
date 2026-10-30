"use client";
import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Topic, topics, questions } from "@/lib/data";
import { ButtonLink, Notice } from "./ui";
type Attempt = {
  topic: Topic;
  index: number;
  answers: Record<number, number>;
  deadline: number;
  finished: boolean;
  id: string;
};
export type Result = {
  id: string;
  topic: Topic;
  percent: number;
  correct: number;
  date: string;
};
function loadResults(): Result[] {
  try {
    return JSON.parse(
      localStorage.getItem("4everr-demo-results") || "[]",
    ) as Result[];
  } catch {
    return [];
  }
}
export function TestList() {
  return (
    <>
      <Notice>
        Бұл UI демо: әр тақырыпқа 3 сұрақ, 3 минут. Толық нұсқада 13 сұрақ, 15
        минут және серверлік тексеру болады.
      </Notice>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map((t, i) => (
          <article className="card" key={t}>
            <span
              className={`w-12 h-12 rounded-xl grid place-items-center font-bold text-xl ${i === 2 ? "bg-[#f1e2a1] text-[#66571a]" : "bg-soft"}`}
            >
              {["H", "C", "JS", "J"][i]}
            </span>
            <h3 className="text-2xl mt-6 mb-3">{t}</h3>
            <p className="text-sm mb-6">
              3 үлгі сұрақ · 3 минут
              <br />
              Нәтиже мен қателер талдауы
            </p>
            <Link
              className="btn btn-primary"
              href={"/tests/" + t.toLowerCase()}
            >
              Тестті ашу →
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
export function TechTest({ topic }: { topic: Topic }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null),
    [ready, setReady] = useState(false),
    [remaining, setRemaining] = useState(180),
    [storageError, setStorageError] = useState(false);
  const saved = useRef(false);
  const key = "4everr-active-" + topic;
  useEffect(() => {
    startTransition(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const stored = JSON.parse(raw) as Attempt;
          if (
            stored.topic === topic &&
            stored.answers &&
            Number.isFinite(stored.deadline)
          )
            setAttempt(stored);
        }
      } catch {}
      setReady(true);
    });
  }, [key, topic]);
  useEffect(() => {
    if (!ready || !attempt) return;
    try {
      localStorage.setItem(key, JSON.stringify(attempt));
    } catch {
      startTransition(() => setStorageError(true));
    }
  }, [attempt, key, ready]);
  useEffect(() => {
    if (!attempt || attempt.finished) return;
    const deadline = attempt.deadline;
    function tick() {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setAttempt((a) => (a ? { ...a, finished: true } : a));
    }
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [attempt]);
  useEffect(() => {
    if (!attempt?.finished || saved.current) return;
    saved.current = true;
    const qs = questions[topic],
      correct = qs.reduce(
        (s, q, i) => s + Number(attempt.answers[i] === q.correct),
        0,
      );
    const results = loadResults();
    if (!results.some((r) => r.id === attempt.id)) {
      const result: Result = {
        id: attempt.id,
        topic,
        correct,
        percent: Math.round((correct / qs.length) * 100),
        date: new Date().toISOString(),
      };
      try {
        localStorage.setItem(
          "4everr-demo-results",
          JSON.stringify([...results, result].slice(-10)),
        );
      } catch {
        startTransition(() => setStorageError(true));
      }
    }
  }, [attempt, topic]);
  function start() {
    saved.current = false;
    setRemaining(180);
    setAttempt({
      topic,
      index: 0,
      answers: {},
      deadline: Date.now() + 180000,
      finished: false,
      id: crypto.randomUUID(),
    });
  }
  if (!ready)
    return (
      <p role="status" className="py-12">
        Тест жүктелуде...
      </p>
    );
  if (!attempt)
    return (
      <div className="max-w-2xl py-12">
        <h1>{topic} · TechTest</h1>
        <p className="mt-6">
          3 сұрақ. 3 минут. Сұрақтар арасында алға-артқа өтіп, жауаптарды
          өзгерте аласың.
        </p>
        <Notice>
          Бұл — клиенттік UI демо. Нақты әділ тест үшін жауаптар, таймер және
          ұпай серверде тексерілуі керек. Мұнда нәтижелер тек осы браузерде
          сақталады.
        </Notice>
        <button className="btn btn-primary" onClick={start}>
          Демо тестті бастау →
        </button>
      </div>
    );
  const qs = questions[topic];
  if (attempt.finished) {
    const correct = qs.reduce(
        (s, q, i) => s + Number(attempt.answers[i] === q.correct),
        0,
      ),
      percent = Math.round((correct / qs.length) * 100);
    return (
      <>
        <div className="subhead">
          <span className="eyebrow">TechTest · Демо нәтиже</span>
          <h1>Әр қадам — жаңа мүмкіндік.</h1>
        </div>
        <div className="band">
          <div>
            <strong className="text-6xl text-lime" data-testid="score">
              {percent}%
            </strong>
            <p className="mt-3">
              {correct} / 3 дұрыс ·{" "}
              {percent < 40 ? "Бастаушы" : percent < 70 ? "Орта" : "Жоғары"}
            </p>
          </div>
          <div>
            <h2 className="text-2xl mb-2">Дағдыларыңды біртіндеп дамыт.</h2>
            <p>Қысқа демо жұмысқа дайындығыңды анықтамайды.</p>
          </div>
        </div>
        {storageError && (
          <Notice>
            Браузер сақтау орнын шектеді. Нәтиже тек осы бетте көрінеді.
          </Notice>
        )}
        <div className="grid gap-3 max-w-3xl">
          {qs.map((q, i) => (
            <article className="card" key={q.text}>
              <span className="eyebrow">
                {attempt.answers[i] === q.correct
                  ? "✓ Дұрыс"
                  : "Қайталауға ұсынылады"}{" "}
                · {q.subtopic}
              </span>
              <h3 className="text-xl my-4">{q.text}</h3>
              <p className="text-sm">
                Сенің жауабың:{" "}
                {q.options[attempt.answers[i]] ?? "Жауап берілмеген"}
              </p>
              <p className="text-sm mt-2">
                Дұрыс жауап: {q.options[q.correct]}. {q.explanation}
              </p>
              {attempt.answers[i] !== q.correct && (
                <div className="mt-4">
                  <ButtonLink
                    href={
                      "/roadmap/" + (topic === "Java" ? "backend" : "frontend")
                    }
                  >
                    Оқу жолын қарау
                  </ButtonLink>
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-7">
          <ButtonLink primary href="/stats">
            Статистика
          </ButtonLink>
          <ButtonLink href="/jobs">Вакансиялар</ButtonLink>
          <button className="btn" onClick={start}>
            Қайта бастау
          </button>
        </div>
      </>
    );
  }
  const q = qs[attempt.index];
  return (
    <section className="max-w-3xl mx-auto py-12">
      <div className="flex justify-between gap-3 text-xs">
        <span className="eyebrow">{topic} · Демо тест</span>
        <span role="timer" aria-label="Қалған уақыт">
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </span>
      </div>
      <div className="progress my-6">
        <span style={{ width: ((attempt.index + 1) / 3) * 100 + "%" }} />
      </div>
      <div className="flex gap-2 mb-8">
        {qs.map((_, i) => (
          <button
            key={i}
            className={`min-w-11 min-h-11 rounded-xl border border-line ${i === attempt.index ? "bg-forest text-white" : "bg-soft"}`}
            aria-label={`${i + 1}-сұрақ`}
            aria-current={i === attempt.index ? "step" : undefined}
            onClick={() => setAttempt({ ...attempt, index: i })}
          >
            {i + 1}
            {attempt.answers[i] !== undefined ? " ✓" : ""}
          </button>
        ))}
      </div>
      <h2 className="mb-6 leading-snug">{q.text}</h2>
      <fieldset className="grid gap-3">
        <legend className="sr-only">Жауап нұсқалары</legend>
        {q.options.map((o, i) => (
          <label className="option" key={o}>
            <input
              name="testanswer"
              type="radio"
              checked={attempt.answers[attempt.index] === i}
              onChange={() =>
                setAttempt({
                  ...attempt,
                  answers: { ...attempt.answers, [attempt.index]: i },
                })
              }
            />
            {o}
          </label>
        ))}
      </fieldset>
      <div className="flex justify-between gap-3 mt-6">
        <button
          className="btn"
          disabled={attempt.index === 0}
          onClick={() => setAttempt({ ...attempt, index: attempt.index - 1 })}
        >
          ← Артқа
        </button>
        <button
          className="btn btn-primary"
          onClick={() =>
            setAttempt({
              ...attempt,
              ...(attempt.index === 2
                ? { finished: true }
                : { index: attempt.index + 1 }),
            })
          }
        >
          {attempt.index === 2 ? "Тестті аяқтау" : "Келесі →"}
        </button>
      </div>
      <p className="text-xs mt-5">
        Жауапсыз сұрақтармен аяқтауға болады. Уақыт біткенде тест автоматты
        аяқталады. Бетті жаңартсаң да, демо жалғасады.
      </p>
    </section>
  );
}
export function Stats() {
  const [results, setResults] = useState<Result[]>([]),
    [ready, setReady] = useState(false);
  useEffect(() => {
    startTransition(() => {
      setResults(loadResults());
      setReady(true);
    });
  }, []);
  if (!ready) return <p role="status">Жүктелуде...</p>;
  if (!results.length)
    return (
      <div className="card text-center py-12">
        <h2>Алғашқы қадамыңды жаса.</h2>
        <p className="my-5">Тесттен кейін нәтижелерің осында пайда болады.</p>
        <ButtonLink primary href="/tests">
          Тестті таңдау
        </ButtonLink>
      </div>
    );
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          ["Демо әрекеттер", results.length],
          [
            "Орташа нәтиже",
            Math.round(
              results.reduce((s, r) => s + r.percent, 0) / results.length,
            ) + "%",
          ],
          ["Ең жақсы нәтиже", Math.max(...results.map((r) => r.percent)) + "%"],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p className="text-sm">{label}</p>
            <strong className="block text-4xl mt-4 font-normal">{value}</strong>
          </div>
        ))}
      </div>
      <h2 className="my-7">Тест тарихы</h2>
      <div className="grid gap-3">
        {results
          .slice()
          .reverse()
          .map((r) => (
            <div
              className="card flex justify-between items-center gap-4"
              key={r.id}
            >
              <div>
                <strong>{r.topic}</strong>
                <p className="text-xs">
                  {r.correct}/3 дұрыс ·{" "}
                  {new Date(r.date).toLocaleDateString("kk-KZ")}
                </p>
              </div>
              <strong className="text-2xl text-[#527a32]">{r.percent}%</strong>
            </div>
          ))}
      </div>
      <Notice>
        Нәтижелер тек осы браузерде сақталады. Әлсіз тақырыптарды сенімді
        анықтау үшін толық нұсқада жеткілікті сұрақтар мен әрекеттер қажет.
      </Notice>
    </>
  );
}
