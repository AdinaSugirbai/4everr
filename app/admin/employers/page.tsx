"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { setBanned } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

type E = { id: string; name: string; email: string; banned: boolean; verified: boolean; company_name: string | null; company_logo: string | null; company_about: string | null; contact_phone: string | null };

export default function AdminEmployers() {
  const { t } = useI18n();
  const [rows, setRows] = useState<E[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("profiles")
      .select("id, name, email, banned, verified, company_name, company_logo, company_about, contact_phone")
      .eq("role", "EMPLOYER").order("created_at", { ascending: false });
    if (error) setErr(error.message); else setRows((data ?? []) as E[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function run(id: string, fn: () => PromiseLike<unknown>) {
    setErr(null); setBusy(id);
    try {
      const r = (await fn()) as { error?: { message: string } | null } | undefined;
      if (r?.error) throw new Error(r.error.message);
      await load();
    } catch (e) { setErr((e as Error).message); }
    setBusy(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("Жұмыс берушілер|Работодатели|Employers")} ({rows.length})</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((e) => (
          <div key={e.id} className="space-y-3 rounded-2xl border border-line bg-sf p-5">
            <div className="flex items-center gap-3">
              {e.company_logo
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={e.company_logo} alt="" className="h-12 w-12 rounded-xl border border-line object-cover" />
                : <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white">{(e.company_name || e.name || "?").slice(0, 1)}</div>}
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{e.company_name || e.name}</p>
                <p className="text-xs">
                  <span className={e.verified ? "text-brand" : "text-mute"}>{e.verified ? t("Расталған|Подтверждена|Verified") : t("Расталмаған|Не подтверждена|Unverified")}</span>
                  {e.banned && <span className="ml-2 text-red-500">{t("Бұғатталған|Заблокирована|Blocked")}</span>}
                </p>
              </div>
            </div>
            {e.company_about && <p className="text-sm text-mute">{e.company_about}</p>}
            <p className="text-sm text-ink">{e.email}{e.contact_phone ? ` · ${e.contact_phone}` : ""}</p>
            <div className="flex gap-2">
              <button disabled={busy === e.id} onClick={() => run(e.id, () => supabase().rpc("admin_set_employer_verified", { target: e.id, is_verified: !e.verified }))}
                className="rounded-lg border border-line px-3 py-1 text-sm text-ink hover:bg-soft disabled:opacity-40">
                {e.verified ? t("Растауды алу|Снять подтверждение|Unverify") : t("Растау|Подтвердить|Verify")}
              </button>
              <button disabled={busy === e.id} onClick={() => run(e.id, () => setBanned(e.id, !e.banned))}
                className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-500 disabled:opacity-40">
                {e.banned ? t("Бұғаттан шығару|Разблокировать|Unblock") : t("Бұғаттау|Заблокировать|Block")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
