import { seedJobs } from "./jobs";
import { seedOffers } from "./offers";
import { seedApps } from "./apps";
import { applications, savedJobs, vacancies } from "./data";

const FIXED = [
  "Офис|Офис|Office", "Қашықтан|Удалённо|Remote", "Гибрид|Гибрид|Hybrid",
  "Астана|Астана|Astana", "Алматы|Алматы|Almaty", "қашықтан|удалённо|remote",
];

// бір тілді жолдың кез келген нұсқасынан толық үш тілді жолды табады
const map = new Map<string, string>();
function add(full: string) {
  const parts = full.split("|");
  if (parts.length < 3) return;
  parts.forEach((p) => { if (p.length > 1 && !map.has(p)) map.set(p, full); });
}
function walk(v: unknown) {
  if (typeof v === "string") { if (v.includes("|")) add(v); }
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object") Object.values(v).forEach(walk);
}
[FIXED, seedJobs, seedOffers, seedApps, applications, savedJobs, vacancies].forEach(walk);

export const lookup = (s: string) => map.get(s);
