import Link from "next/link";
import { notFound } from "next/navigation";
import ProgressRing from "@/components/ProgressRing";
import ReviewPanel from "@/components/ReviewPanel";
import { received } from "@/lib/applications";

export default async function ApplicantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = received.find((x) => String(x.id) === id);
  if (!a) notFound();
  return (
    <>
      <Link href="/employer/applications" className="text-sm text-mute inline-block min-h-[44px] leading-[44px]">‹ Келген өтінімдер</Link>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="grid gap-4 min-w-0">
          <div className="card p-6 flex flex-wrap items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-soft text-brand grid place-items-center text-xl font-bold">{a.name.split(" ").map((w) => w[0]).join("")}</div>
            <div className="grow"><h1 className="font-bold text-2xl">{a.name}</h1><p className="text-mute">{a.role} · өтінім күні {a.date}</p></div>
            <div className="text-center"><ProgressRing value={a.match} size={84} className="text-lg" /><p className="text-xs text-mute mt-1">сәйкестік</p></div>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-3">Вакансия талаптарына сәйкестік</h2>
            <div className="grid gap-3">
              {a.skills.map((s) => (
                <div key={s[0]}>
                  <div className="flex justify-between text-sm"><span className="font-semibold">{s[0]}</span><span className="text-mute">{s[1]}%</span></div>
                  <div className="h-2 rounded-full bg-line overflow-hidden mt-1"><div className="bar h-full bg-brand" style={{ "--w": s[1] + "%" } as React.CSSProperties} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-3">Платформадағы тест нәтижелері</h2>
            <div className="flex flex-wrap gap-2">
              {a.tests.map((t) => (<span key={t[0]} className={"chip " + (t[1] >= 80 ? "c-ok" : t[1] >= 60 ? "c-w" : "c-b")}>{t[0]} · {t[1]}%</span>))}
            </div>
          </div>
          <div className="card p-6"><h2 className="font-bold text-lg mb-2">Қысқа хат</h2><p className="text-mute italic max-w-[70ch]">{a.letter}</p></div>
          <Link href="/resume" className="btn btn-s w-fit">Толық резюмені ашу</Link>
        </div>
        <ReviewPanel start={a.stage} />
      </div>
    </>
  );
}
