"use client";
import Link from "next/link";
import History from "@/components/History";
import ProgressRing from "@/components/ProgressRing";
import BugHunt, { type Daily } from "@/components/BugHunt"; 
import Avatar from "@/components/Avatar";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";

const day = (ms = 0) => new Date(Date.now() - ms).toISOString().slice(0, 10);

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [daily, saveDaily] = useLocal<Daily>("4everr:daily", { last: "", streak: 0, picked: null, xp: 0 });
  const name = user?.name || "Әсел Жақсылық";
  const email = user?.email || "asel@mail.kz";
  const streak = daily.last === day() || daily.last === day(86400000) ? daily.streak : 0;
  const percent = 58;

  return (
    <>
      <div className="hero rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grow basis-64">
            <span className="chip" style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}>
              <i className="dot" />
              {streak > 0
                ? t("{n} күн қатарынан белсенді|{n} дн. подряд|{n}-day streak").replace("{n}", String(streak))
                : t("Бүгінгі сұраққа жауап беріп, серияны бастаңыз|Ответьте на вопрос дня и начните серию|Answer today's question to start a streak")}
            </span>
            <h1 className="font-bold text-3xl sm:text-4xl leading-tight mt-3">
              {t("Frontend жолында {p}% өттіңіз|Вы прошли {p}% пути Frontend|You are {p}% through the Frontend path").replace("{p}", String(percent))}
            </h1>
            <p className="mt-2 text-white/80 max-w-[52ch]">
              {t("Келесі қадам: JavaScript тестін 80%-ға жеткізіңіз. Сонда Kaspi Lab вакансиясына сәйкестігіңіз 90%-дан асады.|Следующий шаг: доведите тест по JavaScript до 80%. Тогда совпадение с вакансией Kaspi Lab превысит 90%.|Next step: raise your JavaScript test to 80%. Then your match for the Kaspi Lab job will exceed 90%.")}
            </p>
            <Link href="/jobs" className="btn mt-5" style={{ background: "#fff", color: "#073A35" }}>
              {t("Сәйкес вакансияны ашу|Открыть подходящую вакансию|Open the matching job")}
            </Link>
          </div>
          <ProgressRing value={percent} size={128} className="text-3xl" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="card p-5 lg:sticky lg:top-20">
          <div className="flex items-center gap-4">
            <Avatar name={name} size={96} ring={percent} />
            <div className="min-w-0">
              <h2 className="font-bold text-xl leading-tight">{name}</h2>
              <p className="text-sm text-mute truncate">{email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip c-i">{t("Кандидат|Кандидат|Candidate")}</span>
            <span className="chip c-ok">Junior · Frontend</span>
          </div>
          <h3 className="mt-6 text-sm font-semibold">{t("Менің дағдыларым|Мои навыки|My skills")}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="chip c-ok">HTML</span>
            <span className="chip c-ok">CSS</span>
            <span className="chip c-w">JavaScript</span>
            <span className="chip c-b">{t("Java · әлсіз|Java · слабо|Java · weak")}</span>
          </div>
        </aside>

        <div className="grid gap-6 min-w-0">
          <DailyChallenge />
          <History />
        </div>
      </div>
    </>
  );
}
