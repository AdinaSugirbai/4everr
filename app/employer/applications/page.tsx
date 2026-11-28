"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Row = {
  id: string;
  job_title: string;
  company: string;
  status: string;
  letter: string | null;
  created_at: string;
  name: string | null;
  email: string | null;
  position: string | null;
  city: string | null;
  phone: string | null;
  about: string | null;
  education: string | null;
  skills: unknown;
  photo: string | null;
  cover: string | null;
};

const STATUSES: { v: string; label: string }[] = [
  { v: "NEW", label: "Жаңа" },
  { v: "VIEWED", label: "Қаралды" },
  { v: "INTERVIEW", label: "Сұхбатқа шақырылды" },
  { v: "HIRED", label: "Қабылданды" },
  { v: "REJECTED", label: "Бас тартылды" },
];

function skillsText(s: unknown) {
  if (Array.isArray(s)) return s.join(", ");
  if (s == null || s === "") return "—";
  return JSON.stringify(s);
}

export default function EmployerApplications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase()
      .from("applications")
      .select("id, job_title, company, status, letter, created_at, name, email, position, city, phone, about, education, skills, photo, cover")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, status: string) {
    setBusy(id);
    setErr(null);
    const { error } = await supabase().from("applications").update({ status }).eq("id", id);
    if (error) setErr(error.message);
    await load();
    setBusy(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Өтінімдер ({rows.length})</h1>
      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}

      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-sf p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{r.name || "Аты жоқ"}</p>
                <p className="text-sm text-mute">{r.position || "—"} · {r.city || "—"}</p>
                <p className="mt-2 text-sm text-ink">Вакансия: {r.job_title}</p>
                <p className="text-xs text-mute">{new Date(r.created_at).toLocaleDateString("kk-KZ")}</p>
              </div>
              <select
                value={r.status}
                disabled={busy === r.id}
                onChange={(e) => changeStatus(r.id, e.target.value)}
                className="rounded-lg border border-line bg-bg px-2 py-1 text-ink"
              >
                {STATUSES.map((s) => (
                  <option key={s.v} value={s.v}>{s.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setOpen(open === r.id ? null : r.id)}
              className="mt-3 text-sm text-brand underline-offset-2 hover:underline"
            >
              {open === r.id ? "Толығырақ жасыру" : "Кандидат туралы толығырақ"}
            </button>

            {open === r.id && (
              <div className="mt-3 grid gap-3 text-sm">
                {r.photo && <img src={r.photo} alt="" className="h-20 w-20 rounded-xl object-cover" />}
                <p><span className="text-mute">Email:</span> {r.email || "—"}</p>
                <p><span className="text-mute">Телефон:</span> {r.phone || "—"}</p>
                <p><span className="text-mute">Білімі:</span> {r.education || "—"}</p>
                <p><span className="text-mute">Дағдылары:</span> {skillsText(r.skills)}</p>
                <div>
                  <p className="text-mute">Өзі туралы:</p>
                  <p className="whitespace-pre-line">{r.about || "—"}</p>
                </div>
                <div>
                  <p className="text-mute">Сопроводительное хат:</p>
                  <p className="whitespace-pre-line rounded-xl bg-soft p-4">{r.letter || "Хат жазылмаған"}</p>
                </div>
                {r.cover && (
                  <div>
                    <p className="text-mute">Cover:</p>
                    <p className="whitespace-pre-line rounded-xl bg-soft p-4">{r.cover}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && !err && <p className="py-8 text-center text-mute">Өтінім жоқ.</p>}
      </div>
    </div>
  );
}
