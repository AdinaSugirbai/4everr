"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export function Navigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    ["/jobs", "Вакансиялар"],
    ["/employer", "Жұмыс берушілерге"],
    ["/careers", "Мамандықтар"],
    ["/tests", "Тесттер"],
  ];
  return (
    <header className="border-b border-line px-5 sm:px-8 lg:px-[5%] py-5 flex flex-wrap items-center justify-between gap-5">
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="site-logo text-3xl font-extrabold tracking-[-2px]"
      >
        4everr<span className="text-lime">✳</span>
      </Link>
      <button
        className="btn md:hidden"
        aria-expanded={open}
        aria-controls="navigation"
        onClick={() => setOpen(!open)}
      >
        Мәзір ☰
      </button>
      <nav
        id="navigation"
        aria-label="Негізгі навигация"
        className={`${open ? "flex" : "hidden"} md:flex order-3 md:order-none w-full md:w-auto flex-wrap gap-x-6 gap-y-1 text-sm`}
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={path.startsWith(href) ? "page" : undefined}
            className={`py-3 min-h-11 border-b-2 ${path.startsWith(href) ? "border-lime text-lime" : "border-transparent"}`}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/dashboard"
          className="md:hidden py-3"
          onClick={() => setOpen(false)}
        >
          Жеке кабинет
        </Link>
      </nav>
      <Link href="/dashboard" className="btn hidden! md:inline-flex!">
        Жеке кабинет →
      </Link>
    </header>
  );
}
