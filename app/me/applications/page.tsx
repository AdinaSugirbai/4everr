import Link from "next/link";
import { myApps, stageCls, stageLabel } from "@/lib/applications";

const idx = { NEW: 0, VIEWED: 1, INVITED: 2, REJECTED: 2 };

export default function MyApplicationsPage() {
  return (
    <>
      <h1 className="font-bold text-2xl">Менің өтінімдерім</h1>
      <p className="text-sm text-mute mt-1 mb-5">Жіберген өтінімдеріңіздің барысы осында көрінеді.</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {myApps.map((a) => (
          <Link key={a.id} href={"/me/applications/" + a.id} className="card p-5 hover:bg-soft block">
            <div className="flex items-start justify-between gap-2">
              <div><h2 className="font-semibold leading-snug">{a.vacancy}</h2><p className="text-sm text-mute">{a.company}</p></div>
              <span className={"chip " + stageCls[a.stage]}>{stageLabel[a.stage]}</span>
            </div>
            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map((i) => (<span key={i} className={"h-1.5 flex-1 rounded-full " + (i <= idx[a.stage] ? "bg-brand" : "bg-line")} />))}
            </div>
            <p className="text-xs text-mute mt-3">Жіберілген күні: {a.date}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
