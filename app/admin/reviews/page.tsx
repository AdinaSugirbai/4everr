"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import AdminListToolbar from "@/components/AdminListToolbar";
import AdminLoading from "@/components/AdminLoading";

type R = { id: string; kind: "REVIEW" | "COMPLAINT" | "SUGGESTION"; rating: number | null; body: string; status: "VISIBLE" | "HIDDEN" | "RESOLVED"; created_at: string; profiles: { name: string } | null };
const KINDS = [
  { v: "ALL", l: "Барлығы|Все|All" },
  { v: "REVIEW", l: "Пікірлер|Отзывы|Reviews" },
  { v: "COMPLAINT", l: "Шағымдар|Жалобы|Complaints" },
  { v: "SUGGESTION", l: "Ұсыныстар|Предложения|Suggestions" },
];

export default function AdminReviews() {
  const { t } = useI18n();
  const [rows, setRows] = useState<R[]>([]);
  const [kind, setKind] = useState("ALL");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const load = useCallback(async () => {
    setLoading(true);
    const q = supabase().from("reviews").select("id, kind, rating, body, status, created_at, profiles!user_id(name)").order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) setErr(error.message); else { setErr(null); setRows((data ?? []) as unknown as R[]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setReviewStatus(id: string, status: R["status"]) {
    const { error } = await supabase().from("reviews").update({ status }).eq("id", id);
    setErr(error?.message ?? null); await load();
  }
  async function del(id: string) {
    if (!confirm(t("Өшіресіз бе?|Удалить?|Delete?"))) return;
    const { error } = await supabase().from("reviews").delete().eq("id", id);
    setErr(error?.message ?? null); await load();
  }
  const btn = "rounded-lg border border-line px-3 py-1 text-sm text-ink hover:bg-soft";
  const filteredRows = rows.filter((row) => {
    const authorName = row.profiles?.name ?? "";
    return (kind === "ALL" || row.kind === kind)
      && (status === "ALL" || row.status === status)
      && `${authorName} ${row.body}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }).sort((a, b) => sort === "oldest"
    ? a.created_at.localeCompare(b.created_at)
    : sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0)
    : b.created_at.localeCompare(a.created_at));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("Пікірлер|Отзывы|Reviews & Feedback")} ({rows.length})</h1>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.v} onClick={() => setKind(k.v)} className={`rounded-xl px-3 py-1 text-sm ${kind === k.v ? "bg-brand text-white" : "border border-line text-ink hover:bg-soft"}`}>{t(k.l)}</button>
        ))}
      </div>
      <AdminListToolbar search={query} onSearch={setQuery} placeholder="Пікір, шағым немесе қолданушы аты|Отзыв, жалоба или имя пользователя|Search feedback or account name" sort={sort} onSort={setSort} sortOptions={[{ value: "newest", label: "Жаңадан ескіге|Сначала новые|Newest first" }, { value: "oldest", label: "Ескіден жаңаға|Сначала старые|Oldest first" }, { value: "rating", label: "Баға бойынша|По оценке|By rating" }]} filters={<select className="inp min-w-0" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t("Күй бойынша сүзу|Фильтр по статусу|Filter by status")}><option value="ALL">{t("Барлық күй|Все статусы|All statuses")}</option><option value="VISIBLE">{t("Көрсетіледі|Показываются|Visible")}</option><option value="HIDDEN">{t("Жасырылған|Скрытые|Hidden")}</option><option value="RESOLVED">{t("Шешілген|Решённые|Resolved")}</option></select>} />
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      {loading && <AdminLoading />}
      <div className="space-y-3">
        {filteredRows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-sf p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">{r.profiles?.name ?? "—"} · {r.kind}{r.rating ? ` · ${"★".repeat(r.rating)}` : ""}</span>
              <span className="text-mute">{new Date(r.created_at).toLocaleDateString()} · {r.status}</span>
            </div>
            <p className="mt-2 text-ink">{r.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status !== "RESOLVED" && <button onClick={() => setReviewStatus(r.id, "RESOLVED")} className={btn}>{t("Шешілді|Решено|Resolve")}</button>}
              {r.status === "HIDDEN"
                ? <button onClick={() => setReviewStatus(r.id, "VISIBLE")} className={btn}>{t("Көрсету|Показать|Show")}</button>
                : <button onClick={() => setReviewStatus(r.id, "HIDDEN")} className={btn}>{t("Жасыру|Скрыть|Hide")}</button>}
              <button onClick={() => del(r.id)} className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-500">{t("Өшіру|Удалить|Delete")}</button>
            </div>
          </div>
        ))}
        {filteredRows.length === 0 && !loading && <p className="text-mute">{t("Жазба жоқ|Записей нет|Nothing here yet")}</p>}
      </div>
    </div>
  );
}
