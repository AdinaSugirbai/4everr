"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase/client";
import { useAuth, checkPassword, pwOk, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { archiveUser, restoreUser, setBanned, setUserPassword } from "@/lib/admin";

type Row = {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned: boolean;
  archived_at: string | null;
  created_at: string;
};
type View = "active" | "archived";

const ROLE_LABELS: Record<Role, string> = {
  CANDIDATE: "Кандидат|Кандидат|Candidate",
  EMPLOYER: "Жұмыс беруші|Работодатель|Employer",
  ADMIN: "Әкімші|Администратор|Admin",
};
const PAGE_SIZE = 25;

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

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("active");
  const [page, setPage] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [archiveFor, setArchiveFor] = useState<Row | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveConfirm, setArchiveConfirm] = useState("");
  const [passwordFor, setPasswordFor] = useState<Row | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [pwShow, setPwShow] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pwReady = pwOk(pwValue);
  const rules = checkPassword(pwValue);

  const load = useCallback(async () => {
    setErr(null);
    let request = supabase()
      .from("profiles")
      .select("id, name, email, role, banned, archived_at, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    request = view === "archived" ? request.not("archived_at", "is", null) : request.is("archived_at", null);
    const search = q.trim().replace(/[(),%_*]/g, " ").replace(/\s+/g, " ");
    if (search) request = request.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error, count: total } = await request;
    if (error) {
      setErr(error.message);
      return;
    }
    setRows((data ?? []) as Row[]);
    setCount(total ?? 0);
  }, [page, q, view]);

  useEffect(() => { void load(); }, [load]);

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const roleName = useMemo(() => (role: Role) => t(ROLE_LABELS[role]), [t]);

  async function run(id: string, fn: () => Promise<unknown>) {
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

  async function submitArchive() {
    if (!archiveFor) return;
    const matches = archiveConfirm.trim().toLowerCase() === archiveFor.name.trim().toLowerCase()
      || archiveConfirm.trim().toLowerCase() === archiveFor.email.trim().toLowerCase();
    if (!matches || archiveReason.trim().length < 8) return;
    const target = archiveFor;
    await run(target.id, async () => {
      await archiveUser(target.id, archiveReason);
      setArchiveFor(null);
      setArchiveReason("");
      setArchiveConfirm("");
    });
  }

  async function submitPassword() {
    if (!passwordFor || !pwReady) return;
    setPwMsg(null);
    setBusy(passwordFor.id);
    try {
      await setUserPassword(passwordFor.id, pwValue);
      setPwValue("");
      setPwMsg({ ok: true, text: t("Құпиясөз жаңартылды.|Пароль обновлён.|Password updated.") });
    } catch (e) {
      const code = (e as Error).message;
      setPwMsg({ ok: false, text: t(PW_ERRORS[code] ?? PW_ERRORS.failed) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("Пайдаланушылар|Пользователи|Users")}</h1>
          <p className="mt-1 text-sm text-mute">{count} · {t("аккаунт|аккаунтов|accounts")}</p>
        </div>
        <label className="w-full max-w-sm">
          <span className="sr-only">{t("Аты немесе email бойынша іздеу|Поиск по имени или email|Search by name or email")}</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            placeholder={t("Аты немесе email бойынша іздеу|Поиск по имени или email|Search by name or email")}
            className="inp"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("Аккаунт күйі|Статус аккаунта|Account status")}>
        <button type="button" role="tab" aria-selected={view === "active"} className={`btn ${view === "active" ? "btn-p" : "btn-s"}`} onClick={() => { setView("active"); setPage(0); }}>
          {t("Белсенді аккаунттар|Активные аккаунты|Active accounts")}
        </button>
        <button type="button" role="tab" aria-selected={view === "archived"} className={`btn ${view === "archived" ? "btn-p" : "btn-s"}`} onClick={() => { setView("archived"); setPage(0); }}>
          {t("Мұрағат|Архив|Archived")}
        </button>
      </div>

      {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-sf">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              <th className="px-4 py-3">{t("Аккаунт|Аккаунт|Account")}</th>
              <th className="px-4 py-3">{t("Рөлі|Роль|Role")}</th>
              <th className="px-4 py-3">{t("Күйі|Статус|Status")}</th>
              <th className="px-4 py-3">{t("Тіркелген|Регистрация|Joined")}</th>
              <th className="px-4 py-3">{t("Әрекет|Действия|Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isMe = r.id === me?.id;
              const isAdmin = r.role === "ADMIN";
              const archived = Boolean(r.archived_at);
              return (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-soft/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${r.id}`} className="block min-w-48 rounded focus-visible:outline-2 focus-visible:outline-brand">
                      <span className="block font-semibold text-ink">{r.name || t("Аты көрсетілмеген|Имя не указано|Name not set")}</span>
                      <span className="block text-xs text-mute">{r.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">{roleName(r.role)}</td>
                  <td className="px-4 py-3">
                    <span className={archived || r.banned ? "chip c-b" : "chip c-ok"}>
                      {archived ? t("Мұрағатта|В архиве|Archived") : r.banned ? t("Бұғатталған|Заблокирован|Blocked") : t("Белсенді|Активен|Active")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mute">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {!archived && <button type="button" disabled={isMe || isAdmin || busy === r.id} onClick={() => void run(r.id, () => setBanned(r.id, !r.banned))} className="btn btn-s">
                        {r.banned ? t("Бұғаттан шығару|Разблокировать|Unblock") : t("Бұғаттау|Заблокировать|Block")}
                      </button>}
                      {!archived && <button type="button" disabled={isMe || isAdmin || busy === r.id} onClick={() => { setPasswordFor(r); setPwValue(""); setPwMsg(null); }} className="btn btn-s">
                        {t("Құпиясөз|Пароль|Password")}
                      </button>}
                      {archived
                        ? <button type="button" disabled={busy === r.id} onClick={() => void run(r.id, () => restoreUser(r.id))} className="btn btn-s">{t("Қалпына келтіру|Восстановить|Restore")}</button>
                        : <button type="button" disabled={isMe || isAdmin || busy === r.id} onClick={() => { setArchiveFor(r); setArchiveReason(""); setArchiveConfirm(""); }} className="btn btn-s text-red-600">{t("Мұрағаттау|Архивировать|Archive")}</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-mute">{t("Аккаунт табылмады.|Аккаунты не найдены.|No accounts found.")}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-mute">{page + 1} / {pageCount}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 0} className="btn btn-s" onClick={() => setPage((p) => Math.max(0, p - 1))}>{t("Артқа|Назад|Previous")}</button>
          <button type="button" disabled={page + 1 >= pageCount} className="btn btn-s" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>{t("Әрі қарай|Далее|Next")}</button>
        </div>
      </div>

      <Modal open={!!archiveFor} onClose={() => setArchiveFor(null)} title={t("Аккаунтты мұрағаттау|Архивировать аккаунт|Archive account")}>
        {archiveFor && <div className="grid gap-3">
          <p className="text-sm text-mute">{t("Бұл аккаунт пен оның өтінімдері сақталады. Қайта қалпына келтіруге болады.|Аккаунт и отклики сохранятся. Его можно будет восстановить.|The account and its applications stay in the database and can be restored.")}</p>
          <label className="grid gap-1 text-sm font-semibold">{t("Себебі (кемінде 8 таңба)|Причина (не менее 8 символов)|Reason (at least 8 characters)")}
            <textarea className="inp" rows={3} value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">{t("Растау үшін аккаунт атын немесе email-ін теріңіз|Для подтверждения введите имя или email аккаунта|Type the account name or email to confirm")}
            <input className="inp" value={archiveConfirm} onChange={(e) => setArchiveConfirm(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-s" onClick={() => setArchiveFor(null)}>{t("Бас тарту|Отмена|Cancel")}</button>
            <button type="button" className="btn btn-p" disabled={busy === archiveFor.id || archiveReason.trim().length < 8 || (archiveConfirm.trim().toLowerCase() !== archiveFor.name.trim().toLowerCase() && archiveConfirm.trim().toLowerCase() !== archiveFor.email.trim().toLowerCase())} onClick={() => void submitArchive()}>{t("Мұрағатқа жіберу|Переместить в архив|Archive account")}</button>
          </div>
        </div>}
      </Modal>

      <Modal open={!!passwordFor} onClose={() => setPasswordFor(null)} title={t("Жаңа құпиясөз орнату|Установить новый пароль|Set a new password")}>
        {passwordFor && <div className="grid gap-3">
          <p className="text-sm text-mute">{passwordFor.name} · {passwordFor.email}</p>
          <p className="text-sm text-mute">{t("Ескі құпиясөз көрсетілмейді. Жаңа құпиясөз пайдаланушыға қауіпсіз арнамен берілуі керек.|Старый пароль нельзя посмотреть. Новый пароль нужно передать пользователю безопасно.|The old password cannot be read. Share the new password with the user through a secure channel.")}</p>
          <div className="flex gap-2"><input type={pwShow ? "text" : "password"} autoComplete="new-password" className="inp" value={pwValue} onChange={(e) => { setPwValue(e.target.value); setPwMsg(null); }} aria-label={t("Жаңа құпиясөз|Новый пароль|New password")} /><label className="flex items-center gap-2 text-sm text-mute"><input type="checkbox" checked={pwShow} onChange={(e) => setPwShow(e.target.checked)} />{t("Көрсету|Показать|Show")}</label></div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">{[
            [rules.len, "Кемінде 6 таңба|Минимум 6 символов|At least 6 characters"],
            [rules.letter, "Әріп|Буква|A letter"],
            [rules.digit, "Сан|Цифра|A number"],
            [rules.symbol, "Арнайы таңба|Спецсимвол|A special symbol"],
          ].map(([ok, label]) => <li key={String(label)} className={ok ? "text-brand" : "text-mute"}>{ok ? "✓ " : "• "}{t(String(label))}</li>)}</ul>
          {pwMsg && <p role={pwMsg.ok ? undefined : "alert"} className={pwMsg.ok ? "text-sm text-brand" : "text-sm text-red-500"}>{pwMsg.text}</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-s" onClick={() => setPasswordFor(null)}>{t("Жабу|Закрыть|Close")}</button><button type="button" disabled={!pwReady || busy === passwordFor.id} className="btn btn-p" onClick={() => void submitPassword()}>{t("Құпиясөзді сақтау|Сохранить пароль|Save password")}</button></div>
        </div>}
      </Modal>
    </div>
  );
}
