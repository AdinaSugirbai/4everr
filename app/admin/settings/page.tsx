"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { updateProfileName } from "@/lib/admin";

const NOTIFY = [
  { key: "notify_new_user", l: "Жаңа қолданушы тіркелгенде|Новый пользователь|New user registered" },
  { key: "notify_new_vacancy", l: "Жаңа вакансия тексеруге келгенде|Новая вакансия на проверку|New vacancy awaiting review" },
  { key: "notify_new_review", l: "Жаңа пікір немесе шағым|Новый отзыв или жалоба|New review or complaint" },
];

export default function AdminSettings() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState(user?.name ?? "");
  const [pw, setPw] = useState("");
  const [site, setSite] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase().from("site_settings").select("key, value").then(({ data }) => {
      setSite(Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])));
    });
  }, []);

  const done = (e: { message: string } | null | undefined, okText: string) =>
    setMsg(e ? { ok: false, text: e.message } : { ok: true, text: okText });
  const saved = t("Сақталды|Сохранено|Saved");

  async function saveName() {
    try { if (user) await updateProfileName(user.id, name); done(null, saved); } catch (e) { done(e as Error, ""); }
  }
  async function changePw() {
    if (pw.length < 8) return done({ message: t("Кемінде 8 таңба|Минимум 8 символов|At least 8 characters") }, "");
    const { error } = await supabase().auth.updateUser({ password: pw });
    if (!error) setPw("");
    done(error, saved);
  }
  async function saveSite() {
    const rows = ["site_name", "site_logo", ...NOTIFY.map((n) => n.key)].map((key) => ({ key, value: site[key] ?? "" }));
    const { error } = await supabase().from("site_settings").upsert(rows);
    done(error, saved);
  }
  const inp = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-ink outline-none focus:border-brand";
  const card = "space-y-3 rounded-2xl border border-line bg-sf p-5";
  const btn = "rounded-lg bg-brand px-4 py-2 text-sm text-white";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("Баптаулар|Настройки|Settings")}</h1>
      {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-brand/10 text-brand" : "bg-red-500/10 text-red-500"}`}>{msg.text}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <section className={card}>
          <h2 className="font-semibold text-ink">{t("Админ профилі|Профиль администратора|Admin profile")}</h2>
          <p className="text-sm text-mute">{user?.email}</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inp} />
          <button onClick={saveName} className={btn}>{t("Сақтау|Сохранить|Save")}</button>
        </section>
        <section className={card}>
          <h2 className="font-semibold text-ink">{t("Құпиясөзді өзгерту|Смена пароля|Change password")}</h2>
          <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t("Жаңа құпиясөз|Новый пароль|New password")} className={inp} />
          <button onClick={changePw} className={btn}>{t("Өзгерту|Изменить|Change")}</button>
        </section>
        <section className={card + " md:col-span-2"}>
          <h2 className="font-semibold text-ink">{t("Сайт баптаулары|Настройки сайта|Site settings")}</h2>
          <input value={site.site_name ?? ""} onChange={(e) => setSite({ ...site, site_name: e.target.value })} placeholder={t("Сайт атауы|Название сайта|Site name")} className={inp} />
          <input value={site.site_logo ?? ""} onChange={(e) => setSite({ ...site, site_logo: e.target.value })} placeholder={t("Логотип URL|URL логотипа|Logo URL")} className={inp} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">{t("Хабарландырулар|Уведомления|Notifications")}</p>
            {NOTIFY.map((n) => (
              <label key={n.key} className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={site[n.key] === "1"} onChange={(e) => setSite({ ...site, [n.key]: e.target.checked ? "1" : "0" })} />
                {t(n.l)}
              </label>
            ))}
          </div>
          <button onClick={saveSite} className={btn}>{t("Сақтау|Сохранить|Save")}</button>
        </section>
      </div>
    </div>
  );
}
