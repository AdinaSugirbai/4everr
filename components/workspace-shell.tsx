"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Post } from "@/lib/workspace";
import { ButtonLink } from "./ui";
export function Badge({ status }: { status: Post["status"] }) {
  return (
    <span
      className={`status-pill ${status === "DRAFT" ? "status-draft" : "status-ready"}`}
    >
      <i />
      {status === "DRAFT" ? "Жоба" : "Тексеруге дайын"}
    </span>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <div className="studio-label">
          <span>THE WORKSPACE</span>
          <span>01</span>
        </div>
        <nav aria-label="Кабинет навигациясы" className="studio-nav">
          {[
            ["/dashboard", "◫", "Шолу және тарих"],
            ["/posts/new", "＋", "Пост жасау"],
            ["/jobs", "⌕", "Вакансиялар"],
          ].map(([href, icon, title], i) => (
            <Link
              key={href}
              href={href}
              className={path === href ? "selected" : ""}
            >
              <span className="nav-symbol" aria-hidden>
                {icon}
              </span>
              <span>{title}</span>
              <small>0{i + 1}</small>
            </Link>
          ))}
        </nav>
        <div className="sidebar-art" aria-hidden="true">
          <div className="sidebar-orbit" />
          <span>✳</span>
          <small>
            STAY CURIOUS.
            <br />
            BUILD YOUR FUTURE.
          </small>
        </div>
        <div className="studio-profile">
          <span className="profile-avatar">A</span>
          <div>
            <strong>Адина</strong>
            <small>Демо кеңістік</small>
          </div>
          <span>✦</span>
        </div>
      </aside>
      <div className="studio-content">{children}</div>
    </div>
  );
}
export function PageTop({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="studio-page-top flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-8 pt-3">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="text-3xl! sm:text-4xl! mt-3 mb-3">{title}</h1>
        <p className="text-sm">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Missing() {
  return (
    <Shell>
      <div className="card py-12 text-center">
        <h2>Пост табылмады.</h2>
        <p className="my-5">Пост басқа браузерде сақталған болуы мүмкін.</p>
        <ButtonLink href="/dashboard">Кабинетке оралу</ButtonLink>
      </div>
    </Shell>
  );
}
