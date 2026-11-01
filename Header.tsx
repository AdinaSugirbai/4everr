"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/jobs/1", label: "Вакансия беті" },
  { href: "/employer/vacancies/new", label: "Вакансия жасау" },
  { href: "/profile", label: "Кабинет" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="sticky z-40 border-b border-line bg-sf" style={{ top: "env(safe-area-inset-top,0px)" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/profile" className="font-bold text-lg tracking-tight text-brand">4everr</Link>
        <nav className="flex gap-1 text-sm overflow-x-auto" aria-label="Негізгі навигация">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`px-3 py-2 rounded-lg hover:bg-soft whitespace-nowrap ${path.startsWith(l.href.split("/").slice(0, 3).join("/")) ? "bg-soft" : ""}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block text-sm text-mute">Әсел Ж.</span>
          <span className="w-9 h-9 rounded-full bg-brand text-onb grid place-items-center text-sm font-bold">ӘЖ</span>
        </div>
      </div>
    </header>
  );
}
