"use client";
import { useState } from "react";
import { burst, toast } from "@/lib/fx";
import { stageCls, stageLabel, type Stage } from "@/lib/applications";

export default function ReviewPanel({ start }: { start: Stage }) {
  const [stage, setStage] = useState<Stage>(start);
  const [note, setNote] = useState("");

  function change(s: Stage, e: React.MouseEvent<HTMLButtonElement>) {
    setStage(s);
    if (s === "INVITED") burst(e.currentTarget);
    toast("Күйі өзгерді", "Жаңа күйі: " + stageLabel[s]);
  }

  return (
    <aside className="card p-5 grid gap-4 lg:sticky lg:top-20">
      <div><p className="text-sm text-mute mb-1">Қазіргі күйі</p><span className={"chip " + stageCls[stage]}>{stageLabel[stage]}</span></div>
      <div>
        <label htmlFor="note" className="font-semibold text-sm">Жеке жазба (кандидат көрмейді)</label>
        <textarea id="note" rows={4} className="inp mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Сұхбатта не сұрау керек?" />
      </div>
      <button className="btn btn-p" onClick={(e) => change("INVITED", e)}>Сұхбатқа шақыру</button>
      <button className="btn btn-s" onClick={(e) => change("VIEWED", e)}>Күту тізіміне қою</button>
      <button className="btn btn-s" style={{ color: "var(--bt)" }} onClick={(e) => change("REJECTED", e)}>Бас тарту</button>
    </aside>
  );
}
