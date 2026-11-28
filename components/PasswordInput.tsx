"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { useI18n } from "@/lib/i18n";

export default function PasswordInput({ id, value, onChange, style, invalid, label }: {
  id?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: CSSProperties; invalid?: boolean; label?: string;
}) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();
  return (
    <div className="relative mt-1">
      <input id={id} type={show ? "text" : "password"} className="inp" style={{ ...style, paddingRight: 90 }} aria-invalid={invalid} aria-label={label} value={value} onChange={onChange} />
      <button type="button" onClick={() => setShow(!show)} className="absolute text-sm text-mute" style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}>
        {show ? t("Жасыру|Скрыть|Hide") : t("Көрсету|Показать|Show")}
      </button>
    </div>
  );
}
