"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useLocal } from "@/lib/store";
import { OFFERS_KEY, seedOffers, statusCls, statusLabel, type Offer, type OfferStatus } from "@/lib/offers";
import { burst, toast } from "@/lib/fx";

export default function MyOffersPage() {
  const { t } = useI18n();
  const [offers, save] = useLocal<Offer[]>(OFFERS_KEY, seedOffers);
  const [sel, setSel] = useState<number | null>(null);
  const o = offers.find((x) => x.id === sel) ?? offers[0];
  const final = o && (o.status === "ACCEPTED" || o.status === "DECLINED");

  function setStatus(id: number, s: OfferStatus, onlyIfNew = false) {
    const d = new Date().toLocaleDateString("ru-RU");
    save(offers.map((x) => (x.id !== id || (onlyIfNew && x.status !== "NEW") ? x : { ...x, status: s, history: [...x.history, { s, d }] })));
  }
  function pick(id: number) { setSel(id); setStatus(id, "VIEWED", true); }
  function decide(s: OfferStatus, e: React.MouseEvent<HTMLButtonElement>) {
    setStatus(o.id, s);
    if (s === "ACCEPTED") burst(e.currentTarget);
    toast(t("Жауабыңыз жіберілді|Ваш ответ отправлен|Your answer was sent"), t(statusLabel[s]));
  }

  if (!o) return <p className="text-mute">{t("Әзірге ұсыныс жоқ.|Пока нет предложений.|No offers yet.")}</p>;
  return (
    <>
      <h1 className="font-bold text-2xl">{t("Келген ұсыныстар|Полученные предложения|Received offers")}</h1>
      <p className="text-sm text-mute mt-1 mb-5">{t("Жұмыс берушілер жіберген ұсыныстар және сіздің жауабыңыз.|Предложения от работодателей и ваш ответ.|Offers from employers and your response.")}</p>
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        <div className="grid gap-3">
          {offers.map((x) => (
            <button key={x.id} onClick={() => pick(x.id)} className="card p-4 text-left" style={x.id === o.id ? { borderColor: "var(--brand)" } : undefined}>
              <div className="flex items-start justify-between gap-2"><p className="font-semibold leading-snug">{x.vacancy}</p><span className={"chip " + statusCls[x.status]}>{t(statusLabel[x.status])}</span></div>
              <p className="text-sm text-mute mt-1">{x.company} · {x.salary}</p>
            </button>
          ))}
        </div>
        <div className="card p-6 grid gap-5">
          <div><span className={"chip " + statusCls[o.status]}>{t(statusLabel[o.status])}</span><h2 className="font-bold text-2xl mt-3">{o.vacancy}</h2><p className="text-mute">{o.company} · {o.city}</p></div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="border border-line rounded-xl p-3"><p className="text-mute">{t("Жалақы|Зарплата|Salary")}</p><p className="font-bold text-brand">{o.salary}</p></div>
            <div className="border border-line rounded-xl p-3"><p className="text-mute">{t("Формат|Формат|Format")}</p><p className="font-semibold">{o.format}</p></div>
            <div className="border border-line rounded-xl p-3"><p className="text-mute">{t("Жауап беру мерзімі|Срок ответа|Reply deadline")}</p><p className="font-semibold">{o.deadline}</p></div>
            <div className="border border-line rounded-xl p-3"><p className="text-mute">{t("Байланыс|Контакт|Contact")}</p><p className="font-semibold">{o.contact}</p></div>
          </div>
          <div><h3 className="font-semibold mb-1">{t("Жұмыс берушінің хабарламасы|Сообщение работодателя|Employer message")}</h3><p className="text-mute">{o.message}</p></div>
          <div><h3 className="font-semibold mb-2">{t("Күйдің тарихы|История статусов|Status history")}</h3>
            <ol className="grid gap-1 text-sm">{o.history.map((h, i) => (<li key={i} className="flex gap-2"><span className="text-mute">{h.d}</span><span>{t(statusLabel[h.s])}</span></li>))}</ol></div>
          {final ? (
            <p className="text-sm text-mute">{t("Жауап берілді. Ұсыныс жабық.|Ответ дан. Предложение закрыто.|Answered. The offer is closed.")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-p" onClick={(e) => decide("ACCEPTED", e)}>{t("Қабылдау|Принять|Accept")}</button>
              <button className="btn btn-s" onClick={(e) => decide("THINKING", e)}>{t("Ойланамын|Подумаю|Think about it")}</button>
              <button className="btn btn-s" style={{ color: "var(--bt)" }} onClick={(e) => decide("DECLINED", e)}>{t("Бас тарту|Отказаться|Decline")}</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
