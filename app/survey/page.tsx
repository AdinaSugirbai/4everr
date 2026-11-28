"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import Silhouette from "@/components/Silhouette";
import { surveys as defaultSurveys, type Survey } from "@/lib/quizdata";
import { loadAssessmentCatalog } from "@/lib/assessments";

export default function SurveyPage() {
  const { t } = useI18n();
  const [surveyResults, saveSurvey] = useLocal<Record<string, number[]>>("4everr:surveys", {});
  const [surveys, setSurveys] = useState(defaultSurveys);
  const [catalogError, setCatalogError] = useState("");
  const [sid, setSid] = useState<string | null>(null);
  const [picks, setPicks] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    loadAssessmentCatalog("survey").then((catalog) => { if (active) setSurveys(catalog as Record<string, Survey>); })
      .catch((error) => { if (active) setCatalogError((error as Error).message); });
    return () => { active = false; };
  }, []);

  if (!sid) {
    return (
      <div className="max-w-2xl mx-auto grid gap-5">
        {catalogError && <p role="status" className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700">{t("Серверлік каталог ашылмады, кірістірілген сауалнамалар көрсетілді.|Не удалось загрузить каталог, показаны встроенные опросы.|Could not load the server catalog; built-in surveys are shown.")}</p>}
        {Object.keys(surveyResults).length > 0 && <p className="text-sm text-mute">{t("Бұрын өткен сауалнамалардың нәтижелері сақталған.|Результаты ранее пройденных опросов сохранены.|Results from previous surveys are saved.")}</p>}
        <div><h1 className="font-bold text-2xl">{t("Сауалнама|Опрос|Survey")}</h1><p className="text-sm text-mute mt-1">{t("Сауалнама таңдаңыз. Әр жауап силуэтті толықтырады.|Выберите опрос. Каждый ответ достраивает силуэт.|Pick a survey. Each answer completes the silhouette.")}</p></div>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.keys(surveys).map((id) => (<button key={id} onClick={() => { setSid(id); setPicks([]); }} className="card p-5 text-left hover:bg-soft"><p className="font-bold text-lg">{t(surveys[id].name)}</p><p className="text-sm text-mute">{surveys[id].q.length} {t("сұрақ|вопросов|questions")}</p></button>))}
        </div>
      </div>
    );
  }

  const sv = surveys[sid];
  const total = sv.q.length;
  const done = picks.length >= total;
  const counts = sv.dirs.map((_, d) => picks.filter((p) => p === d).length);
  const top = counts.indexOf(Math.max(...counts));

  function answer(d: number) {
    const next = [...picks, d];
    setPicks(next);
    if (next.length >= total) saveSurvey({ ...surveyResults, [sid as string]: sv.dirs.map((_, k) => next.filter((p) => p === k).length) });
  }

  return (
    <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_200px] gap-5 items-start">
      {done ? (
        <div className="card p-6 grid gap-4">
          <h1 className="font-bold text-2xl">{t("Сіздің нәтижеңіз|Ваш результат|Your result")}</h1>
          <span className="chip c-ok w-fit text-base">{t(sv.dirs[top])}</span>
          <div className="grid gap-3">
            {sv.dirs.map((d, k) => (<div key={k}><div className="flex justify-between text-sm"><span className="font-semibold">{t(d)}</span><span className="text-mute">{counts[k]} / {total}</span></div><div className="h-2 rounded-full bg-line overflow-hidden mt-1"><div className="h-full bg-brand" style={{ width: (counts[k] / total) * 100 + "%", transition: "width .6s" }} /></div></div>))}
          </div>
          <div className="flex flex-wrap gap-2"><Link href="/test" className="btn btn-p">{t("Тест тапсыру|Пройти тест|Take a test")}</Link><button className="btn btn-s" onClick={() => setPicks([])}>{t("Қайта өту|Пройти снова|Retake")}</button><button className="btn btn-s" onClick={() => setSid(null)}>{t("Басқа сауалнама|Другой опрос|Other survey")}</button></div>
        </div>
      ) : (
        <div className="card p-6 grid gap-5">
          <div className="flex justify-between text-sm text-mute"><span>{t(sv.name)}</span><span>{picks.length + 1} / {total}</span></div>
          <h1 className="font-bold text-xl">{t(sv.q[picks.length].q)}</h1>
          <div className="grid gap-2">{sv.q[picks.length].o.map((o) => (<button key={o[0]} onClick={() => answer(o[1])} className="btn btn-s justify-start text-left">{t(o[0])}</button>))}</div>
        </div>
      )}
      <div className="card p-4 grid gap-2 justify-items-center"><Silhouette progress={picks.length / total} /><p className="text-sm text-mute">{picks.length} / {total}</p></div>
    </div>
  );
}
