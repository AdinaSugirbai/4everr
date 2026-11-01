import Link from "next/link";
import { Career } from "@/lib/data";
export function ButtonLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link href={href} className={`btn ${primary ? "btn-primary" : ""}`}>
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="notice">{children}</div>;
}
export function Heading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="subhead">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {items.map((s) => (
        <span className="chip" key={s}>
          {s}
        </span>
      ))}
    </div>
  );
}
export function CareerCard({ career: c }: { career: Career }) {
  return (
    <article className="card flex flex-col items-start">
      <div className="w-full flex justify-between items-center">
        <span className="w-11 h-11 bg-soft rounded-xl grid place-items-center text-xl">
          {c.icon}
        </span>
        <small className="text-muted text-xs">IT бағыты</small>
      </div>
      <h3 className="text-2xl mt-6 mb-3 tracking-tight">{c.title}</h3>
      <p className="text-sm mb-4">{c.description}</p>
      <Chips items={c.skills} />
      <div className="mt-auto pt-5">
        <ButtonLink href={"/careers/" + c.slug}>Бағытты көру</ButtonLink>
      </div>
    </article>
  );
}
