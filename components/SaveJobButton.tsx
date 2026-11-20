"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { fetchFavorites, setFavorite } from "@/lib/userdata";

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetchFavorites()
      .then((rows) => setSaved(rows.some((r) => r.job_id === jobId)))
      .catch(() => setSaved(false));
  }, [ready, user, jobId]);

  if (!ready) return null;

  if (!user) {
    return (
      <Link href="/start" className="inline-block rounded-xl border border-line px-4 py-2 text-sm hover:bg-soft">
        {t("Сақтау үшін кіріңіз|Войдите, чтобы сохранить|Sign in to save")}
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    setErr(null);
    try {
      await setFavorite(jobId, !saved);
      setSaved(!saved);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={
          "rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 " +
          (saved ? "bg-soft text-brand border border-brand" : "border border-line text-ink hover:bg-soft")
        }
      >
        {saved
          ? t("Таңдаулыда ✓|В избранном ✓|Saved ✓")
          : t("Таңдаулыға сақтау|Сохранить в избранное|Save to favorites")}
      </button>
      {err && <p className="text-sm text-red-500">{err}</p>}
    </div>
  );
}
