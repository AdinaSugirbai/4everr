"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type Rep = {
  week: { users: number; vacancies: number; apps: number };
  month: { users: number; vacancies: number; apps: number };
  dynamics: { day: string; n: number }[];
  directions: { name: string; n: number }[];
  topViewed: { id: string; title: string; company: string; views: number }[];
};
const iso = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export default function AdminReports() {
  const { t } = useI18n();
  const [r, setR] = useState<Rep | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const db = supabase();
        const head = { count: "exact" as const, head: true };
        const cnt = async (tbl: string, d: number) => (await db.from(tbl).select("id", head).gte("created_at", iso(d))).count ?? 0;
        const [uW, vW, aW, uM, vM, aM, prof, dirs, top] = await Promise.all([
          cnt("profiles", 7), cnt("vacancies", 7), cnt("applications", 7),
          cnt("profiles", 30), cnt("vacancies", 30), cnt("applications", 30),
          db.from("profiles").select("created_at").gte("created_at", iso(14)),
          db.from("vacancies").select("direction").not("direction", "is", null),
          db.from("vacancies").select("id, title, company, views").order("views", { ascending: false }).limit(5),
        ]);
        const byDay: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) byDay[iso(i).slice(0, 10)] = 0;
        (prof.data ?? []).forEach((p: { created_at: string }) => { const k = p.created_at.slice(0, 10); if (k in byDay) byDay[k]++; });
        const dm: Record<string, number> = {};
        (dirs.data ?? []).forEach((v: { direction: string }) => { dm[v.direction] = (dm[v.direction] ?? 0) + 1; });
        setR({
          week: { users: uW, vacancies: vW, apps: aW },
          month: { users: uM, vacancies: vM, apps: aM },
          dynamics: Object.entries(byDay).map(([day, n]) => ({ day, n })),
          directions: Object.entries(dm).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n).slice(0, 7),
          topViewed: (top.data ?? []) as Rep["topViewed"],
        });
      } catch (e) { setErr((e as Error).message); }
    })();
  }, []);

  const Box = ({ title, d }: { title: string; d: Rep["week"] }) => (
    <div className="rounded-2xl border border-line bg-sf p-5">
      <p className="font-semibold text-ink">{title}</p>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
        {([["users", "Қолданушы|Пользователи|Users"], ["vacancies", "Вакансия|Вакансии|Vacancies"], ["apps", "Өтінім|Заявки|Applications"]] as const).map(([k, l]) => (
          <div key={k}><dd className="text-2xl font-bold text-brand">{d[k]}</dd><dt className="text-xs text-mute">{t(l)}</dt></div>
        ))}
      </dl>
    </div>
  );
  if (!r) return <p className="text-mute">{err ?? "…"}</p>;
  const max = Math.max(1, ...r.dynamics.map((d) => d.n));
  const dmax = Math.max(1, ...r.directions.map((d) => d.n));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">{t("Есептер|Отчёты|Reports")}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Box title={t("Апталық статистика|Статистика за неделю|Weekly statistics")} d={r.week} />
        <Box title={t("Айлық статистика|Статистика за месяц|Monthly statistics")} d={r.month} />
      </div>
      <section className="rounded-2xl border border-line bg-sf p-5">
        <p className="font-semibold text-ink">{t("Жаңа қолданушылар динамикасы (14 күн)|Динамика новых пользователей (14 дней)|New users trend (14 days)")}</p>
        <div className="mt-4 flex h-32 items-end gap-1">
          {r.dynamics.map((d) => (
            <div key={d.day} title={`${d.day}: ${d.n}`} className="flex-1 rounded-t bg-brand" style={{ height: `${(d.n / max) * 100}%`, minHeight: 2 }} />
          ))}
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-sf p-5">
          <p className="font-semibold text-ink">{t("Ең танымал IT бағыттары|Популярные IT-направления|Most popular IT directions")}</p>
          <div className="mt-3 space-y-2">
            {r.directions.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm text-ink"><span>{d.name}</span><span>{d.n}</span></div>
                <div className="h-1.5 rounded bg-line"><div className="h-full rounded bg-brand" style={{ width: `${(d.n / dmax) * 100}%` }} /></div>
              </div>
            ))}
            {r.directions.length === 0 && <p className="text-sm text-mute">—</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-sf p-5">
          <p className="font-semibold text-ink">{t("Ең көп қаралған вакансиялар|Самые просматриваемые вакансии|Most viewed vacancies")}</p>
          <ol className="mt-3 space-y-2 text-sm">
            {r.topViewed.map((v) => (
              <li key={v.id} className="flex justify-between gap-3 text-ink"><span className="truncate">{v.title} · <span className="text-mute">{v.company}</span></span><span className="text-brand">{v.views}</span></li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
