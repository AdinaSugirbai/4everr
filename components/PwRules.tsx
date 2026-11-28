"use client";
import { checkPassword } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

const items = [
  ["len", "Кемінде 6 таңба|Минимум 6 символов|At least 6 characters"],
  ["letter", "Әріп|Буква|A letter"],
  ["digit", "Сан|Цифра|A digit"],
  ["symbol", "Символ (!@#$...)|Символ (!@#$...)|A symbol (!@#$...)"],
] as const;

export default function PwRules({ pw, strict }: { pw: string; strict?: boolean }) {
  const { t } = useI18n();
  const c = checkPassword(pw);
  return (
    <ul className="grid gap-1 text-xs">
      {items.map(([k, l]) => (
        <li key={k} className={c[k] || strict ? "" : "text-mute"} style={c[k] ? { color: "#16a34a" } : strict ? { color: "var(--bt)" } : undefined}>
          {c[k] ? "✓" : "○"} {t(l)}
        </li>
      ))}
    </ul>
  );
}
