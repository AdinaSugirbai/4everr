"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { setRole as updateUserRole, updateProfileDetails, type ProfileDetails } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";
import { useAuth, type Role } from "@/lib/auth";

type Profile = ProfileDetails & {
  id: string;
  email: string;
  role: Role;
  banned: boolean;
  verified: boolean;
  archived_at: string | null;
  archive_reason: string | null;
  created_at: string;
};

const roleLabel: Record<Role, string> = {
  CANDIDATE: "Кандидат|Кандидат|Candidate",
  EMPLOYER: "Жұмыс беруші|Работодатель|Employer",
  ADMIN: "Әкімші|Администратор|Admin",
};

export default function AdminUserDetails() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [roleDraft, setRoleDraft] = useState<Exclude<Role, "ADMIN">>("CANDIDATE");
  const [roleSaved, setRoleSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase()
      .from("profiles")
      .select("id, name, email, role, banned, verified, archived_at, archive_reason, created_at, phone, city, company_name, company_about, contact_phone, bin")
      .eq("id", id)
      .maybeSingle();
    if (error) setErr(error.message);
    else if (!data) setErr(t("Аккаунт табылмады.|Аккаунт не найден.|Account not found."));
    else {
      const raw = data as Record<string, unknown>;
      const row: Profile = {
        id: String(raw.id), name: String(raw.name ?? ""), email: String(raw.email ?? ""),
        role: raw.role as Role, banned: Boolean(raw.banned), verified: Boolean(raw.verified),
        archived_at: raw.archived_at ? String(raw.archived_at) : null,
        archive_reason: raw.archive_reason ? String(raw.archive_reason) : null,
        created_at: String(raw.created_at ?? ""), phone: String(raw.phone ?? ""),
        city: String(raw.city ?? ""), companyName: String(raw.company_name ?? ""),
        companyAbout: String(raw.company_about ?? ""), contactPhone: String(raw.contact_phone ?? ""),
        bin: String(raw.bin ?? ""),
      };
      setProfile(row);
      if (row.role !== "ADMIN") setRoleDraft(row.role);
      setDraft({
        name: row.name ?? "",
        phone: row.phone ?? "",
        city: row.city ?? "",
        companyName: row.companyName,
        companyAbout: row.companyAbout,
        contactPhone: row.contactPhone,
        bin: row.bin,
      });
    }
    setLoading(false);
  }, [id, t]);

  useEffect(() => { void load(); }, [load]);

  function set<K extends keyof ProfileDetails>(key: K, value: ProfileDetails[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setSaved(false);
  }

  async function save() {
    if (!profile || !draft || draft.name.trim().length < 2) {
      setErr(t("Аты кемінде 2 таңба болуы керек.|Имя должно содержать не менее 2 символов.|Name must contain at least 2 characters."));
      return;
    }
    if (profile.role === "EMPLOYER" && draft.bin.trim() && !/^\d{12}$/.test(draft.bin.trim())) {
      setErr(t("БИН 12 саннан тұруы керек.|БИН должен состоять из 12 цифр.|BIN must contain 12 digits."));
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await updateProfileDetails(profile.id, draft);
      await load();
      setSaved(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole() {
    if (!profile || profile.role === "ADMIN" || profile.id === me?.id || profile.role === roleDraft) return;
    const confirmed = window.confirm(t("Рөлді өзгерту пайдаланушының қолжетімділігін өзгертеді. Жалғастырасыз ба?|Смена роли изменит доступ пользователя. Продолжить?|Changing this role will change the user's access. Continue?"));
    if (!confirmed) return;
    setBusy(true);
    setErr("");
    setRoleSaved(false);
    try {
      await updateUserRole(profile.id, roleDraft);
      await load();
      setRoleSaved(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-mute">{t("Жүктелуде...|Загрузка...|Loading...")}</p>;
  if (!profile || !draft) return <div className="grid gap-3"><p role="alert" className="text-red-500">{err}</p><Link className="btn btn-s w-fit" href="/admin/users">{t("Тізімге оралу|К списку|Back to list")}</Link></div>;

  const field = (key: keyof ProfileDetails, label: string, props: { multiline?: boolean } = {}) => (
    <label className="grid gap-1 text-sm font-semibold" key={key}>
      {t(label)}
      {props.multiline
        ? <textarea className="inp" rows={4} value={draft[key]} onChange={(e) => set(key, e.target.value)} />
        : <input className="inp" value={draft[key]} onChange={(e) => set(key, e.target.value)} />}
    </label>
  );

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Link href="/admin/users" className="text-sm text-mute underline">‹ {t("Пайдаланушылар тізімі|Список пользователей|Users")}</Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{profile.name || t("Профиль|Профиль|Profile")}</h1><p className="mt-1 text-sm text-mute">{profile.email}</p></div>
        <span className={`chip ${profile.archived_at || profile.banned ? "c-b" : "c-ok"}`}>
          {profile.archived_at ? t("Мұрағатта|В архиве|Archived") : profile.banned ? t("Бұғатталған|Заблокирован|Blocked") : t("Белсенді|Активен|Active")}
        </span>
      </header>

      <section className="card grid gap-4 p-5">
        <h2 className="font-bold">{t("Аккаунт ақпараты|Данные аккаунта|Account details")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1 text-sm"><span className="font-semibold">{t("Email (тек оқу)|Email (только чтение)|Email (read only)")}</span><input className="inp opacity-70" value={profile.email} readOnly /></div>
          <div className="grid gap-2 text-sm">
            <label htmlFor="account-role" className="font-semibold">{t("Рөлі|Роль|Role")}</label>
            {profile.role === "ADMIN" ? <input className="inp opacity-70" value={t(roleLabel[profile.role])} readOnly /> : <>
              <select id="account-role" className="inp" value={roleDraft} onChange={(e) => { setRoleDraft(e.target.value as Exclude<Role, "ADMIN">); setRoleSaved(false); }} disabled={busy || profile.id === me?.id || Boolean(profile.archived_at)}>
                <option value="CANDIDATE">{t(roleLabel.CANDIDATE)}</option>
                <option value="EMPLOYER">{t(roleLabel.EMPLOYER)}</option>
              </select>
              {profile.id === me?.id && <span className="text-xs text-mute">{t("Өз рөліңізді өзгерте алмайсыз.|Свою роль изменить нельзя.|You cannot change your own role.")}</span>}
              {roleDraft === "EMPLOYER" && <span className="text-xs text-mute">{t("Жұмыс беруші рөлін алғаннан кейін компания профилін толтырып, әкімші растауын алу қажет. Расталғанша вакансия жариялау жабық болады.|После назначения роли работодателя нужно заполнить профиль компании и пройти проверку администратора. До подтверждения публикация вакансий закрыта.|After this role is assigned, the user must complete the company profile and pass admin verification before posting vacancies.")}</span>}
              {profile.role !== roleDraft && <button type="button" className="btn btn-s w-fit" onClick={() => void changeRole()} disabled={busy || profile.id === me?.id || Boolean(profile.archived_at)}>{t("Рөлді өзгерту|Изменить роль|Change role")}</button>}
              {roleSaved && <span role="status" className="text-xs text-brand">{t("Рөл өзгертілді.|Роль обновлена.|Role updated.")}</span>}
            </>}
          </div>
          {field("name", "Аты-жөні|Имя и фамилия|Full name")}
          {field("phone", "Телефон|Телефон|Phone")}
          {field("city", "Қала|Город|City")}
        </div>
        {profile.role === "EMPLOYER" && <>
          <hr className="border-line" />
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{t("Компания ақпараты|Данные компании|Company details")}</h2><span className={`chip ${profile.verified ? "c-ok" : "c-w"}`}>{profile.verified ? t("Расталған|Подтверждена|Verified") : t("Растауды күтуде|Ожидает проверки|Verification required")}</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("companyName", "Компания атауы|Название компании|Company name")}
            {field("bin", "БИН|БИН|Business ID (BIN)")}
            {field("contactPhone", "Компания телефоны|Телефон компании|Company phone")}
            {field("companyAbout", "Компания туралы|О компании|About company", { multiline: true })}
          </div>
          {!profile.verified && <p className="text-xs text-mute">{t("Компания атауын немесе БИН-ін өзгерту тексеруді қайта бастайды.|Изменение названия компании или БИН запускает проверку заново.|Changing the company name or BIN requires verification again.")}</p>}
        </>}
        {profile.archived_at && <div className="rounded-xl bg-soft p-3 text-sm"><b>{t("Мұрағаттау себебі|Причина архивации|Archive reason")}:</b> {profile.archive_reason || "—"}<span className="block mt-1 text-xs text-mute">{new Date(profile.archived_at).toLocaleString()}</span></div>}
        {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
        {saved && <p role="status" className="text-sm text-brand">{t("Өзгерістер сақталды.|Изменения сохранены.|Changes saved.")}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Link href="/admin/users" className="btn btn-s">{t("Артқа|Назад|Back")}</Link>
          <button type="button" className="btn btn-p" disabled={busy || Boolean(profile.archived_at)} onClick={() => void save()}>{busy ? t("Сақталуда...|Сохранение...|Saving...") : t("Өзгерістерді сақтау|Сохранить изменения|Save changes")}</button>
        </div>
      </section>
      <p className="text-xs text-mute">{t("Аккаунт ID|ID аккаунта|Account ID")}: {profile.id} · {t("Тіркелген|Создан|Created")}: {new Date(profile.created_at).toLocaleDateString()}</p>
    </div>
  );
}
