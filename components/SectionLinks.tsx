"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { sectionHref, sections } from "@/lib/sections";

export default function SectionLinks() {
  const { t } = useI18n();
  return (
    <section aria-label="Sections">
      <h2 className="font-bold text-lg mb-3">{t("Бөлімдер|Разделы|Sections")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.slug} href={sectionHref(s.slug)} className="card p-4 hover:bg-soft flex items-start gap-3">
            <span className="text-2xl" aria-hidden>{s.icon}</span>
            <span className="grow">
              <span className="block font-semibold">{t(s.title)}</span>
              <span className="block text-sm text-mute">{t(s.desc)}</span>
            </span>
            <span className="text-brand" aria-hidden>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
