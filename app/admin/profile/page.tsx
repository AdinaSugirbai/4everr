"use client";

import Link from "next/link";
import { useState } from "react";
import AdminLoading from "@/components/AdminLoading";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { updateProfileName } from "@/lib/admin";
import { supabase } from "@/lib/supabase/client";

export default function AdminProfile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return <AdminLoading />;
  const currentUser = user;

  async function saveName() {
    if (name.trim().length < 2) { setMessage({ ok: false, text: t("Аты кемінде екі таңба болсын.|Имя должно содержать не менее двух символов.|Name must be at least two characters.") }); return; }
    setBusy(true); setMessage(null);
    try { await updateProfileName(currentUser.id, name); setMessage({ ok: true, text: t("Аты сақталды.|Имя сохранено.|Name saved.") }); }
    catch (e) { setMessage({ ok: false, text: (e as Error).message }); }
    finally { setBusy(false); }
  }

  async function changePassword() {
    if (password.length < 8) { setMessage({ ok: false, text: t("Құпиясөз кемінде 8 таңба болуы керек.|Пароль должен содержать не менее 8 символов.|Password must have at least 8 characters.") }); return; }
    setBusy(true); setMessage(null);
    const { error } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (error) setMessage({ ok: false, text: error.message });
    else { setPassword(""); setMessage({ ok: true, text: t("Құпиясөз жаңартылды.|Пароль обновлён.|Password updated.") }); }
  }

  const input = "inp w-full";
  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <header><h1 className="text-2xl font-bold text-ink">{t("Әкімші профилі|Профиль администратора|Admin profile")}</h1><p className="mt-1 text-sm text-mute">{t("Жеке аккаунт ақпараты|Информация личного аккаунта|Your account information")}</p></header>
      {message && <p role={message.ok ? "status" : "alert"} className={`rounded-xl px-4 py-3 text-sm ${message.ok ? "bg-brand/10 text-brand" : "bg-red-500/10 text-red-500"}`}>{message.text}</p>}
      <section className="card grid gap-4 p-5">
        <h2 className="font-semibold text-ink">{t("Профиль деректері|Данные профиля|Profile details")}</h2>
        <label className="grid gap-1 text-sm font-semibold">{t("Аты-жөні|Имя и фамилия|Name")}<input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="grid gap-1 text-sm font-semibold">Email<input className={`${input} opacity-70`} value={currentUser.email} readOnly /></label>
        <div className="grid gap-1 text-sm"><span className="font-semibold">{t("Рөлі|Роль|Role")}</span><span className="chip c-i w-fit">{t("Әкімші|Администратор|Administrator")}</span></div>
        <p className="text-xs text-mute">{t("Аккаунт ID|ID аккаунта|Account ID")}: {currentUser.id}</p>
        <button type="button" disabled={busy} className="btn btn-p w-fit" onClick={() => void saveName()}>{t("Атын сақтау|Сохранить имя|Save name")}</button>
      </section>
      <section className="card grid gap-4 p-5">
        <h2 className="font-semibold text-ink">{t("Құпиясөз|Пароль|Password")}</h2>
        <label className="grid gap-1 text-sm font-semibold">{t("Жаңа құпиясөз|Новый пароль|New password")}<input type="password" autoComplete="new-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button type="button" disabled={busy || password.length < 8} className="btn btn-s w-fit" onClick={() => void changePassword()}>{t("Құпиясөзді жаңарту|Обновить пароль|Update password")}</button>
      </section>
      <Link href="/admin" className="text-sm text-mute underline">‹ {t("Әкімші панеліне|В панель администратора|Back to admin")}</Link>
    </div>
  );
}
