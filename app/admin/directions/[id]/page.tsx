"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLoading from "@/components/AdminLoading";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

type Direction = { id: string; name: string; description: string; skills: string; materials: string; position: number };
const empty = (id: string): Direction => ({ id, name: "", description: "", skills: "", materials: "", position: 0 });

export default function AdminDirectionDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const isNew = id === "new";
  const [direction, setDirection] = useState<Direction>(() => empty(id));
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isNew) { setDirection(empty("")); return; }
    let active = true;
    setLoading(true);
    supabase().from("it_directions").select("id, name, description, skills, materials, position").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setErr(error.message);
      else if (!data) setErr(t("Бағыт табылмады.|Направление не найдено.|Direction not found."));
      else setDirection({
        id: String(data.id), name: String(data.name ?? ""), description: String(data.description ?? ""),
        skills: String(data.skills ?? ""), materials: String(data.materials ?? ""), position: Number(data.position ?? 0),
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [id, isNew, t]);

  async function save() {
    if (direction.name.trim().length < 2) { setErr(t("Атауын кемінде екі таңбамен енгізіңіз.|Введите название минимум из двух символов.|Enter a name with at least two characters.")); return; }
    setBusy(true); setErr(""); setNotice("");
    try {
      const db = supabase();
      if (isNew) {
        const { data: last } = await db.from("it_directions").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
        const { error } = await db.from("it_directions").insert({ name: direction.name.trim(), description: direction.description.trim(), skills: direction.skills.trim(), materials: direction.materials.trim(), position: Number(last?.position ?? 0) + 1 });
        if (error) throw error;
      } else {
        const { error } = await db.from("it_directions").update({ name: direction.name.trim(), description: direction.description.trim(), skills: direction.skills.trim(), materials: direction.materials.trim() }).eq("id", id);
        if (error) throw error;
      }
      router.push("/admin/directions");
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (isNew || !window.confirm(t("Бұл бағытты өшіресіз бе?|Удалить это направление?|Delete this direction?"))) return;
    setBusy(true); setErr("");
    const { error } = await supabase().from("it_directions").delete().eq("id", id);
    setBusy(false);
    if (error) setErr(error.message); else router.push("/admin/directions");
  }

  if (loading) return <AdminLoading />;
  const input = "inp w-full";
  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <Link href="/admin/directions" className="text-sm text-mute underline">‹ {t("IT бағыттары тізіміне оралу|Вернуться к списку IT-направлений|Back to IT directions")}</Link>
      <header><h1 className="text-2xl font-bold text-ink">{t(isNew ? "Жаңа IT бағыты|Новое IT-направление|New IT direction" : "IT бағытын өңдеу|Редактировать IT-направление|Edit IT direction")}</h1></header>
      <section className="card grid gap-4 p-5">
        <label className="grid gap-1 text-sm font-semibold">{t("Атауы|Название|Name")}<input className={input} value={direction.name} onChange={(e) => setDirection((d) => ({ ...d, name: e.target.value }))} /></label>
        <label className="grid gap-1 text-sm font-semibold">{t("Сипаттама|Описание|Description")}<textarea className={input} rows={4} value={direction.description} onChange={(e) => setDirection((d) => ({ ...d, description: e.target.value }))} /></label>
        <label className="grid gap-1 text-sm font-semibold">{t("Қажетті дағдылар (үтірмен)|Навыки (через запятую)|Required skills (comma separated)")}<textarea className={input} rows={3} value={direction.skills} onChange={(e) => setDirection((d) => ({ ...d, skills: e.target.value }))} /></label>
        <label className="grid gap-1 text-sm font-semibold">{t("Оқу материалдары (сілтемелер)|Учебные материалы (ссылки)|Learning materials (links)")}<textarea className={input} rows={4} value={direction.materials} onChange={(e) => setDirection((d) => ({ ...d, materials: e.target.value }))} /></label>
        {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
        {notice && <p role="status" className="text-sm text-brand">{notice}</p>}
        <footer className="flex flex-wrap justify-between gap-2"><button type="button" className="btn btn-s text-red-600" disabled={busy || isNew} onClick={() => void remove()}>{t("Бағытты өшіру|Удалить направление|Delete direction")}</button><div className="flex gap-2"><Link href="/admin/directions" className="btn btn-s">{t("Бас тарту|Отмена|Cancel")}</Link><button type="button" className="btn btn-p" disabled={busy} onClick={() => void save()}>{t("Сақтау|Сохранить|Save")}</button></div></footer>
      </section>
    </div>
  );
}
