"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { tests } from "@/lib/data";
import { seedJobs, fmtLabel, type Job } from "@/lib/jobs";
import {
  fetchApplications,
  fetchFavorites,
  applyToJob,
  setFavorite,
  type AppRow,
  type AppStatus,
  type FavRow,
} from "@/lib/userdata";
import Modal from "./Modal";

type Opt = { v: string; l: string };

const MONTHS: [string, string, string][] = [
  ["қаңтар", "января", "Jan"], ["ақпан", "февраля", "Feb"], ["наурыз", "марта", "Mar"], ["сәуір", "апреля", "Apr"],
  ["мамыр", "мая", "May"], ["маусым", "июня", "Jun"], ["шілде", "июля", "Jul"], ["тамыз", "августа", "Aug"],
  ["қыркүйек", "сентября", "Sep"], ["қазан", "октября", "Oct"], ["қараша", "ноября", "Nov"], ["желтоқсан", "декабря", "Dec"],
];
const D: Record<string, string> = { "Тағылымдама": "Тағылымдама|Стажировка|Internship" };

const APP_LABEL: Record<AppStatus, string> = {
  NEW: "Жаңа|Новая|New",
  VIEWED: "Қаралды|Просмотрена|Viewed",
  INTERVIEW: "Сұхбатқа шақырылды|Приглашён на собеседование|Invited to interview",
  HIRED: "Қабылданды|Принят|Hired",
  REJECTED: "Бас тартылды|Отказ|Rejected",
};
const APP_CLS: Record<AppStatus, string> = {
  NEW: "c-i", VIEWED: "c-w", INTERVIEW: "c-ok", HIRED: "c-ok", REJECTED: "c-b",
};
const APP_STEP: Record<AppStatus, number> = { NEW: 0, VIEWED: 1, INTERVIEW: 2, HIRED: 2, REJECTED: 2 };

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

function salaryNum(j: Job) {
  return Number((j.salary.match(/\d[\d\s]*/)?.[0] ?? "0").replace(/\s/g, ""));
}

function Toolbar(props: { chips: Opt[]; value: string; onChange: (v: string) => void; sorts: Opt[]; sort: string; onSort: (v: string) => void }) {
  const { chips, value, onChange, sorts, sort, onSort } = props;
  const { t } = useI18n();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-mute"><tr>
            <th className="py-2 font-medium">{t("Тест|Тест|Test")}</th>
            <th className="font-medium">{t("Деңгей|Уровень|Level")}</th>
            <th className="w-40 font-medium">{t("Нәтиже|Результат|Result")}</th>
            <th className="font-medium">{t("Уақыт|Время|Time")}</th>
            <th className="font-medium">{t("Күні|Дата|Date")}</th>
          </tr></thead>
          <tbody key={f + s}>
            {rows.map((r, k) => (
              <tr key={k} className="rv border-t border-line" style={{ "--i": k } as React.CSSProperties}>
                <td className="py-3 font-semibold">{r.topic}</td><td>{tr(r.level)}</td>
                <td><div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-line"><div className="bar h-full bg-brand" style={{ "--w": r.score + "%" } as React.CSSProperties} /></div>
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

function ApplicationDetail({ a, onClose }: { a: AppRow; onClose: () => void }) {
  const { t } = useI18n();
  const job = seedJobs.find((j) => j.id === a.job_id);
  const date = new Date(a.created_at).toLocaleDateString("kk-KZ", { day: "numeric", month: "long", year: "numeric" });
  const steps = [t("Жіберілді|Отправлено|Sent"), t("Қаралды|Просмотрено|Viewed"), t("Нәтиже|Результат|Result")];
  return (
    <Modal open onClose={onClose} title={a.job_title} wide>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-mute">
          <span>{a.company}</span><span>·</span><span>{date}</span>
          <span className={"chip " + APP_CLS[a.status]}>{t(APP_LABEL[a.status])}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {steps.map((label, i) => (
            <div key={i} className="grid gap-1">
              <span className={"h-1.5 rounded-full " + (i <= APP_STEP[a.status] ? "bg-brand" : "bg-line")} />
              <span className="text-xs text-mute">{label}</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-2 font-semibold">{t("Сіз жазған хат|Ваше сопроводительное письмо|Your cover letter")}</h3>
          <p className="whitespace-pre-line rounded-xl bg-soft p-4 text-sm">
            {a.letter || t("Хат жазылмаған|Письмо не написано|No letter")}
          </p>
        </div>

        {job && (
          <>
            <p className="text-sm text-mute">{t(job.desc)}</p>
            <Link href={"/jobs/" + job.id} className="justify-self-start rounded-xl border border-line px-4 py-2 text-sm hover:bg-soft">
              {t("Вакансияға өту|Перейти к вакансии|Open vacancy")}
            </Link>
          </>
        )}
      </div>
    </Modal>
  );
}

function Applications() {
  const { t } = useI18n();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState("all");
  const [s, setS] = useState("new");
  const [sel, setSel] = useState<AppRow | null>(null);

  useEffect(() => {
    fetchApplications().then(setRows).catch((e) => setErr((e as Error).message));
  }, []);

  const base = rows.filter((a) => f === "all" || a.status === f);
  const list = s === "old" ? [...base].reverse() : base;
  const keys: ("all" | AppStatus)[] = ["all", "NEW", "VIEWED", "INTERVIEW", "REJECTED"];

  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={keys.map((v) => ({ v, l: v === "all" ? t("Барлығы|Все|All") : t(APP_LABEL[v]) }))}
        sorts={[
          { v: "new", l: t("Жаңасы бірінші|Сначала новые|Newest first") },
          { v: "old", l: t("Ескісі бірінші|Сначала старые|Oldest first") },
        ]} />
      {err && <p className="mb-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="grid gap-3">
        {list.map((a) => (
          <button key={a.id} onClick={() => setSel(a)} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4 text-left hover:bg-soft">
            <div className="grow">
              <h3 className="font-semibold">{a.job_title}</h3>
              <p className="text-sm text-mute">{a.company}</p>
            </div>
            <span className="text-sm text-mute">{new Date(a.created_at).toLocaleDateString("kk-KZ", { day: "numeric", month: "short" })}</span>
            <span className={"chip " + APP_CLS[a.status]}>{t(APP_LABEL[a.status])}</span>
          </button>
        ))}
      </div>
      {!list.length && !err && <p className="py-8 text-center text-mute">{t("Бұл күйде өтінім жоқ.|Заявок с таким статусом нет.|No applications with this status.")}</p>}
      {sel && <ApplicationDetail a={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function SavedDetail({ job, onClose, onChanged }: { job: Job; onClose: () => void; onChanged: () => void }) {
  const { t } = useI18n();
  const [letter, setLetter] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const L = (s: string) => (s.includes("|") ? t(s) : s);

  async function apply() {
    setBusy(true);
    setMsg(null);
    try {
      await applyToJob({ id: job.id, title: L(job.title), company: job.company }, letter.trim());
      setMsg({ ok: true, text: t("Өтінім жіберілді|Заявка отправлена|Application sent") });
      onChanged();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await setFavorite(job.id, false);
      onChanged();
      onClose();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={L(job.title)} wide>
      <div className="grid gap-4">
        <p className="text-sm text-mute">
          {job.company} · {L(job.city)} · {t(fmtLabel[job.format])} · {job.level}
        </p>
        <p className="text-lg font-bold text-brand">{job.salary}</p>
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tg) => <span key={tg} className="chip c-i">{tg}</span>)}
        </div>
        <p className="text-sm">{t(job.desc)}</p>
        <ul className="grid list-disc gap-1 pl-5 text-sm">
          {job.reqs.map((r) => <li key={r}>{L(r)}</li>)}
        </ul>

        <div className="grid gap-2">
          <label className="text-sm font-medium">{t("Сопроводительное хат|Сопроводительное письмо|Cover letter")}</label>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            rows={4}
            className="inp"
            placeholder={t("Өзіңіз туралы қысқаша жазыңыз|Коротко расскажите о себе|Briefly introduce yourself")}
          />
        </div>

        {msg && <p className={"text-sm " + (msg.ok ? "text-brand" : "text-red-500")}>{msg.text}</p>}

        <div className="flex flex-wrap gap-2">
          <button onClick={apply} disabled={busy} className="btn btn-primary disabled:opacity-50">
            {t("Өтінім беру|Откликнуться|Apply")}
          </button>
          <button onClick={remove} disabled={busy} className="btn disabled:opacity-50">
            {t("Таңдаулыдан алып тастау|Убрать из избранного|Remove from saved")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Saved() {
  const { t } = useI18n();
  const [favs, setFavs] = useState<FavRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState("all");
  const [s, setS] = useState("high");
  const [sel, setSel] = useState<Job | null>(null);
  const tr = useTr();

  const load = useCallback(() => {
    fetchFavorites().then(setFavs).catch((e) => setErr((e as Error).message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const jobs = favs
    .map((x) => seedJobs.find((j) => j.id === x.job_id))
    .filter((j): j is Job => !!j);
  const rows = jobs
    .filter((j) => f === "all" || j.level === f)
    .sort((a, b) => (s === "high" ? salaryNum(b) - salaryNum(a) : salaryNum(a) - salaryNum(b)));

  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={["all", "Тағылымдама", "Junior", "Middle"].map((v) => ({ v, l: v === "all" ? t("Барлығы|Все|All") : tr(v) }))}
        sorts={[
          { v: "high", l: t("Жалақы: жоғарыдан төмен|Зарплата: по убыванию|Salary: high to low") },
          { v: "low", l: t("Жалақы: төменнен жоғары|Зарплата: по возрастанию|Salary: low to high") },
        ]} />
      {err && <p className="mb-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="grid gap-3">
        {rows.map((j) => (
          <button key={j.id} onClick={() => setSel(j)} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4 text-left hover:bg-soft">
            <div className="grow">
              <h3 className="font-semibold">{tr(j.title)}</h3>
              <p className="text-sm text-mute">{j.company} · {tr(j.city)}</p>
            </div>
            <span className="chip c-i">{tr(j.level)}</span>
            <span className="font-bold text-brand">{j.salary}</span>
          </button>
        ))}
      </div>
      {!rows.length && !err && <p className="py-8 text-center text-mute">{t("Сақталған вакансия жоқ.|Сохранённых вакансий нет.|No saved jobs.")}</p>}
      {sel && <SavedDetail job={sel} onClose={() => setSel(null)} onChanged={load} />}
    </div>
  );
}

export default function History() {
  const { t } = useI18n();
  const [tab, setTab] = useState(0);
  const [ink, setInk] = useState({ l: 0, w: 0 });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = [
    t("Тест нәтижелері|Результаты тестов|Test results"),
    t("Өтінімдерім|Мои заявки|My applications"),
    t("Таңдаулылар|Избранное|Saved"),
  ];
  useEffect(() => {
    const b = refs.current[tab];
    if (b) setInk({ l: b.offsetLeft, w: b.offsetWidth });
  }, [tab, tabs.join()]);
  return (
    <div className="card min-w-0 p-5">
      <h2 className="text-xl font-bold">{t("Менің тарихым|Моя история|My history")}</h2>
      <p className="mt-1 text-sm text-mute">{t("Тесттер, өтінімдер және сақталған вакансиялар бір жерде.|Тесты, заявки и сохранённые вакансии в одном месте.|Tests, applications and saved jobs in one place.")}</p>
      <div role="tablist" className="relative mt-4 flex gap-4 overflow-x-auto border-b border-line">
        <span className="absolute bottom-0 h-0.5 rounded bg-brand" style={{ left: ink.l, width: ink.w, transition: "left .35s cubic-bezier(.2,.8,.2,1),width .35s" }} />
        {tabs.map((label, i) => (
          <button key={i} ref={(el) => { refs.current[i] = el; }} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="tab min-h-[44px] whitespace-nowrap py-3 font-semibold text-mute">{label}</button>
        ))}
      </div>
      {tab === 0 && <Tests />}
      {tab === 1 && <Applications />}
      {tab === 2 && <Saved />}
    </div>
  );
} 