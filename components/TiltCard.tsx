"use client";
import { useRef } from "react";

export default function TiltCard({ children, className = "", k = 8 }: { children: React.ReactNode; className?: string; k?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current!, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * k}deg) rotateX(${-y * k}deg)`;
    el.style.setProperty("--mx", (x + 0.5) * 100 + "%");
    el.style.setProperty("--my", (y + 0.5) * 100 + "%");
  };
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={() => (ref.current!.style.transform = "")}>
      {children}
    </div>
  );
}
