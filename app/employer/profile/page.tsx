"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { toast } from "@/lib/fx";
import { fetchCompany, requestCompanyVerification, updateCompany, type CompanyDraft, type CompanyInfo } from "@/lib/db";

type LegacyCompany = { name: string; industry: string; city: string; size: string; site: string; about: string };
const emptyLegacy: LegacyCompany = { name: "", industry: "", city: "", size: "", site: "", about: "" };
const empty: CompanyDraft = { name: "", industry: "", city: "", size: "", website: "", about: "", phone: "", bin: "" };

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [legacy, saveLegacy] = useLocal<LegacyCompany>("4everr:company", emptyLegacy);
  const [saved, setSaved] = useState<CompanyInfo | null>(null);
  const [draft, setDraft] = useState<CompanyDraft>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErr("");
    try {
      const company = await fetchCompany(user.id);
      setSaved(company);
      const hasSavedCompany = Boolean(company.name || company.bin || company.about);
      setDraft(hasSavedCompany ? {
        name: company.name, industry: company.industry, city: company.city, size: company.size,
        website: company.website, about: company.about, phone: company.phone, bin: company.bin,
      } : {
        ...empty,
        name: legacy.name, industry: legacy.industry, city: legacy.city, size: legacy.size,
        website: legacy.site, about: legacy.about,
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, legacy]);

  useEffect(() => { void load(); }, [load]);

  function set<K extends keyof CompanyDraft>(key: K, value: CompanyDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!user) return;
    if (draft.name.trim().length < 2 || draft.industry.trim().length < 2 || draft.city.trim().length < 2) {
      setErr(t("Компания атауын, саласын және қаласын толтырыңыз.|Укажите название компании, сферу и город.|Enter the company name, industry, and city."));
      return;
    }
    if (draft.bin.trim() && !/^\d{12}$/.test(draft.bin.replace(/\D/g, ""))) {
      setErr(t("БИН 12 саннан тұруы керек.|БИН должен состоять из 12 цифр.|BIN must contain 12 digits."));
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateCompany(user.id, draft);
      saveLegacy({ name: draft.name, industry: draft.industry, city: draft.city, size: draft.size, site: draft.website, about: draft.about });
      await load();
      toast(t("Компания профилі сақталды|Профиль компании сохранён|Company profile saved"), t("Құқықтық деректер өзгерсе, растау қайта сұралады.|Если юридические данные изменятся, потребуется повторная проверка.|Changing legal details requires a new verification."));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function requestVerification() {
    if (!saved || !user) return;
    setBusy(true);
    setErr("");
    try {
      await requestCompanyVerification();
      await load();
      toast(t("Тексеруге жіберілді|Отправлено на проверку|Submitted for review"), t("Әкімші компания деректерін тексерген соң жауап шығады.|Администратор проверит данные компании и обновит статус.|An administrator will review the company details and update the status."));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof CompanyDraft, label: string, type = "text") => (
    <label className="grid gap-1 text-sm font-semibold" key={key}>
      {t(label)}
      <input className="inp" type={type} value={draft[key]} onChange={(e) => set(key, e.target.value)} />
    </label>
  );

  if (loading) return <p className="text-mute">{t("Жүктелуде...|Загрузка...|Loading...")}</p>;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="card grid gap-4 p-5">
        <header><h1 className="text-2xl font-bold">{t("Компания профилі|Профиль компании|Company profile")}</h1><p className="mt-1 text-sm text-mute">{t("Вакансия компанияның расталған профилімен ғана жарияланады.|Вакансия публикуется только от подтверждённой компании.|Vacancies can only be published by a verified company.")}</p></header>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("name", "Компанияның ресми атауы|Официальное название компании|Registered company name")}
          {field("bin", "БИН (12 сан)|БИН (12 цифр)|Business ID (12 digits)", "text")}
          {field("industry", "Сала|Сфера|Industry")}
          {field("city", "Қала|Город|City")}
          {field("size", "Қызметкерлер саны|Число сотрудников|Company size")}
          {field("website", "Компания сайты|Сайт компании|Company website", "url")}
          {field("phone", "Байланыс телефоны|Контактный телефон|Contact phone", "tel")}
        </div>
        <label className="grid gap-1 text-sm font-semibold">{t("Компания туралы|О компании|About the company")}<textarea className="inp" rows={5} value={draft.about} onChange={(e) => set("about", e.target.value)} /></label>
        {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-p" disabled={busy} onClick={() => void save()}>{t("Компания деректерін сақтау|Сохранить данные компании|Save company details")}</button>
          <button type="button" className="btn btn-s" disabled={busy || !saved || saved.verified || Boolean(saved.verificationRequestedAt)} onClick={() => void requestVerification()}>{t("Растауға жіберу|Отправить на проверку|Request verification")}</button>
        </div>
      </section>

      <aside className="card grid gap-3 p-5 lg:sticky lg:top-20">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{draft.name || t("Компания атауы|Название компании|Company name")}</h2><span className={`chip ${saved?.verified ? "c-ok" : saved?.verificationRequestedAt ? "c-w" : "c-b"}`}>{saved?.verified ? t("Расталған|Подтверждена|Verified") : saved?.verificationRequestedAt ? t("Тексерілуде|На проверке|Under review") : t("Расталмаған|Не подтверждена|Unverified")}</span></div>
        <p className="text-sm text-mute">{[draft.industry, draft.city, draft.size].filter(Boolean).join(" · ")}</p>
        <p className="whitespace-pre-line text-sm">{draft.about || t("Компания туралы қысқаша мәлімет|Краткая информация о компании|Short company description")}</p>
        {saved?.verificationNotes && <p className="rounded-xl bg-soft p-3 text-sm">{t("Тексеру жауабы|Ответ проверки|Review note")}: {saved.verificationNotes}</p>}
        <p className="border-t border-line pt-3 text-xs text-mute">{t("Вакансияны тексеру және компанияны растау бөлек жүргізіледі. Расталмаған компания жария вакансия аша алмайды.|Проверка вакансии и компании проходит отдельно. Неподтверждённая компания не может опубликовать вакансию.|Company and vacancy reviews are separate. An unverified company cannot publish a vacancy.")}</p>
      </aside>
    </div>
  );
}
