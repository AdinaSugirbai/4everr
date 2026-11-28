"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { DATA_KEYS, fmtDate } from "@/lib/sections";

type Result = { test: string; level: string; score: number; time: string; date: string };
const seed: Result[] = [
  { test: "HTML", level: "Middle", score: 92, time: "18:40", date: "2026-10-29" },
  { test: "JavaScript", level: "Junior", score: 64, time: "24:10", date: "2026-10-26" },
  { test: "CSS", level: "Middle", score: 85, time: "21:05", date: "2026-10-22" },
  { test: "Java", level: "Junior", score: 41, time: "29:55", date: "2026-10-17" },
  { test: "JavaScript", level: "Junior", score: 52, time: "27:30", date: "2026-10-09" },
  { test: "HTML", level: "Junior", score: 88, time: "12:20", date: "2026-10-02" },
];
const cls = (n: number) => (n >= 75 ? "c-ok" : n >= 50 ? "c-w" : "c-b");

export default function TestsSection() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [all] = useLocal<Result[]>(DATA_KEYS.results(user?.email ?? ""), seed);
  const [f, setF] = useState("ALL");
  const names = Array.from(new Set(all.map((r) => r.test)));
  const list = all.filter((r) => f === "ALL" || r.test === f);
  const avg = all.length ? Math.round(all.reduce((a, r) => a + r.score, 0) / all.length) : 0;
  const best = all.reduce((m, r) => (r.score > m.score ? r : m), all[0] ?? { test: "—", score: 0 } as Result);

  if (all.length === 0)
    return (
      <div className="card p-6 grid gap-3 justify-items-start">
        <p className="text-mute">{t("Тест тапсырылмаған.|Тесты ещё не пройдены.|No tests taken yet.")}</p>
        <Link href="/test" className="btn btn-p">{t("Тест тапсыру|Пройти тест|Take a test")}</Link>
      </div>
    );
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card p-4"><p className="text-sm text-mute">{t("Тест саны|Всего тестов|Tests taken")}</p><p className="font-bold text-2xl">{all.length}</p></div>
        <div className="card p-4"><p className="text-sm text-mute">{t("Орташа балл|Средний балл|Average")}</p><p className="font-bold text-2xl text-brand">{avg}%</p></div>
        <div className="card p-4"><p className="text-sm text-mute">{t("Үздік нәтиже|Лучший результат|Best result")}</p><p className="font-bold text-2xl">{best.test} · {best.score}%</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={"btn " + (f === "ALL" ? "btn-p" : "btn-s")} onClick={() => setF("ALL")}>{t("Барлығы|Все|All")}</button>
        {names.map((n) => <button key={n} className={"btn " + (f === n ? "btn-p" : "btn-s")} onClick={() => setF(n)}>{n}</button>)}
      </div>
      <div className="grid gap-3">
        {list.map((r, i) => (
          <div key={i} className="card p-4 grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{r.test} <span className="text-mute font-normal">· {r.level}</span></p>
              <span className={"chip " + cls(r.score)}>{r.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-brand" style={{ width: r.score + "%" }} /></div>
            <p className="text-xs text-mute">{t("Уақыт|Время|Time")}: {r.time} · {fmtDate(r.date, lang)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
