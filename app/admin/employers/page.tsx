"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { adminReviewEmployer, setBanned } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

type Employer = {
  id: string; name: string; email: string; banned: boolean; verified: boolean;
  company_name: string | null; company_logo: string | null; company_about: string | null;
  contact_phone: string | null; bin: string | null; city: string | null;
  company_industry: string | null; company_website: string | null;
  verification_requested_at: string | null; verification_reference: string | null;
  verification_notes: string | null;
};

export default function AdminEmployers() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Employer[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [references, setReferences] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [verificationSchemaReady, setVerificationSchemaReady] = useState(true);

  const load = useCallback(async () => {
    setErr("");
    const client = supabase();
    const { data, error } = await client.from("profiles")
      .select("id, name, email, banned, verified, company_name, company_logo, company_about, contact_phone, bin, city, company_industry, company_website, verification_requested_at, verification_reference, verification_notes")
      .eq("role", "EMPLOYER").order("verification_requested_at", { ascending: false, nullsFirst: false });
    if (!error) {
      setVerificationSchemaReady(true);
      setRows((data ?? []) as Employer[]);
      return;
    }

    // Older Supabase projects may have the employer records but not the review columns yet.
    if (error.code === "42703" || error.code === "PGRST204") {
      const fallback = await client.from("profiles")
        .select("id, name, email, banned, created_at")
        .eq("role", "EMPLOYER").order("created_at", { ascending: false });
      if (!fallback.error) {
        setVerificationSchemaReady(false);
        setRows((fallback.data ?? []).map((row) => ({
          ...row, verified: false, company_name: null, company_logo: null, company_about: null,
          contact_phone: null, bin: null, city: null, company_industry: null, company_website: null,
          verification_requested_at: null, verification_reference: null, verification_notes: null,
        })) as Employer[]);
        return;
      }
      setErr(fallback.error.message);
      return;
    }
    setErr(error.message);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function run(id: string, task: () => Promise<unknown>) {
    setBusy(id);
    setErr("");
    try { await task(); await load(); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(null); }
  }

  function review(e: Employer, approve: boolean) {
    const proof = references[e.id]?.trim() ?? "";
    const note = notes[e.id]?.trim() ?? "";
    if ((approve && proof.length < 5) || (!approve && note.length < 8)) {
      setErr(t(approve
        ? "Ресми тексеру дереккөзін енгізіңіз (кемінде 5 таңба).|Укажите источник проверки (не менее 5 символов).|Enter the verification source (at least 5 characters)."
        : "Бас тарту себебін енгізіңіз (кемінде 8 таңба).|Укажите причину отказа (не менее 8 символов).|Enter a reason for rejection (at least 8 characters)."));
      return;
    }
    void run(e.id, () => adminReviewEmployer(e.id, approve, proof, note));
  }

  const requested = rows.filter((e) => e.verification_requested_at && !e.verified).length;

  return (
    <div className="grid gap-4">
      <header><h1 className="text-2xl font-bold text-ink">{t("Жұмыс берушілер|Работодатели|Employers")} ({rows.length})</h1><p className="mt-1 text-sm text-mute">{t("Тексеруді күтіп тұрғаны|Ожидают проверки|Awaiting review")}: {requested}</p></header>
      {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      {!verificationSchemaReady && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-ink">{t("Жұмыс берушілер тізімі көрсетілді. Растау деректері мен әрекеттері үшін Supabase миграцияларын атауы бойынша ретімен орындаңыз.|Список работодателей показан. Чтобы включить проверку компаний и действия, примените миграции Supabase по порядку.|The employer list is available. Apply the Supabase migrations in filename order to enable verification details and actions.")}</p>}
      <div className="grid gap-4">
        {rows.map((e) => {
          const reviewPending = Boolean(e.verification_requested_at && !e.verified);
          return <article key={e.id} className="card grid gap-3 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {e.company_logo ? <img src={e.company_logo} alt="" className="h-12 w-12 rounded-xl border border-line object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-soft font-bold text-brand">{(e.company_name || e.name || "?").slice(0, 1)}</div>}
                <div className="min-w-0"><Link href={`/admin/users/${e.id}`} className="font-semibold text-ink underline decoration-line underline-offset-4">{e.company_name || e.name}</Link><p className="truncate text-xs text-mute">{e.email}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`chip ${e.verified ? "c-ok" : reviewPending ? "c-w" : "c-b"}`}>{e.verified ? t("Расталған|Подтверждена|Verified") : reviewPending ? t("Тексерілуде|На проверке|Under review") : t("Расталмаған|Не подтверждена|Unverified")}</span>
                {e.banned && <span className="chip c-b">{t("Бұғатталған|Заблокирована|Blocked")}</span>}
              </div>
            </header>
            <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <p><span className="text-mute">{t("БИН|БИН|BIN")}:</span> {e.bin || "—"}</p>
              <p><span className="text-mute">{t("Сала|Сфера|Industry")}:</span> {e.company_industry || "—"}</p>
              <p><span className="text-mute">{t("Қала|Город|City")}:</span> {e.city || "—"}</p>
              <p><span className="text-mute">{t("Сайт|Сайт|Website")}:</span> {e.company_website || "—"}</p>
              <p><span className="text-mute">{t("Телефон|Телефон|Phone")}:</span> {e.contact_phone || "—"}</p>
              <p><span className="text-mute">{t("Өтінім күні|Дата заявки|Request date")}:</span> {e.verification_requested_at ? new Date(e.verification_requested_at).toLocaleString() : "—"}</p>
            </div>
            {e.company_about && <p className="whitespace-pre-line text-sm text-mute">{e.company_about}</p>}
            {e.verification_reference && <p className="text-xs text-mute">{t("Соңғы тексеру дереккөзі|Источник последней проверки|Last review source")}: {e.verification_reference}</p>}
            {verificationSchemaReady && reviewPending && <section className="grid gap-3 rounded-xl bg-soft/60 p-4">
              <h2 className="font-semibold">{t("Компанияны ресми дереккөзбен салыстырып тексеріңіз|Сверьте компанию с официальным источником|Check the company against an official source")}</h2>
              <label className="grid gap-1 text-sm font-semibold">{t("Тексерілген дереккөз немесе сілтеме|Проверенный источник или ссылка|Verified source or reference")}<input className="inp" value={references[e.id] ?? ""} onChange={(ev) => setReferences((v) => ({ ...v, [e.id]: ev.target.value }))} placeholder="https://…" /></label>
              <label className="grid gap-1 text-sm font-semibold">{t("Ескерту|Заметка|Review note")}<textarea className="inp" rows={2} value={notes[e.id] ?? ""} onChange={(ev) => setNotes((v) => ({ ...v, [e.id]: ev.target.value }))} /></label>
              <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-p" disabled={busy === e.id || (references[e.id]?.trim().length ?? 0) < 5} onClick={() => review(e, true)}>{t("Растау|Подтвердить|Approve")}</button><button type="button" className="btn btn-s text-red-600" disabled={busy === e.id || (notes[e.id]?.trim().length ?? 0) < 8} onClick={() => review(e, false)}>{t("Бас тарту|Отказать|Reject")}</button></div>
            </section>}
            {e.verification_notes && <p className="rounded-lg bg-soft p-3 text-sm">{t("Әкімші ескертпесі|Комментарий администратора|Admin note")}: {e.verification_notes}</p>}
            <footer className="flex flex-wrap gap-2 border-t border-line pt-3">
              <Link href={`/admin/users/${e.id}`} className="btn btn-s">{t("Профильді ашу|Открыть профиль|Open profile")}</Link>
              <button type="button" className="btn btn-s" disabled={busy === e.id} onClick={() => void run(e.id, () => setBanned(e.id, !e.banned))}>{e.banned ? t("Бұғаттан шығару|Разблокировать|Unblock") : t("Бұғаттау|Заблокировать|Block")}</button>
            </footer>
          </article>;
        })}
        {rows.length === 0 && !err && <p className="text-mute">{t("Жұмыс берушілер жоқ.|Работодателей нет.|No employers found.")}</p>}
      </div>
    </div>
  );
}
