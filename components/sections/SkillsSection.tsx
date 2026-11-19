"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { emptyResume, resumeKey, type Resume } from "@/lib/resume";

const groups = [
  { min: 75, max: 101, label: "Күшті|Сильные|Strong", cls: "c-ok" },
  { min: 50, max: 75, label: "Орташа|Средние|Intermediate", cls: "c-w" },
  { min: 0, max: 50, label: "Дамыту керек|Нужно развивать|To improve", cls: "c-b" },
];

export default function SkillsSection() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [r] = useLocal<Resume>(resumeKey(user?.email ?? ""), emptyResume);
  const skills = r.skills ?? [];

  if (skills.length === 0)
    return (
      <div className="card p-6 grid gap-3 justify-items-start">
        <p className="text-mute">{t("Дағдылар әлі қосылмаған.|Навыки ещё не добавлены.|No skills added yet.")}</p>
        <Link href="/resume" className="btn btn-p">{t("Резюмеге өту|Перейти к резюме|Go to resume")}</Link>
      </div>
    );
  return (
    <>
      <div className="grid sm:grid-cols-3 gap-3">
        {groups.map((g) => (
          <div key={g.label} className="card p-4">
            <span className={"chip " + g.cls}>{t(g.label)}</span>
            <p className="font-bold text-2xl mt-2">{skills.filter((s) => s.level >= g.min && s.level < g.max).length}</p>
          </div>
        ))}
      </div>
      {groups.map((g) => {
        const list = skills.filter((s) => s.level >= g.min && s.level < g.max);
        if (!list.length) return null;
        return (
          <div key={g.label} className="card p-5 grid gap-3">
            <h2 className="font-semibold">{t(g.label)}</h2>
            {list.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm"><span>{s.name}</span><span className="text-mute">{s.level}%</span></div>
                <div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-brand" style={{ width: s.level + "%" }} /></div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
