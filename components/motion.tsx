"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function MotionFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div key={path} className="page-enter">
      <MotionEffects />
      {children}
    </div>
  );
}
function MotionEffects() {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const seen = new WeakSet<Element>();
    let order = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          observer.unobserve(el);
          el.animate(
            [
              { opacity: 0, transform: "translateY(22px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 620,
              delay: Math.min(order++ % 4, 3) * 65,
              easing: "cubic-bezier(.2,.8,.2,1)",
              fill: "backwards",
            },
          );
        }
      },
      { threshold: 0.08 },
    );
    const scan = () =>
      document
        .querySelectorAll("main .card, main .band, main .roadstep")
        .forEach((el) => {
          if (!seen.has(el)) {
            seen.add(el);
            observer.observe(el);
          }
        });
    scan();
    const changes = new MutationObserver(scan);
    changes.observe(document.querySelector("main") || document.body, {
      childList: true,
      subtree: true,
    });
    const ripple = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(".btn")
          : null;
      if (!target || target.matches(":disabled")) return;
      const rect = target.getBoundingClientRect(),
        circle = document.createElement("span");
      circle.className = "button-ripple";
      circle.style.left =
        (event.detail ? event.clientX - rect.left : rect.width / 2) + "px";
      circle.style.top =
        (event.detail ? event.clientY - rect.top : rect.height / 2) + "px";
      target.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    };
    document.addEventListener("click", ripple);
    return () => {
      observer.disconnect();
      changes.disconnect();
      document.removeEventListener("click", ripple);
    };
  }, []);
  return null;
}
export function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0,
      start = 0;
    const run = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / 850, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span aria-label={String(value)}>{display}</span>;
}
export function WorkspaceWelcome({ landing = false }: { landing?: boolean }) {
  const Title = landing ? "h1" : "h2";
  return (
    <section
      className={`workspace-welcome ${landing ? "landing-welcome" : ""}`}
    >
      <div className="hero-mesh" aria-hidden="true" />
      <div className="welcome-copy">
        <span className="hero-kicker">
          <i /> YOUR NEXT CHAPTER
        </span>
        <Title>
          {landing ? (
            <>
              IT-дағы
              <br />
              <span>өз жолыңды</span>
              <br />
              тап.
            </>
          ) : (
            <>
              Идеяңды
              <br />
              <span>мүмкіндікке</span>
              <br />
              айналдыр.
            </>
          )}
        </Title>
        <p>
          {landing ? (
            <>
              Бағытыңды тап. Біліміңді тексер.
              <br />
              Алғашқы жұмысыңа бір қадам жақында.
            </>
          ) : (
            <>
              Бір пост. Жаңа таныстық.
              <br />
              Біреудің мансабындағы үлкен қадам.
            </>
          )}
        </p>
        <Link
          href={landing ? "/quiz-interests" : "/posts/new"}
          className="btn hero-cta"
        >
          {landing ? "Өз бағытымды табу" : "Жаңа пост жазу"} <span>→</span>
        </Link>
        <div className="hero-bottom">
          <span>4everr / CAREER STUDIO</span>
          <span>01 — ∞</span>
        </div>
      </div>
      <div className="opportunity-art" aria-hidden="true">
        <div className="portal-halo" />
        <div className="portal-ring ring-back" />
        <div className="portal-ring ring-front" />
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="portal-cross cross-one">＋</div>
        <div className="portal-cross cross-two">＋</div>
        <div className="portal-card">
          <div className="portal-card-top">
            <span>4everr ✳</span>
            <span>PASS / 001</span>
          </div>
          <div className="art-core">✳</div>
          <strong>
            YOUR NEXT
            <br />
            CHAPTER.
          </strong>
          <div className="portal-card-bottom">
            <span>IDEA → OPPORTUNITY</span>
            <span>→</span>
          </div>
        </div>
        <div className="orbit-badge badge-top">
          <span className="badge-icon">⌘</span>
          <span>
            Frontend
            <br />
            <small>Келесі мүмкіндігің</small>
          </span>
          <b>→</b>
        </div>
        <div className="orbit-badge badge-bottom">
          <span>✦</span> Болашаққа дайын
        </div>
        <div className="portal-caption">BUILD SOMETHING THAT MATTERS</div>
      </div>
    </section>
  );
}
