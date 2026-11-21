"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type D = { id: string; name: string; description: string; skills: string; materials: string };

export default function AdminDirections() {
  const { t } = useI18n();
  const [rows, setRows] = useState<D[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase().from("it_directions").select("id, name, description, skills, materials").order("position");
    if (error) setErr(error.message); else setRows((data ?? []) as D[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = (id: string, f: Partial<D>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...f } : x)));
  async function save(d: D) {
    const { error } = await supabase().from("it_directions").update({ name: d.name, description: d.description, skills: d.skills, materials: d.materials }).eq("id", d.id);
    setErr(error?.message ?? null);
  }
  async function add() {
    if (!newName.trim()) return;
    const { error } = await supabase().from("it_directions").insert({ name: newName.trim(), position: rows.length + 1 });
    setErr(error?.message ?? null); setNewName(""); await load();
  }
  async function del(id: string) {
    if (!confirm(t("Бағытты өшіресіз бе?|Удалить направление?|Delete this direction?"))) return;
    const { error } = await supabase().from("it_directions").delete().eq("id", id);
    setErr(error?.message ?? null); await load();
  }
  const inp = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-brand";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">{t("IT бағыттары|IT-направления|IT Directions")}</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
      <div className="flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("Жаңа бағыт аты|Название нового направления|New direction name")} className={inp} />
        <button onClick={add} className="shrink-0 rounded-xl bg-brand px-4 text-white">+</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((d) => (
          <div key={d.id} className="space-y-2 rounded-2xl border border-line bg-sf p-5">
            <input value={d.name} onChange={(e) => patch(d.id, { name: e.target.value })} className={inp + " font-semibold"} />
            <textarea rows={2} value={d.description} onChange={(e) => patch(d.id, { description: e.target.value })} placeholder={t("Сипаттама|Описание|Description")} className={inp} />
            <input value={d.skills} onChange={(e) => patch(d.id, { skills: e.target.value })} placeholder={t("Қажетті дағдылар (үтірмен)|Навыки (через запятую)|Required skills (comma separated)")} className={inp} />
            <textarea rows={2} value={d.materials} onChange={(e) => patch(d.id, { materials: e.target.value })} placeholder={t("Оқу материалдары (сілтемелер)|Учебные материалы (ссылки)|Learning materials (links)")} className={inp} />
            <div className="flex gap-2">
              <button onClick={() => save(d)} className="rounded-lg bg-brand px-3 py-1 text-sm text-white">{t("Сақтау|Сохранить|Save")}</button>
              <button onClick={() => del(d.id)} className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-500">{t("Өшіру|Удалить|Delete")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
