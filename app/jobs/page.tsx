"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import Modal from "@/components/Modal";
import { validateResume } from "@/lib/resume";
import { bad, FieldErr } from "@/lib/ui";
import { burst, toast } from "@/lib/fx";
import {
  applyToJob,
  fetchActiveVacancies,
  fetchApplications,
  fetchFavorites,
  fetchResumes,
  setFavorite,
  type AppRow,
  type AppStatus,
  type PublicVacancy,
  type ResumeRow,
} from "@/lib/userdata";
import ResumePicker from "@/components/ResumePicker";
import { FiHeart } from "react-icons/fi";

type JobView = PublicVacancy & { reqs?: string[] };

const FORMAT: Record<string, string> = {
  office: "Офис|Офис|Office",
  hybrid: "Гибрид|Гибрид|Hybrid",
  remote: "Қашықтан|Удалённо|Remote",
};

const STATUS: Record<AppStatus, string> = {
  NEW: "Жаңа|Новая|New",
  VIEWED: "Қаралды|Просмотрена|Viewed",
  INTERVIEW: "Сұхбатқа шақырылды|Приглашён на собеседование|Invited to interview",
  HIRED: "Қабылданды|Принят|Hired",
  REJECTED: "Бас тартылды|Отказ|Rejected",
};

const STATUS_CLS: Record<AppStatus, string> = {
  NEW: "c-i",
  VIEWED: "c-w",
  INTERVIEW: "c-ok",
  HIRED: "c-ok",
  REJECTED: "c-b",
};

export default function JobsPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const L = (s: string) => (s.includes("|") ? t(s) : s);

  const [vacancies, setVacancies] = useState<PublicVacancy[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState("all");
  const [job, setJob] = useState<JobView | null>(null);
  const [cover, setCover] = useState("");
  const [ce, setCe] = useState("");
  const [busy, setBusy] = useState(false);
  const deepLinked = useRef(false);

  const load = useCallback(async () => {
    try {
      setVacancies(await fetchActiveVacancies());
      if (user) {
        const [f, a, r] = await Promise.all([fetchFavorites(), fetchApplications(), fetchResumes()]);
        setFavIds(f.map((x) => x.job_id));
        setApps(a);
        setResumes(r);
        setResumeId((current) => current && r.some((x) => x.id === current) ? current : (r.find((x) => x.is_primary) ?? r[0])?.id ?? "");
      }
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const all: JobView[] = vacancies;

  useEffect(() => {
    if (deepLinked.current) return;
    deepLinked.current = true;
    const id = new URLSearchParams(window.location.search).get("job");
    const found = id ? all.find((v) => v.id === id) : undefined;
    if (found) setJob(found);
  }, [vacancies]);

  const list = all.filter(
    (v) =>
      (fmt === "all" || v.format === fmt) &&
      `${L(v.title)} ${v.company} ${L(v.city)} ${v.tags.join(" ")}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );

  const selectedResume = resumes.find((x) => x.id === resumeId);
  const complete = Boolean(selectedResume && Object.keys(validateResume(selectedResume.content)).length === 0);
  const applied = job ? apps.find((a) => a.job_id === job.id) : undefined;

  function openJob(v: JobView) {
    setJob(v);
    setCover("");
    setCe("");
  }

  async function toggleFav(id: string) {
    const on = !favIds.includes(id);
    setFavIds(on ? [...favIds, id] : favIds.filter((x) => x !== id));
    try {
      await setFavorite(id, on);
    } catch (e) {
      setErr((e as Error).message);
      load();
    }
  }

  async function apply(ev: React.MouseEvent<HTMLButtonElement>) {
    if (!job || !user || busy) return;
    if (cover.trim().length < 10) {
      setCe("Кемінде 10 таңба жазыңыз|Минимум 10 символов|At least 10 characters");
      return;
    }
    setBusy(true);
    try {
      await applyToJob({ id: job.id }, resumeId, cover.trim());
      setCover("");
      setCe("");
      burst(ev.currentTarget);
      toast(
        t("Өтініш жіберілді|Отклик отправлен|Application sent"),
        t("Жұмыс беруші оны өтінімдер бөлімінде көреді|Работодатель увидит его в заявках|The employer will see it in Applications"),
      );
      await load();
    } catch (e) {
      setCe((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">{t("Вакансиялар|Вакансии|Jobs")}</h1>

      <div className="mb-5 mt-4 flex flex-wrap gap-3">
        <input
          className="inp grow"
          style={{ maxWidth: 420 }}
          aria-label={t("Іздеу|Поиск|Search")}
          placeholder={t("Атауы, компания, технология...|Название, компания, технология...|Title, company, technology...")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="inp"
          style={{ width: "auto" }}
          aria-label="Format"
          value={fmt}
          onChange={(e) => setFmt(e.target.value)}
        >
          <option value="all">{t("Барлық формат|Любой формат|Any format")}</option>
          {Object.keys(FORMAT).map((k) => (
            <option key={k} value={k}>{t(FORMAT[k])}</option>
          ))}
        </select>
      </div>

      {err && <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      {list.length === 0 && !err && (
        <p className="text-mute">{t("Ештеңе табылмады.|Ничего не найдено.|Nothing found.")}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((v) => {
          const a = apps.find((x) => x.job_id === v.id);
          const saved = favIds.includes(v.id);
          return (
            <article key={v.id} className="card grid gap-3 p-5 hover:bg-soft">
              <button type="button" onClick={() => openJob(v)} className="grid gap-2 text-left">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold leading-snug">{L(v.title)}</p>
                  {a && <span className={"chip " + STATUS_CLS[a.status]}>{t(STATUS[a.status])}</span>}
                </div>
                <p className="text-sm text-mute">
                  {L(v.company)} · {L(v.city)} · {t(FORMAT[v.format] ?? "")}
                </p>
                <p className="text-sm font-semibold text-brand">{v.salary}</p>
                <div className="flex flex-wrap gap-2">
                  {v.tags.map((g) => (
                    <span key={g} className="chip c-i">{g}</span>
                  ))}
                </div>
              </button>

              {user && (
                <button
                  type="button"
                  aria-pressed={saved}
                  onClick={() => toggleFav(v.id)}
                  className="w-fit rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-soft"
                >
                  <FiHeart aria-hidden="true" className="mr-1 inline" fill={saved ? "currentColor" : "none"} />
                  {saved
                    ? t("Таңдаулыдан алып тастау|Убрать из избранного|Remove from favorites")
                    : t("Таңдаулыға қосу|Добавить в избранное|Add to favorites")}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <Modal open={!!job} onClose={() => setJob(null)} title={job ? L(job.title) : ""} wide>
        {job && (
          <>
            <p className="text-mute">
              {L(job.company)} · {L(job.city)} · {t(FORMAT[job.format] ?? "")} · {job.level}
            </p>
            <p className="font-bold text-brand">{job.salary}</p>

            <div>
              <h3 className="mb-1 font-semibold">{t("Сипаттама|Описание|Description")}</h3>
              <p className="whitespace-pre-line text-mute">{L(job.description) || "—"}</p>
            </div>

            {job.reqs && job.reqs.length > 0 && (
              <div>
                <h3 className="mb-1 font-semibold">{t("Талаптар|Требования|Requirements")}</h3>
                <ul className="list-disc pl-5 text-mute">
                  {job.reqs.map((x, i) => (
                    <li key={i}>{L(x)}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((g) => (
                  <span key={g} className="chip c-i">{g}</span>
                ))}
              </div>
            )}

            {!user ? (
              <Link href="/start" className="btn btn-p w-fit">
                {t("Өтініш беру үшін кіріңіз|Войдите, чтобы откликнуться|Sign in to apply")}
              </Link>
            ) : applied ? (
              <p className="text-sm">
                <span className={"chip " + STATUS_CLS[applied.status]}>{t(STATUS[applied.status])}</span>{" "}
                <span className="text-mute">
                  {t("Өтініш жіберілген|Отклик отправлен|Application sent")} ·{" "}
                  {new Date(applied.created_at).toLocaleDateString("kk-KZ")}
                </span>
              </p>
            ) : !complete ? (
              <div className="rounded-xl p-3 text-sm" style={{ border: "1px solid var(--bt)", color: "var(--bt)" }}>
                {t("Өтініш қалдыру үшін резюмені толық толтырыңыз.|Для отклика полностью заполните резюме.|Complete your resume to apply.")}{" "}
                <Link href="/resume" className="font-semibold underline">
                  {t("Резюмеге өту|Перейти к резюме|Go to resume")}
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                <ResumePicker resumes={resumes} value={resumeId} onChange={setResumeId} />
                <div>
                  <label htmlFor="cv" className="text-sm font-semibold">
                    {t("Қысқаша хат|Сопроводительное письмо|Cover letter")}
                  </label>
                  <textarea
                    id="cv"
                    rows={4}
                    className="inp mt-1"
                    style={bad(ce)}
                    value={cover}
                    onChange={(e) => setCover(e.target.value)}
                  />
                  <FieldErr e={ce} />
                </div>
                <button className="btn btn-p w-fit disabled:opacity-50" onClick={apply} disabled={busy}>
                  {busy ? t("Жіберілуде...|Отправка...|Sending...") : t("Өтініш қалдыру|Откликнуться|Apply")}
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
