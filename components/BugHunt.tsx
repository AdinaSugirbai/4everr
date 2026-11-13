"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export type Daily = { last: string; streak: number; picked: number | null; xp?: number };
type Puzzle = { lang: string; code: string[]; bug: number; why: string };

const PUZZLES: Puzzle[] = [
  { lang: "JavaScript", bug: 2, code: ["const nums = [1, 2, 3];", "let sum = 0;", "for (let i = 0; i <= nums.length; i++) {", "  sum += nums[i];", "}", "console.log(sum);"],
    why: "i <= nums.length соңғы қадамда nums[3] = undefined алады, сома NaN болады.|i <= nums.length на последнем шаге берёт nums[3] = undefined, сумма становится NaN.|i <= nums.length reads nums[3] = undefined on the last step, so the sum becomes NaN." },
  { lang: "JavaScript", bug: 0, code: ['if (user.role = "admin") {', "  showPanel();", "}"],
    why: "= меншіктейді, салыстырмайды. Шарт әрқашан true. === қолданыңыз.|= присваивает, а не сравнивает. Условие всегда true. Используйте ===.|= assigns instead of comparing, so the condition is always true. Use ===." },
  { lang: "Python", bug: 0, code: ["def add(item, bucket=[]):", "    bucket.append(item)", "    return bucket"],
    why: "Әдепкі тізім бір рет жасалады да, барлық шақыруда ортақ болады. None қолданыңыз.|Список по умолчанию создаётся один раз и общий для всех вызовов. Используйте None.|The default list is created once and shared by every call. Use None instead." },
  { lang: "SQL", bug: 2, code: ["SELECT name, COUNT()", "FROM orders", "WHERE COUNT() > 5", "GROUP BY name;"],
    why: "WHERE-де агрегат қолдануға болмайды, топты сүзу үшін HAVING керек.|В WHERE нельзя использовать агрегаты, для групп нужен HAVING.|Aggregates are not allowed in WHERE; use HAVING to filter groups." },
  { lang: "CSS", bug: 1, code: [".btn {", "  colour: #fff;", "  background: teal;", "  padding: 8px 16px;", "}"],
    why: "Қасиет аты color, colour емес. Браузер оны елемейді.|Свойство называется color, а не colour. Браузер его игнорирует.|The property is color, not colour. The browser ignores it." },
  { lang: "JavaScript", bug: 1, code: ['const items = ["a", "b", "c"];', "items.forEach(async (x) => {", "  await save(x);", "});", 'console.log("all saved");'],
    why: "forEach await-ті күтпейді, лог сақтаудан бұрын шығады. for...of қолданыңыз.|forEach не ждёт await, лог выводится раньше сохранения. Используйте for...of.|forEach does not wait for await, so the log prints before saving finishes. Use for...of." },
  { lang: "HTML", bug: 1, code: ["<form>", "  <label>Email</label>", '  <input type="email" id="email">', "</form>"],
    why: 'label мен input байланыспаған: label-ге for="email" қосыңыз.|label не связан с input: добавьте for="email".|The label is not linked to the input: add for="email".' },
  { lang: "Git", bug: 2, code: ["git checkout main", "git merge feature", "git push --force origin main"],
    why: "Негізгі бұтаққа --force басқалардың коммиттерін өшіріп жіберуі мүмкін.|--force в основную ветку может стереть чужие коммиты.|--force on the main branch can erase other people's commits." },
  { lang: "JavaScript", bug: 1, code: ["function total(price, qty) {", "  price * qty;", "}", "console.log(total(5, 2));"],
    why: "return жоқ, функция undefined қайтарады.|Нет return, функция вернёт undefined.|There is no return, so the function returns undefined." },
  { lang: "Java", bug: 2, code: ['String a = new String("hi");', 'String b = new String("hi");', "if (a == b) {", '  System.out.println("equal");', "}"],
    why: "== сілтемені салыстырады. Мазмұн үшін a.equals(b).|== сравнивает ссылки. Для содержимого используйте a.equals(b).|== compares references. Use a.equals(b) to compare contents." },
  { lang: "Python", bug: 3, code: ["nums = [1, 2, 3]", "for n in nums:", "    if n == 2:", "        nums.remove(n)"],
    why: "Тізімді айналдырып жатқанда өзгертуге болмайды, элементтер өтіп кетеді.|Нельзя менять список во время обхода, элементы пропускаются.|Do not modify a list while iterating; items get skipped." },
  { lang: "JavaScript", bug: 1, code: ['let count = "5";', "let total = count + 1;", "console.log(total);"],
    why: 'count — жол, сондықтан + біріктіреді: "51". Number(count) керек.|count — строка, поэтому + склеивает: "51". Нужен Number(count).|count is a string, so + concatenates: "51". Use Number(count).' },
];

const LEVELS = ["Жаңадан бастаған|Новичок|Newbie", "Junior|Junior|Junior", "Middle|Middle|Middle", "Senior|Senior|Senior", "Lead|Lead|Lead"];
const day = (ms = 0) => new Date(Date.now() - ms).toISOString().slice(0, 10);

export default function BugHunt({ daily, onChange }: { daily: Daily; onChange: (d: Daily) => void }) {
  const { t } = useI18n();
  const base = Math.floor(Date.now() / 86400000);
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const p = PUZZLES[(base * 3 + round) % PUZZLES.length];

  const xp = daily.xp ?? 0;
  const lv = Math.min(Math.floor(xp / 60), LEVELS.length - 1);
  const pct = lv === LEVELS.length - 1 ? 100 : ((xp % 60) / 60) * 100;
  const alive = daily.last === day() || daily.last === day(86400000);

  function answer(i: number) {
    if (pick !== null) return;
    setPick(i);
    const today = day();
    const streak = daily.last === today ? daily.streak : daily.last === day(86400000) ? daily.streak + 1 : 1;
    onChange({ last: today, streak, picked: null, xp: xp + (i === p.bug ? 10 : 0) });
  }
  function next() { setRound(round + 1); setPick(null); }

  return (
    <div className="card p-5 grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">🐞 {t("Баг аулау|Охота на баги|Bug Hunt")}</h3>
        <span className="chip c-w">🔥 {alive ? daily.streak : 0} {t("күн|дн.|d")}</span>
      </div>
      <div>
        <div className="flex justify-between text-sm"><span className="font-semibold">{t(LEVELS[lv])}</span><span className="text-mute">{xp} XP</span></div>
        <div className="h-2 rounded-full bg-line overflow-hidden mt-1"><div className="h-full bg-brand" style={{ width: pct + "%", transition: "width .5s" }} /></div>
      </div>
      <p className="text-sm text-mute">{t("Қате қай жолда?|В какой строке ошибка?|Which line has the bug?")} · {p.lang} · {(round % 3) + 1}/3</p>
      <div className="rounded-xl border border-line overflow-x-auto py-1 bg-soft">
        {p.code.map((ln, i) => {
          const st: React.CSSProperties | undefined = pick === null ? undefined : i === p.bug ? { background: "rgba(34,197,94,.18)" } : i === pick ? { background: "rgba(239,68,68,.15)" } : undefined;
          return (
            <button key={i} disabled={pick !== null} onClick={() => answer(i)} className="flex w-full gap-3 px-3 py-1 text-left font-mono text-sm" style={st}>
              <span className="text-mute w-4 shrink-0">{i + 1}</span>
              <span style={{ whiteSpace: "pre" }}>{ln}</span>
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <>
          <p className="text-sm text-mute">{pick === p.bug ? "✅ +10 XP · " : "❌ " + t("Дұрысы|Верно|Correct") + ": " + (p.bug + 1) + ". "}{t(p.why)}</p>
          <button className="btn btn-p w-fit" onClick={next}>{t("Келесі|Далее|Next")}</button>
        </>
      )}
    </div>
  );
}
