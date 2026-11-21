"use client";
import Link from "next/link";
import { useState } from "react";
import { received, stageCls, stageLabel, type Stage } from "@/lib/applications";

const keys: ("all" | Stage)[] = ["all", "NEW", "VIEWED", "INVITED", "REJECTED"];

export default function ApplicantsTable() {
  const [f, setF] = useState<"all" | Stage>("all");
  const [s, setS] = useState("match");
  const base = received.filter((a) => f === "all" || a.stage === f);
  const rows = [...base].sort((a, b) => (s === "match" ? b.match - a.match : b.id - a.id));
  const avg = (t: [string, number][]) => Math.round(t.reduce((x, y) => x + y[1], 0) / t.length);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {keys.map((k) => (
          <button key={k} onClick={() => setF(k)} className={"chip min-h-[32px] " + (f === k ? "c-ok" : "c-i")}>{k === "all" ? "Барлығы" : stageLabel[k]}</button>
        ))}
        <select className="inp ml-auto" style={{ width: "auto" }} value={s} onChange={(e) => setS(e.target.value)} aria-label="Сұрыптау">
          <option value="match">Сәйкестік бойынша</option>
          <option value="new">Жаңасы бірінші</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-left text-mute"><tr><th className="py-2 font-medium">Кандидат</th><th className="font-medium w-44">Сәйкестік</th><th className="font-medium">Тест (орташа)</th><th className="font-medium">Күні</th><th className="font-medium">Күйі</th><th></th></tr></thead>
          <tbody key={f + s}>
            {rows.map((a, k) => (
              <tr key={a.id} className="rv border-t border-line" style={{ "--i": k } as React.CSSProperties}>
                <td className="py-3"><p className="font-semibold">{a.name}</p><p className="text-xs text-mute">{a.role}</p></td>
                <td><div className="flex items-center gap-2"><div className="h-2 w-24 rounded-full bg-line overflow-hidden"><div className="bar h-full bg-brand" style={{ "--w": a.match + "%" } as React.CSSProperties} /></div><b>{a.match}%</b></div></td>
                <td className="text-mute">{avg(a.tests)}%</td>
                <td className="text-mute">{a.date}</td>
                <td><span className={"chip " + stageCls[a.stage]}>{stageLabel[a.stage]}</span></td>
                <td><Link href={"/employer/applications/" + a.id} className="text-brand font-semibold">Ашу ›</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">Бұл күйде өтінім жоқ.</p>}
    </div>
  );
}
