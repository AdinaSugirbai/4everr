"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { emptyResume, resumeKey, type Resume } from "@/lib/resume";
import { initials } from "@/lib/ui";

export default function AboutSection() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [r] = useLocal<Resume>(resumeKey(user?.email ?? ""), emptyResume);
  const rows: [string, string][] = [
    [t("Лауазым|Должность|Position"), r.position],
    [t("Қала|Город|City"), r.city],
    [t("Телефон|Телефон|Phone"), r.phone],
    ["Email", user?.email ?? ""],
  ];
  return (
    <>
      <div className="card p-5 flex items-center gap-4">
        <span className="w-20 h-20 shrink-0 rounded-full bg-soft overflow-hidden grid place-items-center text-brand font-bold text-xl">
          {r.photo ? <img src={r.photo} alt="" className="w-full h-full object-cover" /> : initials(user?.name ?? "")}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-xl truncate">{user?.name}</p>
          <p className="text-mute">{r.position || "—"}</p>
        </div>
        <Link href="/resume" className="btn btn-s ml-auto">{t("Өзгерту|Изменить|Edit")}</Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {rows.map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-sm text-mute">{k}</p><p className="font-semibold break-words">{v || "—"}</p></div>
        ))}
      </div>
      <div className="card p-5"><h2 className="font-semibold mb-1">{t("Өзі туралы|О себе|About")}</h2><p className="text-mute">{r.about || "—"}</p></div>
      <div className="card p-5"><h2 className="font-semibold mb-1">{t("Білім|Образование|Education")}</h2><p className="text-mute">{r.education || "—"}</p></div>
    </>
  );
}
