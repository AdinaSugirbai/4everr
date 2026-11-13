"use client";
import { useI18n, type Lang } from "@/lib/i18n";

export default function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="inp" style={{ width: "auto", padding: "6px 8px" }}>
      <option value="kk">ҚАЗ</option>
      <option value="ru">РУС</option>
      <option value="en">ENG</option>
    </select>
  );
}
