export type OfferStatus = "NEW" | "VIEWED" | "THINKING" | "ACCEPTED" | "DECLINED";
export type Offer = {
  id: number; vacancy: string; company: string; salary: string; format: string; city: string;
  message: string; date: string; deadline: string; contact: string;
  status: OfferStatus; history: { s: OfferStatus; d: string }[];
};

export const OFFERS_KEY = "4everr:offers";
export const statusLabel: Record<OfferStatus, string> = { NEW: "Жаңа", VIEWED: "Қаралды", THINKING: "Ойланып жатыр", ACCEPTED: "Қабылданды", DECLINED: "Бас тартылды" };
export const statusCls: Record<OfferStatus, string> = { NEW: "c-i", VIEWED: "c-w", THINKING: "c-w", ACCEPTED: "c-ok", DECLINED: "c-b" };

const d = "08.11.2026";
export const seedOffers: Offer[] = [
  { id: 1, vacancy: "Junior Frontend әзірлеуші", company: "Kaspi Lab", salary: "300 000 – 400 000 ₸", format: "Гибрид", city: "Астана", message: "Тест нәтижелеріңіз бен жобаңыз ұнады. Командаға қосылуды ұсынамыз, алғашқы айда ментор бекітіледі.", date: d, deadline: "20.11.2026", contact: "hr@kaspilab.kz", status: "NEW", history: [{ s: "NEW", d }] },
  { id: 2, vacancy: "UI/UX дизайнер (Junior)", company: "Beeline KZ", salary: "250 000 – 320 000 ₸", format: "Офис", city: "Алматы", message: "Портфолиоңыз қызықты көрінді. Сізге ұсыныс жасағымыз келеді.", date: d, deadline: "25.11.2026", contact: "jobs@beeline.kz", status: "NEW", history: [{ s: "NEW", d }] },
];
