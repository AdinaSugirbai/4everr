"use client";
import { useI18n } from "@/lib/i18n";

export type Skill = { name: string; value: number };

const ORBITS = [82, 124, 166, 208];
const DURATIONS = [26, 38, 52, 70];

const PALETTE: Record<string, { a: string; b: string; glow: string; text: string }> = {
  HTML: { a: "#BDF5DD", b: "#1E7F5C", glow: "rgba(95,227,176,.5)", text: "#5FE3B0" },
  CSS: { a: "#D9F0FF", b: "#1D5FA8", glow: "rgba(127,216,255,.5)", text: "#9FD3FF" },
  JavaScript: { a: "#FFF6CC", b: "#B8860B", glow: "rgba(255,216,77,.5)", text: "#FFD84D" },
  Java: { a: "#FFD2B0", b: "#8A2E12", glow: "rgba(255,140,90,.4)", text: "#FFB08A" },
};
const FALLBACK = { a: "#E0E4FF", b: "#3B4590", glow: "rgba(170,180,255,.4)", text: "#C9D1FF" };

export default function SkillPlanets({ percent, skills }: { percent: number; skills: Skill[] }) {
  const { t } = useI18n();
  const planets = skills.slice(0, 4);

  return (
    <section
  className="relative mx-auto h-[420px] w-full overflow-hidden rounded-[28px] text-[#E6E9FF]"
  style={{ background: "radial-gradient(ellipse at 50% 45%, #1A1442 0%, #0A0820 55%, #05040F 100%)" }}
  aria-label={t("Дағдылар жүйесі|Система навыков|Skills system")}
>
      <style>{`
        @keyframes sp-orbit { to { transform: rotate(360deg); } }
        @keyframes sp-upright { to { transform: rotate(-360deg); } }
      `}</style>

      <div className="absolute left-4 top-3 z-10 text-xs text-[#9AA3DA]">
        {t("ITalent · Дағдылар жүйесі|ITalent · Система навыков|ITalent · Skills system")}
      </div>
      <div className="absolute right-4 top-3 z-10 text-xs text-[#9AA3DA]">Frontend</div>

      {ORBITS.map((r) => (
        <div
          key={r}
          className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-[rgba(170,180,255,.22)]"
          style={{ width: r * 2, height: r * 2, transform: "translate(-50%, -50%)" }}
        />
      ))}

      <div
        className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center text-[#2A1404]"
        style={{
          background: "radial-gradient(circle at 35% 35%, #FFF3C4, #FFB020 60%, #C2550A)",
          boxShadow: "0 0 40px 10px rgba(255,176,32,.35)",
        }}
      >
        <div>
          <div className="text-sm font-medium">{percent}%</div>
          <div className="text-[9px] opacity-80">{t("жол|путь|path")}</div>
        </div>
      </div>

      {planets.map((s, i) => {
        const p = PALETTE[s.name] ?? FALLBACK;
        const size = Math.round(22 + s.value * 0.26);
        const r = ORBITS[i] ?? ORBITS[ORBITS.length - 1];
        const dur = DURATIONS[i] ?? 60;
        return (
          <div
            key={s.name}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{ animation: `sp-orbit ${dur}s linear infinite` }}
          >
            <div style={{ transform: `translate(${r}px, 0)` }}>
              <div
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  left: -size / 2,
                  top: -size / 2,
                  animation: `sp-upright ${dur}s linear infinite`,
                }}
              >
                <div
                  className="grid h-full w-full place-items-center rounded-full text-[11px] font-medium text-[#0A0820]"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${p.a}, ${p.b})`,
                    boxShadow: `0 0 ${size / 3}px ${size / 6}px ${p.glow}`,
                  }}
                >
                  {s.value}
                </div>
                <span
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px]"
                  style={{ top: size + 4, color: p.text }}
                >
                  {s.name}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <p className="absolute inset-x-4 bottom-3 text-center text-[11px] text-[#8E98CF]">
        {t(
          "Планетаның өлшемі деңгейді көрсетеді|Размер планеты показывает уровень|Planet size shows your level",
        )}
      </p>
    </section>
  );
}
