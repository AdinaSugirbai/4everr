"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLoading from "@/components/AdminLoading";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type Direction = { id: string; name: string; description: string; position: number };
type Sort = "position" | "name" | "name-desc";

export default function AdminDirections() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Direction[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("position");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase().from("it_directions").select("id, name, description, position").order("position");
    if (error) setErr(error.message); else { setErr(""); setRows((data ?? []) as Direction[]); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return rows.filter((row) => `${row.name} ${row.description}`.toLocaleLowerCase().includes(term)
      && (filter === "ALL" || (filter === "HAS_DESCRIPTION" ? Boolean(row.description.trim()) : !row.description.trim()))).sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      return a.position - b.position;
    });
  }, [rows, query, sort, filter]);

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-ink">{t("IT бағыттары|IT-направления|IT directions")} ({rows.length})</h1><p className="mt-1 text-sm text-mute">{t("Өңдеу үшін бағытты ашыңыз.|Откройте направление, чтобы изменить его.|Open a direction to edit it.")}</p></div><Link href="/admin/directions/new" className="btn btn-p">{t("Бағыт қосу|Добавить направление|Add direction")}</Link></header>
      <div className="grid gap-2 sm:grid-cols-[1fr_200px_200px]"><input className="inp" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Бағыттан іздеу|Поиск направлений|Search directions")} /><select className="inp" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={t("Сипаттама бойынша сүзу|Фильтр по описанию|Filter by description")}><option value="ALL">{t("Барлығы|Все|All")}</option><option value="HAS_DESCRIPTION">{t("Сипаттамасы бар|С описанием|Has description")}</option><option value="NO_DESCRIPTION">{t("Сипаттамасы жоқ|Без описания|No description")}</option></select><select className="inp" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label={t("Сұрыптау|Сортировка|Sort")}><option value="position">{t("Бастапқы рет|Исходный порядок|Original order")}</option><option value="name">{t("Атауы A–Я|Название А–Я|Name A–Z")}</option><option value="name-desc">{t("Атауы Я–А|Название Я–А|Name Z–A")}</option></select></div>
      {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      {loading ? <AdminLoading /> : <div className="grid gap-2">
        {visible.map((row) => <Link href={`/admin/directions/${row.id}`} key={row.id} className="rounded-2xl border border-line bg-sf p-4 transition hover:border-brand hover:bg-soft"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><h2 className="font-semibold text-ink">{row.name}</h2><p className="mt-1 line-clamp-2 text-sm text-mute">{row.description || "—"}</p></div><span className="text-mute" aria-hidden="true">›</span></div></Link>)}
        {visible.length === 0 && <p className="rounded-2xl border border-line bg-sf p-6 text-center text-mute">{t("Бағыт табылмады.|Направления не найдены.|No directions found.")}</p>}
      </div>}
    </div>
  );
}
