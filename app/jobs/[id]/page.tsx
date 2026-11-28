"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { validateResume } from "@/lib/resume";
import { bad, FieldErr } from "@/lib/ui";
import { burst, toast } from "@/lib/fx";
import SaveJobButton from "@/components/SaveJobButton";
import {
  applyToJob,
  fetchApplications,
  fetchVacancy,
  fetchResumes,
  type AppRow,
  type AppStatus,
  type PublicVacancy,
  type ResumeRow,
} from "@/lib/userdata";
import ResumePicker from "@/components/ResumePicker";

type View = {
  id: string;
  title: string;
  company: string;
  city: string;
  format: string;
  salary: string;
  level: string;
  tags: string[];
  description: string;
  reqs: string[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function fromDb(v: PublicVacancy): View {
  return {
    id: v.id,
    title: v.title,
    company: v.company,
    city: v.city,
    format: v.format,
    salary: v.salary,
    level: v.level,
    tags: v.tags ?? [],
    description: v.description,
    reqs: [],
  };
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const { t } = useI18n();

  const L = (s: string) => (s.includes("|") ? t(s) : s);

  const [job, setJob] = useState<View | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [cover, setCover] = useState("");
  const [ce, setCe] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let found: View | null = null;
        if (UUID_RE.test(id)) {
          const v = await fetchVacancy(id);
          if (v) found = fromDb(v);
        }
        if (!alive) return;
        if (!found) setNotFound(true);
        setJob(found);
        if (user) {
          const [a, r] = await Promise.all([fetchApplications(), fetchResumes()]);
          if (alive) {
            setApps(a);
            setResumes(r);
            setResumeId((current) => current && r.some((x) => x.id === current) ? current : (r.find((x) => x.is_primary) ?? r[0])?.id ?? "");
          }
        }
      } catch (e) {
        if (alive) setErr((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, user]);

  const selectedResume = resumes.find((x) => x.id === resumeId);
  const complete = Boolean(selectedResume && Object.keys(validateResume(selectedResume.content)).length === 0);
  const applied = apps.find((a) => a.job_id === id);

  async function apply(ev: React.MouseEvent<HTMLButtonElement>) {
    if (!job || !user || busy) return;
    if (cover.trim().length < 10) {
      setCe("Кемінде 10 таңба жазыңыз|Минимум 10 символов|At least 10 characters");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await applyToJob({ id: job.id }, resumeId, cover.trim());
      setCover("");
      setCe("");
      burst(ev.currentTarget);
      toast(
        t("Өтініш жіберілді|Отклик отправлен|Application sent"),
        t("Жұмыс беруші оны өтінімдер бөлімінде көреді|Работодатель увидит его в заявках|The employer will see it in Applications"),
      );
      setApps(await fetchApplications());
    } catch (e) {
      setCe((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-mute">{t("Жүктелуде...|Загрузка...|Loading...")}</p>;

  if (notFound || !job) {
    return (
      <div className="grid gap-4">
        <p className="text-mute">{t("Вакансия табылмады.|Вакансия не найдена.|Job not found.")}</p>
        <Link href="/jobs" className="text-sm underline">{t("Вакансияларға оралу|Назад к вакансиям|Back to jobs")}</Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid min-w-0 gap-4">
        <Link href="/jobs" className="text-sm text-mute">‹ {t("Вакансиялар|Вакансии|Jobs")}</Link>

        <section className="card grid gap-3 p-6">
          <div className="flex flex-wrap gap-2">
            <span className="chip c-i">{job.level}</span>
            {FORMAT[job.format] && <span className="chip c-i">{t(FORMAT[job.format])}</span>}
            <span className="chip c-ok">{t("Белсенді|Активна|Active")}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">{L(job.title)}</h1>
          <p className="text-mute">{L(job.company)} · {L(job.city)}</p>
          <p className="text-xl font-bold text-brand">{job.salary}</p>
          {user && (
            <div className="mt-2">
              <SaveJobButton jobId={job.id} />
            </div>
          )}
        </section>

        <section className="card grid gap-6 p-6 leading-relaxed">
          <div>
            <h2 className="mb-2 text-lg font-bold">{t("Сипаттама|Описание|Description")}</h2>
            <p className="whitespace-pre-line text-mute">{L(job.description) || "—"}</p>
          </div>

          {job.reqs.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-bold">{t("Талаптар|Требования|Requirements")}</h2>
              <ul className="grid list-disc gap-1 pl-5 text-mute">
                {job.reqs.map((r, i) => (
                  <li key={i}>{L(r)}</li>
                ))}
              </ul>
            </div>
          )}

          {job.tags.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-bold">{t("Дағдылар|Навыки|Skills")}</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((g) => (
                  <span key={g} className="chip c-i">{g}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="card grid gap-4 p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">{t("Өтініш беру|Отклик|Apply")}</h2>

        {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

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
            <label htmlFor="cv" className="text-sm font-semibold">
              {t("Қысқаша хат|Сопроводительное письмо|Cover letter")}
            </label>
            <textarea
              id="cv"
              rows={5}
              className="inp"
              style={bad(ce)}
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
            <FieldErr e={ce} />
            <button className="btn btn-p w-fit disabled:opacity-50" onClick={apply} disabled={busy}>
              {busy ? t("Жіберілуде...|Отправка...|Sending...") : t("Өтініш қалдыру|Откликнуться|Apply")}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
