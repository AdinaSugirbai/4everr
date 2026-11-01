"use client";
import { useState } from "react";
import ProgressRing from "./ProgressRing";
import { burst, toast, wait } from "@/lib/fx";

export default function ApplyPanel({ match }: { match: number }) {
  const [letter, setLetter] = useState("");
  const [st, setSt] = useState<"idle" | "busy" | "done">("idle");
  const [saved, setSaved] = useState(false);

  async function apply(e: React.MouseEvent<HTMLButtonElement>) {
    const b = e.currentTarget;
    setSt("busy"); await wait(1000); setSt("done");
    burst(b);
    toast("Өтінім жіберілді", "Күйі: Жаңа. «Өтінімдерім» бөлімінен қарайсыз.");
    // TODO келесі аптада: POST /api/applications { vacancyId, letter, resumeUrl }
  }

  return (
    <aside className="card p-5 lg:sticky lg:top-20 grid gap-4">
      <div className="flex items-center gap-4">
        <ProgressRing value={match} size={96} className="text-2xl" />
        <div><p className="font-semibold">Сіздің сәйкестігіңіз</p><p className="text-xs text-mute mt-1">Тек React жетіспейді. Оны үйренсеңіз, 95% болады.</p></div>
      </div>
      <div><label className="font-semibold text-sm" htmlFor="cl">Қысқа хат</label>
        <textarea id="cl" rows={5} maxLength={500} className="inp mt-1" value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="Неге осы вакансияға қызықтыңыз?" />
        <p className="text-xs text-mute text-right">{letter.length} / 500</p></div>
      <div><label className="font-semibold text-sm" htmlFor="rs">Резюмеге сілтеме <span className="text-mute font-normal">(міндетті емес)</span></label>
        <input id="rs" className="inp mt-1" placeholder="https://" /></div>
      <button className="btn btn-p w-full" disabled={st !== "idle"} style={{ opacity: 1 }} onClick={apply}>
        {st === "busy" ? <><span className="spin" /> Жіберілуде…</> : st === "done" ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path className="draw" d="M5 12l5 5 9-10" /></svg> Өтінім жіберілді</> : "Өтінім беру"}
      </button>
      <button className="btn btn-s w-full" aria-pressed={saved} onClick={() => { setSaved(!saved); if (!saved) toast("Таңдаулыларға қосылды", "Енді «Таңдаулылар» бөлімінде тұрады"); }}>
        <span className={`heart ${saved ? "on" : ""}`}>♥</span> {saved ? "Сақталды" : "Сақтау"}
      </button>
    </aside>
  );
}
