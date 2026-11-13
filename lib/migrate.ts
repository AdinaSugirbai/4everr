import { seedJobs, JOBS_KEY } from "./jobs";
import { seedOffers, OFFERS_KEY } from "./offers";
import { seedApps, APPS_KEY } from "./apps";

const FORMATS = ["Офис|Офис|Office", "Қашықтан|Удалённо|Remote", "Гибрид|Гибрид|Hybrid"];
const CITIES = ["Астана|Астана|Astana", "Алматы|Алматы|Almaty"];

// бір тілді мәтіннің кез келген нұсқасынан толық үш тілді жолды табады
function index(list: string[]) {
  const m = new Map<string, string>();
  list.forEach((full) => full.split("|").forEach((p) => m.set(p, full)));
  return m;
}
const titleMap = index(seedJobs.map((j) => j.title));
const fmtMap = index(FORMATS);
const cityMap = index(CITIES);
const up = (m: Map<string, string>, v: unknown) => (typeof v === "string" && !v.includes("|") ? m.get(v) ?? v : v);

function fix(key: string, seeds: any[], seedFields: string[]) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    const out = list.map((x: any) => {
      const s = seeds.find((q) => q.id === x.id);
      const n = { ...x };
      if (s) seedFields.forEach((f) => (n[f] = s[f]));
      if ("vacancy" in n) n.vacancy = up(titleMap, n.vacancy);
      if ("title" in n) n.title = up(titleMap, n.title);
      if ("format" in n) n.format = up(fmtMap, n.format);
      if ("city" in n) n.city = up(cityMap, n.city);
      return n;
    });
    const next = JSON.stringify(out);
    if (next !== raw) localStorage.setItem(key, next);
  } catch {}
}

export function migrate() {
  if (typeof window === "undefined") return;
  fix(OFFERS_KEY, seedOffers, ["vacancy", "city", "format", "message"]);
  fix(APPS_KEY, seedApps, ["vacancy", "city", "about", "education", "cover"]);
  fix(JOBS_KEY, [], []);
}
migrate();
