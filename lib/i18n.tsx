
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { lookup } from "@/lib/dict";
import { supabase } from "@/lib/supabase/client";

export type Lang = "kk" | "ru" | "en";
const LANGS: Lang[] = ["kk", "ru", "en"];

type Translation = { kk: string; ru: string; en: string };

type C = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (s: string) => string;
};

const Ctx = createContext<C>({
  lang: "kk",
  setLang: () => {},
  t: (s) => s.split("|")[0],
});

export const useI18n = () => useContext(Ctx);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setL] = useState<Lang>("kk");
  const [overrides, setOverrides] = useState<Record<string, Translation>>({});

  useEffect(() => {
    let active = true;
    const load = () => supabase()
      .from("site_translations")
      .select("source, kk, ru, en")
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        const next: Record<string, Translation> = {};
        for (const row of data) {
          next[row.source] = { kk: row.kk, ru: row.ru, en: row.en };
        }
        setOverrides(next);
      })
      .catch(() => {});
    load();
    window.addEventListener("site-translations-updated", load);
    return () => {
      active = false;
      window.removeEventListener("site-translations-updated", load);
    };
  }, []);

  useEffect(() => {
    try {
      const s = localStorage.getItem("4everr:lang");
      if (s === "kk" || s === "ru" || s === "en") setL(s);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setL(l);
    try {
      localStorage.setItem("4everr:lang", l);
    } catch {}
  };

  const t = (s: string) => {
    const source = s.includes("|") ? s : lookup(s) ?? s;
    const override = overrides[source] ?? overrides[s];
    const custom = override?.[lang]?.trim();
    if (custom) return custom;
    const p = source.split("|");
    return p[LANGS.indexOf(lang)] ?? p[0];
  };

  return (
    <Ctx.Provider value={{ lang, setLang, t }}>
      {children}
    </Ctx.Provider>
  );
}
