"use client";
import type { CSSProperties } from "react";
import { useI18n } from "@/lib/i18n";

export const bad = (e?: string): CSSProperties | undefined => (e ? { borderColor: "var(--bt)", boxShadow: "0 0 0 1px var(--bt)" } : undefined);
export const initials = (n: string) => n.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function FieldErr({ e }: { e?: string }) {
  const { t } = useI18n();
  return e ? <p role="alert" className="text-xs mt-1" style={{ color: "var(--bt)" }}>{t(e)}</p> : null;
}
