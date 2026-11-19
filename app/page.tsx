"use client";
import Link from "next/link";
import BugHunt, { type Daily } from "@/components/BugHunt";
import History from "@/components/History";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { sectionHref, sections } from "@/lib/sections";

const day = (ms = 0) => new Date(Date.now() - ms).toISOString().slice(0, 10);

const quests = [
  { title: "Профильді толтыру", reward: 50, progress: 100 },
  { title: "Алғашқы резюме жасау", reward: 100, progress: 60 },
  { title: "JavaScript тесті 80%", reward: 150, progress: 52 },
];

const skills = [
  { name: "HTML", value: 88 },
  { name: "CSS", value: 74 },
  { name: "JavaScript", value: 52 },
];

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [daily, saveDaily] = useLocal<Daily>("4everr:daily", { last: "", streak: 0, picked: null, xp: 0 });
  const name = user?.name || "Әсел Жақсылық";
  const streak = daily.last === day() || daily.last === day(86400000) ? daily.streak : 0;
  const percent = 58;

  return (
    <div className="-mx-4 -my-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#B9F5E6] via-[#E8FBF6] to-bg px-5 pt-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brand text-sm font-semibold text-white">
              {name.slice(0, 1)}
            </div>
            <div>
              <p className="text-xs text-mute">{t("Қош келдіңіз|Добро пожаловать|Welcome")}</p>
              <p className="font-semibold leading-tight text-ink">{name}</p>
            </div>
          </div>
          <div className="rounded-full bg-[#FFE9B8] px-3 py-1.5 text-sm font-medium text-[#8A5200]">
            🔥 {daily.xp ?? 0}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[.18em] text-brand">4everr · Frontend</p>
          <h1 className="mt-2 text-6xl font-bold tracking-tight text-brand">
            {percent}<span className="text-2xl opacity-70">%</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-mute">
            {streak > 0
              ? t("{n} күн қатарынан белсенді|{n} дн. подряд|{n}-day streak").replace("{n}", String(streak))
              : t("Бүгінгі сұраққа жауап беріп, серияны бастаңыз|Ответьте на вопрос дня|Answer today's question")}
          </p>
          <Link
            href="/jobs"
            className="btn mt-5 inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white"
          >
            {t("Сәйкес вакансияны ашу|Открыть подходящую вакансию|Open the matching job")}
          </Link>
        </div>
      </section>

      {/* NOTICE */}
      <div className="relative z-10 -mt-8 mx-4 rounded-xl border border-[#CFE0FF] bg-sf px-4 py-3 text-sm text-[#2A47B8] shadow-sm">
        {t("Kaspi Lab вакансиясына сәйкестік 90%-дан асады|Совпадение с Kaspi Lab превысит 90%|Your match for Kaspi Lab will exceed 90%")}
      </div>

      {/* MENU */}
      <div className="mt-4 rounded-t-3xl bg-sf px-4 pt-7 pb-6 shadow-[0_-2px_12px_rgba(10,114,102,.06)]">
        <nav className="grid grid-cols-4 gap-y-6 text-center">
          {sections.map((s, i) => {
            const tones = [
              "bg-soft text-brand",
              "bg-[#FFF0D2] text-[#8A5200]",
              "bg-[#E3EBFF] text-[#2A47B8]",
              "bg-[#FDE3E1] text-[#A3261D]",
            ];
            return (
              <Link key={s.slug} href={sectionHref(s.slug)} className="flex flex-col items-center gap-2 text-xs text-ink">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${tones[i % tones.length]}`}>
                  <span aria-hidden>{s.icon}</span>
                </span>
                <span className="leading-tight">{t(s.title)}</span>
              </Link>
            );
          })}
        </nav>

        {/* PROMO */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/jobs" className="relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-brand bg-soft p-4">
            <span className="text-sm font-semibold text-brand">{t("Вакансиялар|Вакансии|Jobs")}</span>
            <span className="text-xs text-mute">{t("Жұмыс іздеу|Поиск работы|Find a job")}</span>
          </Link>
          <Link href="/test" className="relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-[#0A5A50] p-4 text-white">
            <span className="text-[10px] uppercase tracking-wider opacity-80">AI көмекші</span>
            <span className="text-base font-semibold leading-snug">
              {t("Тесттен өтіп, дағдыңызды тексеріңіз|Пройдите тест|Take a test")}
            </span>
          </Link>
        </div>

        {/* QUESTS */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{t("Бастапқы тапсырмалар|Стартовые квесты|Starter quests")}</h2>
          <span className="text-mute">ⓘ</span>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {quests.map((q) => (
            <div key={q.title} className="min-w-[240px] rounded-2xl border border-line bg-bg p-4">
              <p className="text-xs font-semibold text-[#12663A]">+{q.reward} ұпай</p>
              <p className="mt-1 font-semibold text-ink">{q.title}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded bg-line">
                <div className="h-full rounded bg-brand" style={{ width: `${q.progress}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* SKILLS */}
        <div className="mt-8 rounded-2xl border border-line bg-bg p-4">
          <h2 className="font-semibold text-ink">{t("Менің дағдыларым|Мои навыки|My skills")}</h2>
          <div className="mt-3 grid gap-3">
            {skills.map((s) => (
              <div key={s.name} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-ink">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-line">
                  <div className="h-full rounded bg-brand" style={{ width: `${s.value}%` }} />
                </div>
                <span className="w-10 text-right font-medium text-brand">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* EXISTING FEATURES */}
        <div className="mt-8 grid gap-6">
          <BugHunt daily={daily} onChange={saveDaily} />
          <History />
        </div>
      </div>
    </div>
  );
}
