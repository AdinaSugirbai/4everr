"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Vacancy = {
  id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  level: string;
  status: "ACTIVE" | "PAUSED";
  created_at: string;
  expires_at: string | null;
};

const LEVELS = ["Тағылымдама", "Junior", "Middle", "Senior"];
const FORMATS = [
  { v: "office", l: "Офис" },
  { v: "hybrid", l: "Гибрид" },
  { v: "remote", l: "Қашықтан" },
];
const empty = {
  title: "",
  company: "",
  city: "",
  format: "office",
  salary: "",
  level: "Junior",
  tags: "",
  description: "",
  expires_at: "",
};

export default function EmployerVacancies() {
  const [form, setForm] = useState(empty);
  const [rows, setRows] = useState<Vacancy[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data: u } = await supabase().auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase()
      .from("vacancies")
      .select("id, title, company, city, salary, level, status, created_at, expires_at")
      .eq("employer_id", u.user.id)
      .order("created_at", { ascending: false });
    if (error) setMsg({ ok: false, text: error.message });
    else setRows((data ?? []) as Vacancy[]);
  }, []);

  useEffect(() => {
    load();
    (async () => {
      const { data: u } = await supabase().auth.getUser();
      if (!u.user) return;
      const { data } = await supabase()
        .from("profiles")
        .select("company_name")
        .eq("id", u.user.id)
        .single();
      if (data?.company_name) setForm((f) => ({ ...f, company: f.company || data.company_name }));
    })();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim()) {
      setMsg({ ok: false, text: "Вакансия атауын жазыңыз" });
      return;
    }
    setBusy(true);
    const { data: u } = await supabase().auth.getUser();
    if (!u.user) {
      setBusy(false);
      setMsg({ ok: false, text: "Алдымен жүйеге кіріңіз" });
      return;
    }
    const { error } = await supabase().from("vacancies").insert({
      employer_id: u.user.id,
      title: form.title.trim(),
      company: form.company.trim(),
      city: form.city.trim(),
      format: form.format,
      salary: form.salary.trim(),
      level: form.level,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      description: form.description.trim(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    setForm({ ...empty, company: form.company });
    setMsg({ ok: true, text: "Вакансия жарияланды" });
    load();
  }

  async function toggle(v: Vacancy) {
    const { error } = await supabase()
      .from("vacancies")
      .update({ status: v.status === "ACTIVE" ? "PAUSED" : "ACTIVE" })
      .eq("id", v.id);
    if (error) setMsg({ ok: false, text: error.message });
    load();
  }

  async function remove(v: Vacancy) {
    if (!confirm(`"${v.title}" вакансиясын өшіресіз бе?`)) return;
    const { error } = await supabase().from("vacancies").delete().eq("id", v.id);
    if (error) setMsg({ ok: false, text: error.message });
    load();
  }

  const input = "w-full rounded-xl border border-line bg-bg px-4 py-2 text-ink outline-none focus:border-brand";

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="grid h-fit gap-4 rounded-2xl border border-line bg-sf p-6">
        <h1 className="text-xl font-bold text-ink">Жаңа вакансия</h1>

        <input className={input} placeholder="Атауы (мысалы: Junior Frontend әзірлеуші)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className={input} placeholder="Компания" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="Қала" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <select className={input} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
            {FORMATS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="Жалақы (мысалы: 300 000 – 400 000 ₸)" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <select className={input} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <input className={input} placeholder="Дағдылар, үтірмен: HTML, CSS, React" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <textarea className={input} rows={5} placeholder="Сипаттамасы, міндеттері, талаптары" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="grid gap-1 text-sm text-mute">
          Жарамдылық мерзімі (міндетті емес)
          <input type="date" className={input} value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
        </label>

        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-soft text-brand" : "bg-red-500/10 text-red-500"}`}>{msg.text}</p>
        )}

        <button type="submit" disabled={busy} className="rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Жариялануда..." : "Вакансияны жариялау"}
        </button>
      </form>

      <div className="grid gap-3">
        <h2 className="text-xl font-bold text-ink">Менің вакансияларым ({rows.length})</h2>
        {rows.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-sf p-5">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{v.title}</p>
              <p className="text-sm text-mute">{v.company} · {v.city} · {v.level}</p>
              <p className="mt-1 text-sm font-semibold text-brand">{v.salary}</p>
              <p className={`mt-1 text-xs ${v.status === "ACTIVE" ? "text-brand" : "text-amber-500"}`}>
                {v.status === "ACTIVE" ? "Белсенді" : "Тоқтатылған"}
                {v.expires_at && ` · мерзімі: ${new Date(v.expires_at).toLocaleDateString("kk-KZ")}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(v)} className="rounded-lg border border-line px-3 py-1 text-sm text-ink hover:bg-soft">
                {v.status === "ACTIVE" ? "Тоқтату" : "Қосу"}
              </button>
              <button onClick={() => remove(v)} className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-500">
                Өшіру
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-mute">Вакансия әлі жарияланбаған.</p>}
      </div>
    </div>
  );
}
