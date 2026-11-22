"use client";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth, checkPassword, pwOk, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { setRole, setBanned, deleteUser, updateProfileName, setUserPassword } from "@/lib/admin";

type Row = { id: string; name: string; email: string; role: Role; banned: boolean; created_at: string };
const ROLES: Role[] = ["CANDIDATE", "EMPLOYER", "ADMIN"];
const ROLE_LABELS: Record<Role, string> = {
  CANDIDATE: "Кандидат|Кандидат|Candidate",
  EMPLOYER: "Жұмыс беруші|Работодатель|Employer",
  ADMIN: "Әкімші|Администратор|Admin",
};

// Messages for the error codes returned by /api/admin/set-password.
const PW_ERRORS: Record<string, string> = {
  bad_request: "Құпиясөз талаптарға сай емес|Пароль не соответствует правилам|Password does not meet the rules",
  unauthorized: "Жүйеге қайта кіріңіз|Войдите в систему снова|Sign in again",
  forbidden: "Құпиясөзді тек әкімші өзгерте алады|Пароль может менять только администратор|Only an administrator can change passwords",
  self: "Өз құпиясөзіңізді профильден өзгертіңіз|Свой пароль меняйте в профиле|Change your own password in your profile",
  not_found: "Пайдаланушы табылмады|Пользователь не найден|User not found",
  target_admin: "Әкімшінің құпиясөзін осы жерден өзгерту мүмкін емес|Пароль администратора здесь изменить нельзя|Administrator passwords cannot be changed here",
  no_service_key: "Сервер баптауында SUPABASE_SERVICE_ROLE_KEY жоқ|На сервере не задан SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_KEY is not set on the server",
  failed: "Құпиясөз өзгертілмеді|Пароль не изменён|Password was not changed",
};

const RULES: { key: keyof ReturnType<typeof checkPassword>; label: string }[] = [
  { key: "len", label: "Кемінде 6 таңба|Минимум 6 символов|At least 6 characters" },
  { key: "letter", label: "Әріп|Буква|A letter" },
  { key: "digit", label: "Сан|Цифра|A digit" },
  { key: "symbol", label: "Арнайы таңба (!@#…)|Спецсимвол (!@#…)|A special symbol (!@#…)" },
];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pwFor, setPwFor] = useState<string | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [pwShow, setPwShow] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const rules = checkPassword(pwValue);
  const pwReady = pwOk(pwValue);

  const load = useCallback(async () => {
    const { data, error } = await supabase()
      .from("profiles")
      .select("id, name, email, role, banned, created_at")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  async function run(id: string, fn: () => Promise<void>) {
    setErr(null);
    setBusy(id);
    try {
      await fn();
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function openPw(id: string) {
    setPwFor(id);
    setPwValue("");
    setPwShow(false);
    setPwMsg(null);
  }

  async function savePw(id: string) {
    setPwMsg(null);
    setBusy(id);
    try {
      await setUserPassword(id, pwValue);
      setPwValue("");
      setPwMsg({ ok: true, text: t("Құпиясөз жаңартылды. Пайдаланушы жаңа құпиясөзбен кіреді.|Пароль обновлён. Пользователь входит с новым паролем.|Password updated. The user signs in with the new password.") });
    } catch (e) {
      const code = (e as Error).message;
      setPwMsg({ ok: false, text: t(PW_ERRORS[code] ?? PW_ERRORS.failed) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">{t("Пайдаланушылар|Пользователи|Users")} ({rows.length})</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Аты немесе email бойынша іздеу|Поиск по имени или email|Search by name or email")}
          className="w-64 rounded-xl border border-line bg-bg px-4 py-2 text-ink outline-none focus:border-brand"
        />
      </div>

      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">{t("Аты|Имя|Name")}</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">{t("Рөлі|Роль|Role")}</th>
              <th className="px-4 py-3">{t("Күйі|Статус|Status")}</th>
              <th className="px-4 py-3">{t("Әрекет|Действия|Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isMe = r.id === me?.id;
              const isAdminRow = r.role === "ADMIN";
              return (
                <Fragment key={r.id}>
                  <tr className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink">
                      <div className="flex min-w-56 gap-2">
                        <input value={nameDrafts[r.id] ?? r.name ?? ""} onChange={(e) => setNameDrafts({ ...nameDrafts, [r.id]: e.target.value })} aria-label={t("Пайдаланушы аты|Имя пользователя|User name")} className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-2 py-1 text-ink" />
                        <button disabled={isMe || busy === r.id || (nameDrafts[r.id] ?? r.name) === r.name} onClick={() => run(r.id, () => updateProfileName(r.id, nameDrafts[r.id] ?? r.name))} className="rounded-lg border border-line px-2 py-1 text-xs text-ink hover:bg-soft disabled:opacity-40">{t("Атын сақтау|Сохранить имя|Save name")}</button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-mute">{r.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.role}
                        disabled={isMe || busy === r.id}
                        onChange={(e) => run(r.id, () => setRole(r.id, e.target.value as Role))}
                        className="rounded-lg border border-line bg-bg px-2 py-1 text-ink"
                      >
                        {ROLES.map((x) => (
                          <option key={x} value={x}>{t(ROLE_LABELS[x])}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={r.banned ? "text-red-500" : "text-brand"}>
                        {r.banned ? t("Бұғатталған|Заблокирован|Blocked") : t("Белсенді|Активен|Active")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={isMe || busy === r.id}
                          onClick={() => run(r.id, () => setBanned(r.id, !r.banned))}
                          className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40"
                        >
                          {r.banned ? t("Бұғаттан шығару|Разблокировать|Unblock") : t("Бұғаттау|Заблокировать|Block")}
                        </button>
                        <button
                          disabled={isMe || isAdminRow || busy === r.id}
                          onClick={() => (pwFor === r.id ? setPwFor(null) : openPw(r.id))}
                          className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40"
                        >
                          {t("Құпиясөз|Пароль|Password")}
                        </button>
                        <button
                          disabled={isMe || busy === r.id}
                          onClick={() => {
                            if (confirm(t("Аккаунтты толық өшіресіз бе?|Удалить аккаунт полностью?|Delete this account permanently?")))
                              run(r.id, () => deleteUser(r.id));
                          }}
                          className="rounded-lg bg-red-500/10 px-3 py-1 text-red-500 disabled:opacity-40"
                        >
                          {t("Өшіру|Удалить|Delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {pwFor === r.id && (
                    <tr className="border-b border-line bg-soft/40 last:border-0">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid max-w-xl gap-3">
                          <p className="text-sm text-mute">
                            {t("Жаңа құпиясөз орнатыңыз. Ескі құпиясөз көрсетілмейді: ол қорғалған түрде сақталады, оны ешкім оқи алмайды.|Установите новый пароль. Старый не показывается: он хранится в зашифрованном виде, его не может прочитать никто.|Set a new password. The old one cannot be shown: it is stored encrypted and nobody can read it.")}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type={pwShow ? "text" : "password"}
                              value={pwValue}
                              onChange={(e) => { setPwValue(e.target.value); setPwMsg(null); }}
                              placeholder={t("Жаңа құпиясөз|Новый пароль|New password")}
                              autoComplete="new-password"
                              className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-ink"
                            />
                            <label className="flex items-center gap-2 text-sm text-mute">
                              <input type="checkbox" checked={pwShow} onChange={(e) => setPwShow(e.target.checked)} />
                              {t("Көрсету|Показать|Show")}
                            </label>
                          </div>
                          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            {RULES.map((rule) => (
                              <li key={rule.key} className={rules[rule.key] ? "text-brand" : "text-mute"}>
                                {rules[rule.key] ? "✓ " : "• "}{t(rule.label)}
                              </li>
                            ))}
                          </ul>
                          {pwMsg && <p className={pwMsg.ok ? "text-sm text-brand" : "text-sm text-red-500"}>{pwMsg.text}</p>}
                          <div className="flex gap-2">
                            <button disabled={!pwReady || busy === r.id} onClick={() => savePw(r.id)} className="btn btn-p">
                              {t("Құпиясөзді сақтау|Сохранить пароль|Save password")}
                            </button>
                            <button onClick={() => setPwFor(null)} className="btn btn-s">{t("Жабу|Закрыть|Close")}</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
