"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { emptyResume, resumeKey, validateResume, type Resume } from "@/lib/resume";
import { bad, FieldErr, initials } from "@/lib/ui";
import { toast } from "@/lib/fx";

export default function ResumePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [saved, save] = useLocal<Resume>(resumeKey(user?.email ?? ""), emptyResume);
  const [draft, setDraft] = useState<Resume | null>(null);
  const [sn, setSn] = useState("");
  const [tried, setTried] = useState(false);
  const r = draft ?? saved;
  const e = tried ? validateResume(r) : {};

  const set = (k: keyof Resume) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({ ...r, [k]: ev.target.value });
  const setLevel = (i: number, v: number) => setDraft({ ...r, skills: r.skills.map((s, j) => (j === i ? { ...s, level: v } : s)) });
  const del = (i: number) => setDraft({ ...r, skills: r.skills.filter((_, j) => j !== i) });
  const add = () => { if (sn.trim()) { setDraft({ ...r, skills: [...r.skills, { name: sn.trim(), level: 50 }] }); setSn(""); } };

  function onPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 240 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
        setDraft({ ...r, photo: c.toDataURL("image/jpeg", 0.8) });
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(f);
  }

  function submit() {
    setTried(true);
    if (Object.keys(validateResume(r)).length) { toast(t("Барлық өрісті толтырыңыз|Заполните все поля|Fill in all fields"), t("Қызыл өрістерді тексеріңіз|Проверьте красные поля|Check the red fields")); return; }
    save(r); setDraft(null); setTried(false);
    toast(t("Резюме сақталды|Резюме сохранено|Resume saved"), t("Жұмыс берушілер жаңа нұсқаны көреді|Работодатели увидят новую версию|Employers will see the new version"));
  }

  const L = (k: keyof Resume, label: string) => (<label htmlFor={k} className="font-semibold text-sm">{t(label)} *</label>);

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="card p-5 grid gap-4">
        <h1 className="font-bold text-2xl">{t("Резюмені өңдеу|Редактирование резюме|Edit resume")}</h1>
        <p className="text-sm text-mute">{t("Барлық өріс міндетті (). Толық резюмесіз өтініш қалдыра алмайсыз.|Все поля обязательны (). Без полного резюме откликнуться нельзя.|All fields are required (*). You cannot apply without a complete resume.")}</p>

        <div>
          <p className="font-semibold text-sm mb-2">{t("Сурет|Фото|Photo")} *</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-soft overflow-hidden grid place-items-center text-brand font-bold text-xl" style={e.photo ? { outline: "2px solid var(--bt)" } : undefined}>
              {r.photo ? <img src={r.photo} alt="" className="w-full h-full object-cover" /> : initials(user?.name ?? "?")}
            </div>
            <label htmlFor="photo" className="btn btn-s cursor-pointer">{t("Сурет жүктеу|Загрузить фото|Upload photo")}</label>
            <input id="photo" type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
          </div>
          <FieldErr e={e.photo} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>{L("position", "Лауазым|Должность|Position")}<input id="position" className="inp mt-1" style={bad(e.position)} value={r.position} onChange={set("position")} /><FieldErr e={e.position} /></div>
          <div>{L("city", "Қала|Город|City")}<input id="city" className="inp mt-1" style={bad(e.city)} value={r.city} onChange={set("city")} /><FieldErr e={e.city} /></div>
        </div>
        <div>{L("phone", "Телефон|Телефон|Phone")}<input id="phone" className="inp mt-1" style={bad(e.phone)} value={r.phone} onChange={set("phone")} placeholder="+7 ..." /><FieldErr e={e.phone} /></div>
        <div>{L("about", "Өзім туралы|О себе|About me")}<textarea id="about" rows={4} className="inp mt-1" style={bad(e.about)} value={r.about} onChange={set("about")} /><FieldErr e={e.about} /></div>
        <div>{L("education", "Білім|Образование|Education")}<input id="education" className="inp mt-1" style={bad(e.education)} value={r.education} onChange={set("education")} /><FieldErr e={e.education} /></div>

        <div>
          <p className="font-semibold text-sm mb-2">{t("Дағдылар|Навыки|Skills")} *</p>
          <div className="grid gap-3">
            {r.skills.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-sm font-semibold truncate">{s.name}</span>
                <input type="range" min={0} max={100} value={s.level} onChange={(ev) => setLevel(i, Number(ev.target.value))} className="grow" aria-label={s.name} />
                <span className="w-10 text-sm text-mute">{s.level}%</span>
                <button onClick={() => del(i)} aria-label="Delete" className="text-mute">×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input className="inp" style={bad(e.skills)} value={sn} onChange={(ev) => setSn(ev.target.value)} onKeyDown={(ev) => { if (ev.key === "Enter") add(); }} placeholder={t("Жаңа дағды|Новый навык|New skill")} />
            <button className="btn btn-s" onClick={add}>{t("Қосу|Добавить|Add")}</button>
          </div>
          <FieldErr e={e.skills} />
        </div>
        <button className="btn btn-p w-fit" onClick={submit}>{t("Резюмені сақтау|Сохранить резюме|Save resume")}</button>
      </div>

      <aside className="card p-5 lg:sticky lg:top-20 grid gap-3">
        <p className="text-sm text-mute">{t("Жұмыс беруші осылай көреді|Так увидит работодатель|Employers will see this")}</p>
        <div className="w-16 h-16 rounded-full bg-soft overflow-hidden grid place-items-center text-brand font-bold">{r.photo ? <img src={r.photo} alt="" className="w-full h-full object-cover" /> : initials(user?.name ?? "?")}</div>
        <h2 className="font-bold text-xl">{user?.name}</h2>
        <p className="text-mute text-sm">{r.position} {r.city && "· " + r.city}</p>
        {r.about && <p className="text-sm">{r.about}</p>}
        <div className="flex flex-wrap gap-2">{r.skills.map((s, i) => (<span key={i} className="chip c-ok">{s.name} · {s.level}%</span>))}</div>
        {r.education && <p className="text-xs text-mute">{r.education}</p>}
      </aside>
    </div>
  );
}
