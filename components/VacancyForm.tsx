"use client";
import { useRef, useState } from "react";
import ProgressRing from "./ProgressRing";
import TiltCard from "./TiltCard";
import { burst, toast, wait } from "@/lib/fx";
import { emptyVac, type Vac } from "@/lib/data";

const CHK = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path className="draw" d="M5 12l5 5 9-10" /></svg>);

function Seg({ name, value, opts, set }: { name: string; value: string; opts: string[]; set: (v: string) => void }) {
  return (
    <div className="seg mt-1 flex flex-wrap gap-2">
      {opts.map((o) => (<label key={o}><input type="radio" name={name} checked={value === o} onChange={() => set(o)} /><span>{o}</span></label>))}
    </div>
  );
}

export default function VacancyForm({ initial }: { initial?: Vac }) {
  const edit = !!initial;
  const [v, setV] = useState<Vac>(initial ?? emptyVac);
  const [st, setSt] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState(false);
  const title = useRef<HTMLInputElement>(null);
  const set = (k: keyof Vac) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setV({ ...v, [k]: e.target.value }); if (k === "title") setErr(false); };
  const filled = [v.title, v.desc, v.duties, v.reqs, v.skills, v.from, v.city].filter((x) => x.trim()).length;
  const pct = Math.round((filled / 7) * 100);
  const n = (x: string) => Number(x || 0).toLocaleString("ru-RU");

  async function submit(e: React.MouseEvent<HTMLButtonElement>) {
    const b = e.currentTarget;
    if (!v.title.trim()) {
      setErr(true);
      title.current?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-5px)" }, { transform: "translateX(0)" }], { duration: 400 });
      title.current?.focus();
      toast("Атауын жазыңыз", "Вакансияға атау міндетті");
      return;
    }
    setSt("busy"); await wait(900); setSt("done");
    burst(b);
    toast(edit ? "Өзгерістер сақталды" : "Модерацияға жіберілді", edit ? "Вакансия жаңартылды" : "Күйі: Тексерілуде");
    // TODO келесі аптада: POST /api/vacancies (Zod валидациясымен)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="font-bold text-2xl">{edit ? "Вакансияны өңдеу" : "Жаңа вакансия"}</h1>
          <p className="text-sm text-mute">Жариялау алдында админ тексереді, әдетте 1 жұмыс күнінде.</p>
        </div>
        <div className="ml-auto" title="Форма қаншалықты толтырылды"><ProgressRing value={pct} size={56} className="text-xs" /></div>
      </div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="card p-5 grid gap-5">
          <div><label className="font-semibold text-sm" htmlFor="f-t">Вакансия атауы</label>
            <input id="f-t" ref={title} className="inp mt-1" style={err ? { borderColor: "var(--bt)" } : undefined} value={v.title} onChange={set("title")} placeholder="Мысалы, Junior Frontend әзірлеуші" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="font-semibold text-sm" htmlFor="f-d">Бағыт</label>
              <select id="f-d" className="inp mt-1" value={v.direction} onChange={set("direction")}>{["Frontend", "Backend", "QA", "UI/UX", "Data Science", "DevOps", "Mobile"].map((o) => <option key={o}>{o}</option>)}</select></div>
            <div><label className="font-semibold text-sm" htmlFor="f-c">Қала</label><input id="f-c" className="inp mt-1" value={v.city} onChange={set("city")} /></div>
          </div>
          <fieldset><legend className="font-semibold text-sm">Деңгей</legend><Seg name="lv" value={v.level} opts={["Тағылымдама", "Junior", "Middle", "Senior"]} set={(x) => setV({ ...v, level: x })} /></fieldset>
          <fieldset><legend className="font-semibold text-sm">Формат</legend><Seg name="fm" value={v.format} opts={["Офис", "Қашықтан", "Гибрид"]} set={(x) => setV({ ...v, format: x })} /></fieldset>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="font-semibold text-sm" htmlFor="s1">Жалақы: бастап, ₸</label><input id="s1" type="number" className="inp mt-1" value={v.from} onChange={set("from")} /></div>
            <div><label className="font-semibold text-sm" htmlFor="s2">Жалақы: дейін, ₸</label><input id="s2" type="number" className="inp mt-1" value={v.to} onChange={set("to")} /></div>
          </div>
          <div><label className="font-semibold text-sm" htmlFor="x">Сипаттама</label><textarea id="x" rows={4} maxLength={1500} className="inp mt-1" value={v.desc} onChange={set("desc")} placeholder="Команда, өнім және вакансияның мақсаты туралы қысқаша жазыңыз" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="font-semibold text-sm" htmlFor="r">Міндеттер</label><textarea id="r" rows={4} className="inp mt-1" value={v.duties} onChange={set("duties")} placeholder="Әр жолға бір міндет" /></div>
            <div><label className="font-semibold text-sm" htmlFor="q">Талаптар</label><textarea id="q" rows={4} className="inp mt-1" value={v.reqs} onChange={set("reqs")} placeholder="Әр жолға бір талап" /></div>
          </div>
          <div><label className="font-semibold text-sm" htmlFor="k">Дағдылар</label><input id="k" className="inp mt-1" value={v.skills} onChange={set("skills")} />
            <p className="text-xs text-mute mt-1">Үтір арқылы жазыңыз. Кандидаттың сәйкестігі осы дағдылар бойынша есептеледі.</p></div>
          <div className="flex flex-wrap gap-3 pt-4 border-t border-line">
            <button className="btn btn-p" disabled={st === "busy"} onClick={submit}>
              {st === "busy" ? <><span className="spin" /> Жіберілуде…</> : st === "done" ? <>{CHK} Дайын</> : edit ? "Өзгерістерді сақтау" : "Модерацияға жіберу"}
            </button>
            <button className="btn btn-s">Жоба ретінде сақтау</button>
            {edit && <button className="btn text-mute ml-auto">Вакансияны жабу</button>}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20">
          <p className="text-sm font-semibold mb-2">Кандидат осылай көреді</p>
          <TiltCard className="card p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-lg leading-snug">{v.title || "Атауын жазыңыз"}</h2>
              <span className={`chip ${edit ? "c-ok" : "c-w"}`}>{edit ? "Жарияланған" : "Тексерілуде"}</span>
            </div>
            <p className="text-sm text-mute mt-1">Kaspi Lab · {v.city}</p>
            <div className="mt-3 flex flex-wrap gap-2"><span className="chip c-i">{v.level}</span><span className="chip c-i">{v.format}</span><span className="chip c-i">{v.direction}</span></div>
            <p className="mt-4 font-bold text-brand">{v.from ? `${n(v.from)} – ${n(v.to)} ₸` : "Жалақы көрсетілмеген"}</p>
            <div id="p-k" className="mt-3 flex flex-wrap gap-2 text-sm" key={v.skills}>
              {v.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <span key={s} className="chip c-ok">{s}</span>)}
            </div>
          </TiltCard>
        </aside>
      </div>
    </>
  );
}
