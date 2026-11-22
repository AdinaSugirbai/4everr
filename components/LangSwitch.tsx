"use client";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { v: Lang; label: string; name: string }[] = [
  { v: "kk", label: "ҚАЗ", name: "Қазақша" },
  { v: "ru", label: "РУС", name: "Русский" },
  { v: "en", label: "ENG", name: "English" },
];

// The same segmented chip style as the direction and format choices in the vacancy form.
export default function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="seg seg-sm flex gap-1" role="radiogroup" aria-label="Language">
      {LANGS.map((l) => (
        <label key={l.v} title={l.name}>
          <input
            type="radio"
            name="site-lang"
            value={l.v}
            checked={lang === l.v}
            onChange={() => setLang(l.v)}
            aria-label={l.name}
          />
          <span>{l.label}</span>
        </label>
      ))}
    </div>
  );
}
