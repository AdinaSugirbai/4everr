"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import Modal from "@/components/Modal";
import { APPS_KEY, appCls, appLabel, appStatuses, seedApps, type AppStatus, type Application } from "@/lib/apps";
import { initials } from "@/lib/ui";
import { burst, toast } from "@/lib/fx";

export default function ApplicationsPage() {
  const { t } = useI18n();
  const [apps, save] = useLocal<Application[]>(APPS_KEY, seedApps);
  const [f, setF] = useState<"ALL" | AppStatus>("ALL");
  const [sel, setSel] = useState<number | null>(null);
  const o = apps.find((a) => a.id === sel);
  const list = apps.filter((a) => f === "ALL" || a.status === f);

  function setStatus(id: number, s: AppStatus) { save(apps.map((a) => (a.id === id ? { ...a, status: s } : a))); }
  function open(a: Application) { setSel(a.id); if (a.status === "NEW") setStatus(a.id, "VIEWED"); }
  function mark(s: AppStatus, e: React.MouseEvent<HTMLButtonElement>) {
    if (!o) return;
    setStatus(o.id, s);
    if (s === "HIRED") burst(e.currentTarget);
    toast(t("Күй өзгертілді|Статус изменён|Status updated"), t(appLabel[s]));
  }

  return (
    <>
      <h1 className="font-bold text-2xl">{t("Келген өтінімдер|Полученные заявки|Applications")}</h1>
      <div className="flex flex-wrap gap-2 mt-4 mb-5">
        <button className={"btn " + (f === "ALL" ? "btn-p" : "btn-s")} onClick={() => setF("ALL")}>{t("Барлығы|Все|All")} · {apps.length}</button>
        {appStatuses.map((s) => (<button key={s} className={"btn " + (f === s ? "btn-p" : "btn-s")} onClick={() => setF(s)}>{t(appLabel[s])} · {apps.filter((a) => a.status === s).length}</button>))}
      </div>
      {list.length === 0 && <p className="text-mute">{t("Өтінім жоқ.|Заявок нет.|No applications.")}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((a) => (
          <button key={a.id} onClick={() => open(a)} className="card p-4 text-left hover:bg-soft flex gap-3 items-center">
            <span className="w-12 h-12 shrink-0 rounded-full bg-soft overflow-hidden grid place-items-center text-brand font-bold">{a.photo ? <img src={a.photo} alt="" className="w-full h-full object-cover" /> : initials(a.name)}</span>
            <span className="grow min-w-0">
              <span className="flex items-start justify-between gap-2"><span className="font-semibold truncate">{a.name}</span><span className={"chip " + appCls[a.status]}>{t(appLabel[a.status])}</span></span>
              <span className="block text-sm text-mute truncate">{a.vacancy}</span>
              <span className="block text-xs text-mute">{a.date}</span>
            </span>
          </button>
        ))}
      </div>

      <Modal open={!!o} onClose={() => setSel(null)} title={o ? o.name : ""} wide>
        {o && (
          <>
            <div className="flex items-center gap-4">
              <span className="w-20 h-20 rounded-full bg-soft overflow-hidden grid place-items-center text-brand font-bold text-xl">{o.photo ? <img src={o.photo} alt="" className="w-full h-full object-cover" /> : initials(o.name)}</span>
              <div className="text-sm"><p className="font-semibold">{o.position} · {o.city}</p><p className="text-mute">{o.email} · {o.phone}</p><p className="text-mute">{o.vacancy} · {o.date}</p></div>
            </div>
            <div><h3 className="font-semibold mb-1">{t("Өзі туралы|О себе|About")}</h3><p className="text-mute">{o.about}</p></div>
            <div><h3 className="font-semibold mb-1">{t("Білім|Образование|Education")}</h3><p className="text-mute">{o.education}</p></div>
            <div><h3 className="font-semibold mb-2">{t("Дағдылар|Навыки|Skills")}</h3>
              <div className="grid gap-2">{o.skills.map((s, i) => (<div key={i}><div className="flex justify-between text-sm"><span>{s.name}</span><span className="text-mute">{s.level}%</span></div><div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-brand" style={{ width: s.level + "%" }} /></div></div>))}</div></div>
            <div><h3 className="font-semibold mb-1">{t("Қысқаша хат|Сопроводительное письмо|Cover letter")}</h3><p className="text-mute">{o.cover}</p></div>
            <div><h3 className="font-semibold mb-2">{t("Күйді белгілеу|Установить статус|Set status")}</h3>
              <div className="flex flex-wrap gap-2">{appStatuses.map((s) => (<button key={s} aria-pressed={o.status === s} className={"btn " + (o.status === s ? "btn-p" : "btn-s")} onClick={(e) => mark(s, e)}>{t(appLabel[s])}</button>))}</div></div>
            <Link href="/employer/offers" className="btn btn-s w-fit">{t("Ұсыныс жіберуге өту|Перейти к отправке предложения|Go to send an offer")}</Link>
          </>
        )}
      </Modal>
    </>
  );
}
