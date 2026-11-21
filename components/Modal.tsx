"use client";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, wide, children }: { open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,.55)" }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className="card w-full p-6 grid gap-4" style={{ maxWidth: wide ? 720 : 520, maxHeight: "90vh", overflowY: "auto", animation: "rv .2s ease-out" }}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-bold text-xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-mute text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
