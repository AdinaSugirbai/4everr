"use client";
import Link from "next/link";
import BugHunt, { type Daily } from "@/components/BugHunt";
import History from "@/components/History";
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
    <div className="space-y-6">
      <SkillPlanets percent={percent} skills={skills} />

      <section className="mx-auto max-w-md">
        <p className="text-sm text-mute">
          {streak > 0
            ? t("{n} күн қатарынан белсенді|{n} дн. подряд|{n}-day streak").replace("{n}", String(streak))
            : t("Бүгінгі сұраққа жауап беріп, серияны бастаңыз|Ответьте на вопрос дня|Answer today's question")}
        </p>
        <h2 className="mt-4 text-lg font-bold text-ink">
          {t("Бастапқы тапсырмалар|Стартовые квесты|Starter quests")}
        </h2>
        <div className="mt-3 grid gap-3">
          {quests.map((q) => (
            <div key={q.title} className="rounded-2xl border border-line bg-sf p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{q.title}</p>
                <span className="text-xs font-semibold text-brand">+{q.reward}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded bg-line">
                <div className="h-full rounded bg-brand" style={{ width: `${q.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-md grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link key={s.slug} href={sectionHref(s.slug)} className="rounded-2xl border border-line bg-sf p-4">
            <span className="text-xl" aria-hidden>{s.icon}</span>
            <p className="mt-2 font-semibold text-ink">{t(s.title)}</p>
            <p className="mt-0.5 text-xs text-mute">{t(s.desc)}</p>
          </Link>
        ))}
      </section>

      <div className="mx-auto grid max-w-md gap-6">
        <BugHunt daily={daily} onChange={saveDaily} />
        <History />
      </div>
    </div>
  );
}
