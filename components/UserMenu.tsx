"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const items = [
  { href: "/profile", label: "Кабинет" },
  { href: "/jobs/1", label: "Вакансия беті" },
  { href: "/employer/vacancies/new", label: "Вакансия жасау" },
  { href: "/employer/vacancies/1/edit", label: "Вакансияны өңдеу" },
];

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", key); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-full pl-3 pr-1 py-1 hover:bg-soft">
        <span className="hidden sm:block text-sm text-mute">Әсел Ж.</span>
        <span className="w-9 h-9 rounded-full bg-brand text-onb grid place-items-center text-sm font-bold">ӘЖ</span>
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 top-full mt-2 w-72 p-2 shadow-xl" style={{ animation: "rv .2s ease-out" }}>
          <div className="flex items-center gap-3 p-3">
            <span className="w-12 h-12 rounded-full bg-brand text-onb grid place-items-center font-bold">ӘЖ</span>
            <div><p className="font-semibold leading-tight">Әсел Жақсылық</p><p className="text-xs text-mute">asel@mail.kz</p></div>
          </div>
          <div className="h-px bg-line my-1" />
          {items.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-soft">{i.label}</Link>
          ))}
          <div className="h-px bg-line my-1" />
          <p className="px-3 pt-2 text-xs text-mute">Рөл</p>
          <button className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-soft">Кандидат <span className="chip c-ok">қазір</span></button>
          <Link href="/employer/vacancies/new" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-soft">Жұмыс беруші</Link>
          <div className="h-px bg-line my-1" />
          <button className="w-full text-left rounded-lg px-3 py-2 font-semibold hover:bg-soft" style={{ color: "var(--bt)" }}>Шығу</button>
        </div>
      )}
    </div>
  );
}
