import Link from "next/link";
import { notFound } from "next/navigation";
import WithdrawButton from "@/components/WithdrawButton";
import { myApps, stageCls, stageLabel } from "@/lib/applications";

export default async function MyApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = myApps.find((x) => String(x.id) === id);
  if (!a) notFound();
  const at = { NEW: 0, VIEWED: 1, INVITED: 2, REJECTED: 2 }[a.stage];
  const steps = ["Жіберілді", "Қаралды", a.stage === "REJECTED" ? "Қабылданбады" : "Шақырылды"];
  return (
    <>
      <Link href="/me/applications" className="text-sm text-mute inline-block min-h-[44px] leading-[44px]">‹ Менің өтінімдерім</Link>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="grid gap-4 min-w-0">
          <div className="card p-6">
            <span className={"chip " + stageCls[a.stage]}>{stageLabel[a.stage]}</span>
            <h1 className="font-bold text-2xl mt-3">{a.vacancy}</h1>
            <p className="text-mute">{a.company} · жіберілген күні {a.date}</p>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Өтінімнің барысы</h2>
            <ol className="grid gap-4">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={"w-8 h-8 rounded-full grid place-items-center text-sm font-bold " + (i <= at ? "bg-brand text-onb" : "bg-line text-mute")}>{i + 1}</span>
                  <span className={i <= at ? "font-semibold" : "text-mute"}>{s}</span>
                </li>
              ))}
            </ol>
          </div>
          {a.reply && (
            <div className="card p-6"><h2 className="font-bold text-lg mb-2">Жұмыс берушінің жауабы</h2><p className="text-mute">{a.reply}</p></div>
          )}
        </div>
        <aside className="card p-5 grid gap-4 lg:sticky lg:top-20">
          <div><h2 className="font-semibold">Менің қысқа хатым</h2><p className="text-sm text-mute mt-2 italic">{a.letter}</p></div>
          <Link href="/resume" className="btn btn-s">Менің резюмем</Link>
          <WithdrawButton />
        </aside>
      </div>
    </>
  );
}
