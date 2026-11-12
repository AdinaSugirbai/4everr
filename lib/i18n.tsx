"use client";
import { lookup } from "@/lib/dict";

export type Lang = "kk" | "ru" | "en";
const LANGS: Lang[] = ["kk", "ru", "en"];
type C = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string };

const Ctx = createContext<C>({ lang: "kk", setLang: () => {}, t: (s) => s.split("|")[0] });
export const useI18n = () => useContext(Ctx);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setL] = useState<Lang>("kk");
  useEffect(() => {
    try {
      const s = localStorage.getItem("4everr:lang");
      if (s === "kk" || s === "ru" || s === "en") setL(s);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setL(l); try { localStorage.setItem("4everr:lang", l); } catch {} };
  const t = (s: string) => {
  const p = (s.includes("|") ? s : lookup(s) ?? s).split("|");
  return p[LANGS.indexOf(lang)] ?? p[0];
};
