"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { setRole, setBanned, deleteUser, updateProfileName } from "@/lib/admin";

type Row = { id: string; name: string; email: string; role: Role; banned: boolean; created_at: string };
const ROLES: Role[] = ["CANDIDATE", "EMPLOYER", "ADMIN"];
const ROLE_LABELS: Record<Role, string> = {
  CANDIDATE: "Кандидат|Кандидат|Candidate",
  EMPLOYER: "Жұмыс беруші|Работодатель|Employer",
  ADMIN: "Әкімші|Администратор|Admin",
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
              return (
                <tr key={r.id} className="border-b border-line last:border-0">
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
                    <div className="flex gap-2">
                      <button
                        disabled={isMe || busy === r.id}
                        onClick={() => run(r.id, () => setBanned(r.id, !r.banned))}
                        className="rounded-lg border border-line px-3 py-1 text-ink hover:bg-soft disabled:opacity-40"
                      >
                        {r.banned ? t("Бұғаттан шығару|Разблокировать|Unblock") : t("Бұғаттау|Заблокировать|Block")}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
