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
          <thead className="text-left
