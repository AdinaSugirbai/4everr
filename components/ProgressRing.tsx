"use client";
import { useEffect, useRef, useState } from "react";

/** Сан 0-ден мәнге дейін санап көтеріледі, сақина соған ілесіп толады. */
export default function ProgressRing({ value, size = 96, className = "" }: { value: number; size?: number; className?: string }) {
  const [n, setN] = useState(0);
  const cur = useRef(0);
  useEffect(() => {
    const from = cur.current, t0 = performance.now();
    let id = 0;
    const f = (t: number) => {
      const k = Math.min((t - t0) / 1100, 1);
      cur.current = Math.round(from + (value - from) * (1 - (1 - k) ** 3));
      setN(cur.current);
      if (k < 1) id = requestAnimationFrame(f);
    };
    id = requestAnimationFrame(f);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className="ring" style={{ "--p": n, width: size, height: size, transition: "none" } as React.CSSProperties}>
      <b className={className}>{n}%</b>
    </div>
  );
}
