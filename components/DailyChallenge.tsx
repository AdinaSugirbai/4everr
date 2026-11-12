"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Q = { q: string; o: string[]; a: number; why: string };
const QS: Q[] = [
  { q: "JavaScript-те typeof null нені қайтарады?|Что вернёт typeof null в JavaScript?|What does typeof null return in JavaScript?", o: ["null", "object", "undefined", "number"], a: 1, why: "Бұл тілдің ескі қатесі, ол бүгін де сақталған.|Это историческая ошибка языка, она сохранена до сих пор.|It is a historical language bug that is still kept today." },
  { q: "Flex элементтерін келесі жолға ауыстыратын қасиет қайсы?|Какое свойство переносит flex-элементы на новую строку?|Which property wraps flex items onto a new line?", o: ["flex-wrap", "wrap-items", "flex-direction", "align-items"], a: 0, why: "flex-wrap: wrap элементтердің сыймағанын келесі жолға түсіреді.|flex-wrap: wrap переносит не поместившиеся элементы.|flex-wrap: wrap moves items that do not fit to the next line." },
  { q: "Жаңа бұтақ ашып, соған өтетін команда?|Команда, которая создаёт ветку и переключается на неё?|Which command creates a branch and switches to it?", o: ["git branch -d", "git checkout -b", "git merge", "git stash"], a: 1, why: "git checkout -b <name> екі әрекетті бірге орындайды.|git checkout -b <name> делает оба действия сразу.|git checkout -b <name> does both actions at once." },
  { q: "«Бет табылмады» HTTP күй коды қандай?|Какой HTTP-код означает «страница не найдена»?|Which HTTP status code means “not found”?", o: ["200", "301", "404", "500"], a: 2, why: "404 сервер сұралған ресурсты таппағанын білдіреді.|404 значит, что сервер не нашёл ресурс.|404 means the server could not find the resource." },
  { q: "0.1 + 0.2 === 0.3 JavaScript-те не береді?|Что даст 0.1 + 0.2 === 0.3 в JavaScript?|What does 0.1 + 0.2 === 0.3 give in JavaScript?", o: ["true", "false", "NaN", "Error"], a: 1, why: "Бөлшек сандар екілік жүйеде дәл сақталмайды.|Дробные числа неточно хранятся в двоичном виде.|Floating-point numbers are stored inexactly in binary." },
  { q: "HTML-де ең маңызды тақырып тегі қайсы?|Какой тег задаёт главный заголовок в HTML?|Which HTML tag is the main heading?", o: ["<head>", "<h6>", "<title>", "<h1>"], a: 3, why: "Бетте әдетте бір ғана <h1> болады.|Обычно на странице один <h1>.|A page normally has a single <h1>." },
  { q: "SQL-де топтарды сүзетін бөлім қайсы?|Какая часть SQL фильтрует группы?|Which SQL clause filters groups?", o: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], a: 1, why: "WHERE жолдарды, HAVING GROUP BY-дан кейінгі топтарды сүзеді.|WHERE фильтрует строки, HAVING — группы после GROUP BY.|WHERE filters rows, HAVING filters groups after GROUP BY." },
];

type S = { last: string; streak: number; picked: number | null };
const KEY = "4everr:daily";
const day = (d = new Date()) => d.toISOString().slice(0, 10);

export default function DailyChallenge() {
  const { t } = useI18n();
  const today = day();
  const q = QS[Math.floor(Date.now() / 86400000) % QS.length];
  const [s, setS] = useState<S>({ last: "", streak: 0, picked: null });

  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) setS(JSON.parse(r)); } catch {}
  }, []);

  const done = s.last === today;
  function pick(i: number) {
    if (done) return;
    const y = day(new Date(Date.now() - 86400000));
    const next: S = { last: today, streak: s.last === y ? s.streak + 1 : 1, picked: i };
    setS(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  const streakAlive = s.last === today || s.last === day(new Date(Date.now() - 86400000));
  return (
    <div className="card p-5 grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">{t("Күннің IT сұрағы|Вопрос дня по IT|IT question of the day")}</h3>
        <span className="chip c-w">🔥 {streakAlive ? s.streak : 0} {t("күн|дн.|days")}</span>
      </div>
      <p className="font-medium">{t(q.q)}</p>
      <div className="grid gap-2">
        {q.o.map((x, i) => {
          const show = done && s.picked !== null;
          const right = i === q.a;
          const style = show ? (right ? { borderColor: "var(--brand)" } : i === s.picked ? { borderColor: "var(--bt)", color: "var(--bt)" } : undefined) : undefined;
          return <button key={i} disabled={done} onClick={() => pick(i)} className="btn btn-s justify-start text-left" style={style}>{x}</button>;
        })}
      </div>
      {done && s.picked !== null && (
        <p className="text-sm text-mute">{s.picked === q.a ? "✅ " : "❌ "}{t(q.why)}</p>
      )}
      {done && <p className="text-xs text-mute">{t("Ертең жаңа сұрақ болады.|Завтра будет новый вопрос.|A new question comes tomorrow.")}</p>}
    </div>
  );
}
