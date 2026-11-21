"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { seedJobs } from "@/lib/jobs";
import { sections } from "@/lib/sections";

type Translation = { source: string; kk: string; ru: string; en: string };
const EMPTY: Translation = { source: "", kk: "", ru: "", en: "" };
const SUGGESTED_SOURCES = Array.from(new Set([
  "Вакансиялар|Вакансии|Jobs",
  "Кабинет|Кабинет|Dashboard",
  "Іздеу|Поиск|Search",
  ...seedJobs.flatMap((job) => [job.title, job.desc, job.city, ...job.reqs]),
  ...sections.flatMap((section) => [section.title, section.desc]),
]));

export default function AdminContent() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Translation[]>([]);
  const [draft, setDraft] = useState<Translation>(EMPTY);
  const [query, setQuery] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("site_translations").select("source, kk, ru, en").order("source");
    if (error) setErr(error.message);
    else setRows((data ?? []) as Translation[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(row: Translation) {
    if (!row.source.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supabase().from("site_translations").upsert({ ...row, source: row.source.trim(), updated_at: new Date().toISOString() }, { onConflict: "source" });
      if (error) setErr(error.message);
      else {
        setDraft(EMPTY);
        window.dispatchEvent(new Event("site-translations-updated"));
        await load();
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(source: string) {
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supabase().from("site_translations").delete().eq("source", source);
      if (error) setErr(error.message);
      else {
        window.dispatchEvent(new Event("site-translations-updated"));
        await load();
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const shown = rows.filter((row) => `${row.source} ${row.kk} ${row.ru} ${row.en}`.toLowerCase().includes(query.toLowerCase()));
  const field = "inp w-full";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("Сайт мәтіндері|Тексты сайта|Site text")}</h1>
        <p className="mt-1 text-sm text-mute">{t("Мәтіннің бастапқы кілтін өзгеріссіз қалдырып, үш тілдегі көрсетілімін өңдеңіз.|Оставьте исходный ключ без изменений и редактируйте текст на трёх языках.|Keep the source key unchanged and edit its text in all three languages.")}</p>
      </div>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <section className="card grid gap-3 p-5">
        <h2 className="font-bold">{t("Жаңа мәтін қосу|Добавить текст|Add text")}</h2>
        <label className="grid gap-1 text-sm">{t("Бастапқы кілт (беттегі мәтін)|Исходный ключ (текст на странице)|Source key (text on the page)")}
          <input className={field} list="site-content-source-options" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder="Қазақша мәтін|Текст по-русски|Text in English" />
          <datalist id="site-content-source-options">{SUGGESTED_SOURCES.map((source) => <option key={source} value={source} />)}</datalist>
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          {(["kk", "ru", "en"] as const).map((lang) => <label key={lang} className="grid gap-1 text-sm">{lang.toUpperCase()}<textarea className={field} rows={2} value={draft[lang]} onChange={(e) => setDraft({ ...draft, [lang]: e.target.value })} /></label>)}
        </div>
        <button className="btn btn-p w-fit" disabled={busy || !draft.source.trim()} onClick={() => save(draft)}>{t("Сақтау|Сохранить|Save")}</button>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">{t("Өңделетін мәтіндер|Тексты для редактирования|Editable text")}: {rows.length}</h2>
        <input className="inp w-full sm:w-72" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Мәтін бойынша іздеу|Поиск по тексту|Search text")} />
      </div>
      <div className="grid gap-4">
        {shown.map((row) => <TranslationEditor key={row.source} row={row} busy={busy} save={save} remove={remove} t={t} />)}
        {!shown.length && !err && <p className="card p-5 text-mute">{t("Мәтін әзірге қосылмаған.|Пока нет добавленных текстов.|No text has been added yet.")}</p>}
      </div>
    </div>
  );
}

function TranslationEditor({ row, busy, save, remove, t }: { row: Translation; busy: boolean; save: (row: Translation) => Promise<void>; remove: (source: string) => Promise<void>; t: (value: string) => string }) {
  const [draft, setDraft] = useState(row);
  const field = "inp w-full";
  return (
    <section className="card grid gap-3 p-5">
      <label className="grid gap-1 text-sm font-medium text-ink">{t("Бастапқы кілт|Исходный ключ|Source key")}
        <textarea className={field} rows={2} value={draft.source} readOnly />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        {(["kk", "ru", "en"] as const).map((lang) => <label key={lang} className="grid gap-1 text-sm">{lang.toUpperCase()}<textarea className={field} rows={2} value={draft[lang]} onChange={(e) => setDraft({ ...draft, [lang]: e.target.value })} /></label>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-p" disabled={busy} onClick={() => save(draft)}>{t("Өзгерісті сақтау|Сохранить изменения|Save changes")}</button>
        <button className="btn btn-s" disabled={busy} onClick={() => remove(row.source)}>{t("Өшіру|Удалить|Delete")}</button>
      </div>
    </section>
  );
}
