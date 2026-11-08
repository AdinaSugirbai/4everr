"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocal } from "@/lib/store";
import { toast } from "@/lib/fx";

type Skill = { name: string; level: number };
type Resume = { position: string; city: string; phone: string; about: string; education: string; skills: Skill[] };
const empty: Resume = { position: "Junior Frontend", city: "Астана", phone: "", about: "", education: "", skills: [{ name: "HTML", level: 90 }, { name: "CSS", level: 85 }] };

export default function ResumePage() {
  const { user } = useAuth();
  const [saved, save] = useLocal<Resume>("4everr:resume", empty);
  const [draft, setDraft] = useState<Resume | null>(null);
  const [sn, setSn] = useState("");
  const r = draft ?? saved;

  const set = (k: keyof Resume) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({ ...r, [k]: e.target.value });
  const setLevel = (i: number, v: number) => setDraft({ ...r, skills: r.skills.map((s, j) => (j === i ? { ...s, level: v } : s)) });
  const del = (i: number) => setDraft({ ...r, skills: r.skills.filter((_, j) => j !== i) });
  const add = () => { if (sn.trim()) { setDraft({ ...r, skills: [...r.skills, { name: sn.trim(), level: 50 }] }); setSn(""); } };
  function submit() { save(r); setDraft(null); toast("Резюме сақталды", "Жұмыс берушілер жаңа нұсқаны көреді"); }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">Резюмені өңдеу</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label htmlFor="p" className="font-semibold text-sm">Лауазым</label><input id="p" className="inp mt-1" value={r.position} onChange={set("position")} /></div>
          <div><label htmlFor="c" className="font-semibold text-sm">Қала</label><input id="c" className="inp mt-1" value={r.city} onChange={set("city")} /></div>
        </div>
        <div><label htmlFor="ph" className="font-semibold text-sm">Телефон</label><input id="ph" className="inp mt-1" value={r.phone} onChange={set("phone")} placeholder="+7 ..." /></div>
        <div><label htmlFor="a" className="font-semibold text-sm">Өзім туралы</label><textarea id="a" rows={4} className="inp mt-1" value={r.about} onChange={set("about")} /></div>
        <div><label htmlFor="ed" className="font-semibold text-sm">Білім</label><input id="ed" className="inp mt-1" value={r.education} onChange={set("education")} /></div>
        <div>
          <p className="font-semibold text-sm mb-2">Дағдылар</p>
          <div className="grid gap-3">
            {r.skills.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-sm font-semibold truncate">{s.name}</span>
                <input type="range" min={0} max={100} value={s.level} onChange={(e) => setLevel(i, Number(e.target.value))} className="grow" aria-label={s.name} />
                <span className="w-10 text-sm text-mute">{s.level}%</span>
                <button onClick={() => del(i)} aria-label="Өшіру" className="text-mute">×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3"><input className="inp" value={sn} onChange={(e) => setSn(e.target.value)} placeholder="Жаңа дағды" /><button className="btn btn-s" onClick={add}>Қосу</button></div>
        </div>
        <button className="btn btn-p w-fit" onClick={submit}>Резюмені сақтау</button>
      </div>
      <aside className="card p-5 lg:sticky lg:top-20 grid gap-3">
        <p className="text-sm text-mute">Жұмыс беруші осылай көреді</p>
        <h2 className="font-bold text-xl">{user?.name}</h2>
        <p className="text-mute text-sm">{r.position} · {r.city}</p>
        {r.about && <p className="text-sm">{r.about}</p>}
        <div className="flex flex-wrap gap-2">{r.skills.map((s, i) => (<span key={i} className="chip c-ok">{s.name} · {s.level}%</span>))}</div>
        {r.education && <p className="text-xs text-mute">{r.education}</p>}
      </aside>
    </div>
  );
}
