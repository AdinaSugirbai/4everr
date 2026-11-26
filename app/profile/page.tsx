"use client";
import Link from "next/link";
import BugHunt, { type Daily } from "@/components/BugHunt";
import SkillPlanets, { type Skill } from "@/components/SkillPlanets";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { sectionHref, sections } from "@/lib/sections";

const day = (ms = 0) => new Date(Date.now() - ms).toISOString().slice(0, 10);

const percent = 58;

const skills: Skill[] = [
  { name: "HTML", value: 88 },
  { name: "CSS", value: 74 },
  { name: "JavaScript", value: 52 },
  { name: "Java", value: 30 },
];

const quests = [
  { title: "Профильді толтыру", reward: 50, progress: 100 },
  { title: "Алғашқы резюме жасау", reward: 100, progress: 60 },
  { title: "JavaScript тесті 80%", reward: 150, progress: 52 },
];

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [daily, saveDaily] = useLocal<Daily>("4everr:daily", { last: "", streak: 0, picked: null, xp: 0 });
  const name = user?.name || "Әсел Жақсылық";
  const streak = daily.last === day() || daily.last === day(86400000) ? daily.streak : 0;

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
      {/* SOL: профиль, планеталар, вакансия */}
      <div className="min-w-0 space-y-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-semibold text-white">
            {name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-mute">{t("Қош келдіңіз|Добро пожаловать|Welcome")}</p>
            <h1 className="truncate text-2xl font-bold text-ink">{name}</h1>
            <p className="text-sm text-mute">
              {streak > 0
                ? t("{n} күн қатарынан белсенді|{n} дн. подряд|{n}-day streak").replace("{n}", String(streak))
                : t("Бүгінгі сұраққа жауап беріп, серияны бастаңыз|Ответьте на вопрос дня|Answer today's question")}
            </p>
          </div>
        </div>

        <SkillPlanets percent={percent} skills={skills} />

        <Link href="/jobs" className="block rounded-2xl bg-brand p-5 text-white transition-opacity hover:opacity-90">
          <p className="text-xs uppercase tracking-wider opacity-80">
            {t("Сәйкес вакансия|Подходящая вакансия|Matching job")}
          </p>
          <p className="mt-1 text-lg font-semibold">Junior Frontend · 90%</p>
          <p className="mt-1 text-sm opacity-85">
            {t("JavaScript тестін 80%-ға жеткізіңіз|Доведите JavaScript до 80%|Raise JavaScript to 80%")}
          </p>
        </Link>
      </div>

      {/* ОҢ: тапсырмалар, бөлімдер */}
      <div className="min-w-0 space-y-8">
        <section>
          <h2 className="text-lg font-bold text-ink">{t("Бастапқы тапсырмалар|Стартовые квесты|Starter quests")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {quests.map((q) => (
              <div key={q.title} className="rounded-2xl border border-line bg-sf p-4">
                <span className="text-xs font-semibold text-brand">+{q.reward}</span>
                <p className="mt-1 font-medium text-ink">{q.title}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded bg-line">
                  <div className="h-full rounded bg-brand" style={{ width: `${q.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">{t("Бөлімдер|Разделы|Sections")}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {sections.map((s) => (
              <Link
                key={s.slug}
                href={sectionHref(s.slug)}
                className="flex items-start gap-3 rounded-2xl border border-line bg-sf p-5 transition-colors hover:bg-soft"
              >
                <s.icon className="text-2xl" aria-hidden="true" />
                <span className="grow">
                  <span className="block font-semibold text-ink">{t(s.title)}</span>
                  <span className="mt-0.5 block text-sm text-mute">{t(s.desc)}</span>
                </span>
                <span className="text-brand" aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </section>

        <BugHunt daily={daily} onChange={saveDaily} />
      </div>
    </div>
  );
}
