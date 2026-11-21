"use client";

type P = { d: string; fill?: boolean };
const PARTS: { el: (c: string) => React.ReactNode }[] = [
  { el: (c) => <rect x="34" y="98" width="10" height="22" rx="3" fill={c} /> },
  { el: (c) => <rect x="56" y="98" width="10" height="22" rx="3" fill={c} /> },
  { el: (c) => <rect x="28" y="119" width="18" height="7" rx="3" fill={c} /> },
  { el: (c) => <rect x="54" y="119" width="18" height="7" rx="3" fill={c} /> },
  { el: (c) => <rect x="28" y="58" width="44" height="40" rx="8" fill={c} /> },
  { el: (c) => <rect x="15" y="60" width="10" height="30" rx="5" fill={c} /> },
  { el: (c) => <rect x="75" y="60" width="10" height="30" rx="5" fill={c} /> },
  { el: (c) => <circle cx="20" cy="95" r="6" fill={c} /> },
  { el: (c) => <circle cx="80" cy="95" r="6" fill={c} /> },
  { el: (c) => <rect x="30" y="22" width="40" height="32" rx="9" fill={c} /> },
  { el: () => <circle cx="41" cy="37" r="4.5" fill="#fff" /> },
  { el: () => <circle cx="59" cy="37" r="4.5" fill="#fff" /> },
  { el: () => <rect x="40" y="46" width="20" height="3" rx="1.5" fill="#fff" /> },
  { el: (c) => <rect x="48.5" y="11" width="3" height="11" fill={c} /> },
  { el: () => <circle cx="50" cy="8" r="5" fill="#fbbf24" /> },
];

export default function Silhouette({ progress = 0, size = 140 }: { progress?: number; size?: number }) {
  const n = Math.round(Math.max(0, Math.min(1, progress)) * PARTS.length);
  return (
    <svg viewBox="0 0 100 130" width={size} height={(size * 130) / 100} aria-label={`${n}/${PARTS.length}`}>
      {PARTS.map((p, i) => (
        <g key={i}>
          <g opacity={0.1}>{p.el("currentColor")}</g>
          <g style={{ opacity: i < n ? 1 : 0, transition: "opacity .5s", transitionDelay: i < n ? "0.05s" : "0s" }}>{p.el("var(--brand)")}</g>
        </g>
      ))}
      {n === PARTS.length && <circle cx="50" cy="78" r="6" fill="#fbbf24"><animate attributeName="opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite" /></circle>}
    </svg>
  );
}
