"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/lib/fx";

const KINDS = [
  { v: "REVIEW", l: "Пікір|Отзыв|Review" },
  { v: "COMPLAINT", l: "Шағым|Жалоба|Complaint" },
  { v: "SUGGESTION", l: "Ұсыныс|Предложение|Suggestion" },
];

export default function FeedbackPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [kind, setKind] = useState("REVIEW");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!user) return;
    if (body.trim().length < 10) { setErr(t("Кемінде 10 таңба жазыңыз|Минимум 10 символов|At least 10 characters")); return; }
    setBusy(true); setErr("");
    const { error } = await supabase().from("reviews").insert({
      user_id: user.id, kind, body: body.trim(), rating: kind === "REVIEW" ? rating : null,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setBody("");
    toast(t("Рахмет!|Спасибо!|Thank you!"), t("Хабарламаңыз әкімшіге жіберілді|Сообщение отправлено администратору|Your message was sent to the admin"));
  }

  if (!user) {
    return (
      <div className="card mx-auto grid max-w-xl gap-4 p-6">
        <h1 className="text-2xl font-bold">{t("Пікір қалдыру|Оставить отзыв|Leave feedback")}</h1>
        <p className="text-mute">{t("Пікір, шағым немесе ұсыныс жіберу үшін аккаунтқа кіріңіз.|Чтобы отправить отзыв, жалобу или предложение, войдите в аккаунт.|Sign in to send a review, complaint or suggestion.")}</p>
        <Link href="/start" className="btn btn-p w-fit">{t("Кіру немесе тіркелу|Войти или зарегистрироваться|Sign in or register")}</Link>
      </div>
    );
  }

  return (
    <div className="card mx-auto grid max-w-xl gap-4 p-6">
      <h1 className="text-2xl font-bold">{t("Пікір қалдыру|Оставить отзыв|Leave feedback")}</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.v} aria-pressed={kind === k.v} className={"btn " + (kind === k.v ? "btn-p" : "btn-s")} onClick={() => setKind(k.v)}>{t(k.l)}</button>
        ))}
      </div>
      {kind === "REVIEW" && (
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} role="radio" aria-checked={rating === n} aria-label={String(n)} className="text-3xl" onClick={() => setRating(n)}>{n <= rating ? "★" : "☆"}</button>
          ))}
        </div>
      )}
      <textarea rows={5} className="inp" value={body} onChange={(e) => setBody(e.target.value)} aria-label={t("Хабарлама|Сообщение|Message")} />
      <button className="btn btn-p w-fit" disabled={busy} onClick={send}>{t("Жіберу|Отправить|Send")}</button>
    </div>
  );
}
