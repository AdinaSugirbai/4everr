"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { sectionHref, sections, type SectionSlug } from "@/lib/sections";

export default function SectionShell({ slug, children }: { slug: SectionSlug; children: React.ReactNode }) {
  const { t } = useI18n();
  const cur = sections.find((s) => s.slug === slug)!;
  const Icon = cur.icon;
  return (
    <>
      <Link href="/profile" className="btn btn-s w-fit">← {t("Артқа|Назад|Back")}</Link>
      <div className="mt-5 flex items-center gap-3">
        <Icon className="text-3xl" aria-hidden="true" />
        <div>
          <h1 className="font-bold text-2xl">{t(cur.title)}</h1>
          <p className="text-sm text-mute">{t(cur.desc)}</p>
        </div>
      </div>
      <nav aria-label="Sections" className="flex gap-2 overflow-x-auto mt-5 mb-6 pb-1">
        {sections.map((s) => (
          <Link key={s.slug} href={sectionHref(s.slug)} aria-current={s.slug === slug ? "page" : undefined} className={"btn whitespace-nowrap " + (s.slug === slug ? "btn-p" : "btn-s")}>
            {t(s.title)}
          </Link>
        ))}
      </nav>
      <div className="grid gap-5">{children}</div>
    </>
  );
}
