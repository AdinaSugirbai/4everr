"use client";
import { createContext, useContext } from "react";

export type Lang = "kk" | "ru" | "en";
type C = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string };

// Тек қазақ тілі: t() жолдың бірінші (қазақша) бөлігін қайтарады
const value: C = { lang: "kk", setLang: () => {}, t: (s) => s.split("|")[0] };

const Ctx = createContext<C>(value);
export const useI18n = () => useContext(Ctx);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
