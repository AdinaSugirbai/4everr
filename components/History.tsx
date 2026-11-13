"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { applications, savedJobs, statusUi, tests, vacancies, type AppStatus } from "@/lib/data";

type Opt = { v: string; l: string };

const MONTHS: [string, string, string][] = [
  ["қаңтар", "января", "Jan"], ["ақпан", "февраля", "Feb"], ["наурыз", "марта", "Mar"], ["сәуір", "апреля", "Apr"],
  ["мамыр", "мая", "May"], ["маусым", "июня", "Jun"], ["шілде", "июля", "Jul"], ["тамыз", "августа", "Aug"],
  ["қыркүйек", "сентября", "Sep"], ["қазан", "октября", "Oct"], ["қараша", "ноября", "Nov"], ["желтоқсан", "декабря", "Dec"],
];
const D: Record<string, string> = {
  "Тағылымдама": "Тағылымдама|Стажировка|Internship",
};
const STATUS: Record<string, string> = {
  NEW: "Жаңа|Новая|New",
  VIEWED: "Қаралды|Просмотрена|Viewed",
  INVITED: "Сұхбатқа шақырылды|Приглашён на собеседование|Invited",
  REJECTED: "Бас тартылды|Отказ|Rejected",
};

function useTr() {
  const { t } = useI18n();
  return (s: string) => {
    if (s.includes("|")) return t(s);
    if (D[s]) return t(D[s]);
    const m = s.match(/^(\d{1,2})\s+(\S+)$/);
    if (m) {
      const mo = MONTHS.find((x) => x[0] === m[2].toLowerCase());
      if (mo) return m[1] + " " + t(mo.join("|"));
    }
    return s;
  };
}

function Toolbar(props: { chips: Opt[]; value: string; onChange: (v: string) => void; sorts: Opt[]; sort: string; onSort: (v: string) => void }) {
  const { chips, value, onChange, sorts, sort, onSort } = props;
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((c) => (
        <button key={c.v} onClick={() => onChange(c.v)} className={"chip min-h-[32px] " + (value === c.v ? "c-ok" : "c-i")}>{c.l}</button>
      ))}
      <select className="inp ml-auto" style={{ width: "auto" }} value={sort} onChange={(e) => onSort(e.target.value)} aria-label={t("Сұрыптау|Сортировка|Sort")}>
        {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
      </select>
    </div>
  );
}

function Tests() {
  const { t } = useI18n();
  const tr = useTr();
  const [f, setF] = useState("all");
  const [s, setS] = useState("new");
  const base = tests.filter((x) => f === "all" || x.topic === f);
  const rows = s === "best" ? [...base].sort((a, b) => b.score - a.score) : s === "worst" ? [...base].sort((a, b) => a.score - b.score) : s === "old" ? [...base].reverse() : base;
  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={["all", "HTML", "CSS", "JavaScript", "Java"].map((v) => ({ v, l: v === "all" ? t("Барлығы|Все|All") : v }))}
        sorts={[
          { v: "new", l: t("Жаңасы бірінші|Сначала новые|Newest first") },
          { v: "old", l: t("Ескісі бірінші|Сначала старые|Oldest first") },
          { v: "best", l: t("Ең жақсы нәтиже|Лучший результат|Best result") },
          { v: "worst", l: t("Ең төмен нәтиже|Худший результат|Lowest result") },
        ]} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="text-left text-mute"><tr>
            <th className="py-2 font-medium">{t("Тест|Тест|Test")}</th>
            <th className="font-medium">{t("Деңгей|Уровень|Level")}</th>
            <th className="font-medium w-40">{t("Нәтиже|Результат|Result")}</th>
            <th className="font-medium">{t("Уақыт|Время|Time")}</th>
            <th className="font-medium">{t("Күні|Дата|Date")}</th>
          </tr></thead>
          <tbody key={f + s}>
            {rows.map((r, k) => (
              <tr key={k} className="rv border-t border-line" style={{ "--i": k } as React.CSSProperties}>
                <td className="py-3 font-semibold">{r.topic}</td><td>{tr(r.level)}</td>
                <td><div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-line overflow-hidden"><div className="bar h-full bg-brand" style={{ "--w": r.score + "%" } as React.CSSProperties} /></div>
                  <span className={"chip " + (r.score >= 80 ? "c-ok" : r.score >= 60 ? "c-w" : "c-b")}>{r.score}%</span>
                </div></td>
                <td className="text-mute">{r.time}</td><td className="text-mute">{tr(r.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">{t("Бұл бағыт бойынша тест әлі тапсырылмаған.|По этому направлению тестов пока нет.|No tests taken in this category yet.")}</p>}
    </div>
  );
}

function Applications() {
  const { t } = useI18n();
  const tr = useTr();
  const [f, setF] = useState("all");
  const [s, setS] = useState("new");
  const base = applications.filter((a) => f === "all" || a.status === f);
  const rows = s === "old" ? [...base].reverse() : base;
  const keys: ("all" | AppStatus)[] = ["all", "NEW", "VIEWED", "INVITED", "REJECTED"];

  function vacancyId(title: string) {
    const key = title.split("|")[0];
    const found = vacancies.find((v) => v.title.split("|")[0] === key);
    return found ? found.id : undefined;
  }

  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={keys.map((v) => ({ v, l: t(v === "all" ? "Барлығы|Все|All" : STATUS[v] ?? statusUi[v].label) }))}
        sorts={[{ v: "new", l: t("Жаңасы бірінші|Сначала новые|Newest first") }, { v: "old", l: t("Ескісі бірінші|Сначала старые|Oldest first") }]} />
      <div id="t2" key={f + s} className="grid gap-3">
        {rows.map((a) => {
          const id = vacancyId(a.title);
          const inner = (
            <>
              <div className="grow"><h3 className="font-semibold">{tr(a.title)}</h3><p className="text-sm text-mute">{tr(a.meta)}</p></div>
              <span className="text-sm text-mute">{tr(a.date)}</span>
              <span className={"chip " + statusUi[a.status].cls}>{t(STATUS[a.status] ?? statusUi[a.status].label)}</span>
            </>
          );
          if (id) {
            return (
              <Link key={a.title} href={"/jobs/" + id} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4 hover:bg-soft">
                {inner}
              </Link>
            );
          }
          return (
            <article key={a.title} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4">
              {inner}
            </article>
          );
        })}
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">{t("Бұл күйде өтінім жоқ.|Заявок с таким статусом нет.|No applications with this status.")}</p>}
    </div>
  );
}

function Saved() {
  const { t } = useI18n();
  const tr = useTr();
  const [f, setF] = useState("all");
  const [s, setS] = useState("high");
  const rows = savedJobs.filter((j) => f === "all" || j.level === f).sort((a, b) => (s === "high" ? b.salary - a.salary : a.salary - b.salary));
  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={["all", "Тағылымдама", "Junior", "Middle"].map((v) => ({ v, l: v === "all" ? t("Барлығы|Все|All") : tr(v) }))}
        sorts={[{ v: "high", l: t("Жалақы: жоғарыдан төмен|Зарплата: по убыванию|Salary: high to low") }, { v: "low", l: t("Жалақы: төменнен жоғары|Зарплата: по возрастанию|Salary: low to high") }]} />
      <div id="t2" key={f + s} className="grid gap-3">
        {rows.map((j) => (
          <Link key={j.id} href={"/jobs/" + j.id} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4 hover:bg-soft">
            <div className="grow"><h3 className="font-semibold">{tr(j.title)}</h3><p className="text-sm text-mute">{tr(j.company)} · {tr(j.city)}</p></div>
            <span className="chip c-i">{tr(j.level)}</span>
            <span className="font-bold text-brand">{j.salary.toLocaleString("ru-RU")} ₸</span>
          </Link>
        ))}
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">{t("Бұл деңгейде сақталған вакансия жоқ.|На этом уровне нет сохранённых вакансий.|No saved jobs at this level.")}</p>}
    </div>
  );
}

export default function History() {
  const { t } = useI18n();
  const [tab, setTab] = useState(0);
  const [ink, setInk] = useState({ l: 0, w: 0 });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = [t("Тест нәтижелері|Результаты тестов|Test results"), t("Өтінімдерім|Мои заявки|My applications"), t("Таңдаулылар|Избранное|Saved")];
  useEffect(() => {
    const b = refs.current[tab];
    if (b) setInk({ l: b.offsetLeft, w: b.offsetWidth });
  }, [tab, tabs.join()]);
  return (
    <div className="card p-5 min-w-0">
      <h2 className="font-bold text-xl">{t("Менің тарихым|Моя история|My history")}</h2>
      <p className="text-sm text-mute mt-1">{t("Тесттер, өтінімдер және сақталған вакансиялар бір жерде.|Тесты, заявки и сохранённые вакансии в одном месте.|Tests, applications and saved jobs in one place.")}</p>
      <div role="tablist" className="mt-4 flex gap-4 border-b border-line relative overflow-x-auto">
        <span className="absolute bottom-0 h-0.5 bg-brand rounded" style={{ left: ink.l, width: ink.w, transition: "left .35s cubic-bezier(.2,.8,.2,1),width .35s" }} />
        {tabs.map((label, i) => (
          <button key={i} ref={(el) => { refs.current[i] = el; }} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="tab py-3 font-semibold text-mute min-h-[44px] whitespace-nowrap">{label}</button>
        ))}
      </div>
      {tab === 0 && <Tests />}
      {tab === 1 && <Applications />}
      {tab === 2 && <Saved />}
    </div>
  );
}
