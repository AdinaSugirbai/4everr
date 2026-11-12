"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import Avatar from "@/components/Avatar";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", key); };
  }, []);

  if (!user) return null;
  const emp = user.role === "EMPLOYER";
  const items = emp
    ? [{ href: "/account", label: "Аккаунт баптаулары|Настройки аккаунта|Account settings" }, { href: "/employer/profile", label: "Компания профилі|Профиль компании|Company profile" }]
    : [{ href: "/account", label: "Аккаунт баптаулары|Настройки аккаунта|Account settings" }, { href: "/resume", label: "Резюмені өңдеу|Редактировать резюме|Edit resume" }];
  function out() { logout(); setOpen(false); router.push("/start"); }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-full pl-3 pr-1 py-1 hover:bg-soft">
        <span className="hidden sm:block text-sm text-mute">{user.name}</span>
        <Avatar name={user.name} size={36} />
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 top-full mt-2 w-72 p-2 shadow-xl" style={{ animation: "rv .2s ease-out" }}>
          <div className="p-3">
            <p className="font-semibold leading-tight">{user.name}</p>
            <p className="text-xs text-mute">{user.email}</p>
            <span className={"chip mt-2 " + (emp ? "c-w" : "c-ok")}>{emp ? t("Жұмыс беруші|Работодатель|Employer") : t("Кандидат|Кандидат|Candidate")}</span>
          </div>
          <div className="h-px bg-line my-1" />
          {items.map((i) => (<Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-soft">{t(i.label)}</Link>))}
          <div className="h-px bg-line my-1" />
          <button onClick={out} className="w-full text-left rounded-lg px-3 py-2 font-semibold hover:bg-soft" style={{ color: "var(--bt)" }}>{t("Шығу|Выйти|Log out")}</button>
        </div>
      )}
    </div>
  );
}
