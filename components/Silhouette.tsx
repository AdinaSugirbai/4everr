"use client";
import { useI18n } from "@/lib/i18n";

export default function Silhouette({ progress }: { progress: number }) {
  const { t } = useI18n();
  const n = Math.max(0, Math.min(6, Math.ceil(progress * 6 - 1e-9)));
  const st = (i: number): React.CSSProperties => ({ fill: i < n ? "var(--brand)" : "var(--line)", opacity: i < n ? 1 : 0.4, transition: "all .5s" });
  return (
    <svg viewBox="0 0 160 200" role="img" aria-label={t("IT маман силуэті|Силуэт IT-специалиста|IT specialist silhouette") + " " + n + "/6"} style={{ width: "100%", maxWidth: 200 }}>
      <circle cx="60" cy="32" r="20" style={st(0)} />
      <rect x="36" y="58" width="48" height="62" rx="14" style={st(1)} />
      <rect x="12" y="62" width="20" height="58" rx="10" style={st(2)} />
      <rect x="88" y="62" width="20" height="58" rx="10" style={st(3)} />
      <rect x="38" y="124" width="19" height="64" rx="9" style={st(4)} />
      <rect x="63" y="124" width="19" height="64" rx="9" style={st(4)} />
      <g style={{ transition: "all .5s", opacity: n >= 6 ? 1 : 0.4 }}>
        <rect x="104" y="138" width="44" height="28" rx="4" style={{ fill: n >= 6 ? "var(--brand)" : "var(--line)" }} />
        <rect x="98" y="168" width="56" height="6" rx="3" style={{ fill: n >= 6 ? "var(--brand)" : "var(--line)" }} />
        {n >= 6 && <text x="126" y="157" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{"</>"}</text>}
      </g>
    </svg>
  );
}
