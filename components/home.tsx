"use client";
import Link from "next/link";
import { useBrowserStorage } from "@/lib/use-browser-storage";
import { careers } from "@/lib/data";
import { ButtonLink, CareerCard } from "./ui";
import { WorkspaceWelcome } from "./motion";
export function Home() {
  const [last, , setLast] = useBrowserStorage("lastIntent", "");
  return (
    <div className="home-studio">
      <div className="home-topline">
        <span>
          <i /> IT CAREER NAVIGATOR + TECHTEST
        </span>
        <span>ҚЫЗЫҒУШЫЛЫҚ → МҮМКІНДІК</span>
      </div>
      <WorkspaceWelcome landing />
      <div className="home-manifest">
        <span>EXPLORE YOUR POTENTIAL</span>
        <p>
          Болашағың бір ғана таңдаудан басталады.
          <br />
          <strong>Ал сен неден бастайсың?</strong>
        </p>
        <span className="manifest-star" aria-hidden>
          ✳
        </span>
      </div>
      <div className="grid md:grid-cols-3 gap-4 home-intents">
        {[
          [
            "jobs",
            "⌕",
            "Вакансия іздеу",
            "Өз деңгейіңе сай жұмыс пен тағылымдама мүмкіндіктерін тап.",
            "Вакансияларды көру",
          ],
          [
            "employer",
            "＋",
            "Вакансия орналастыру",
            "Командаңа жаңа талант ізде. Мүмкіндіктер мен адамдарды байланыстыр.",
            "Жұмыс берушілерге",
          ],
          [
            "quiz-interests",
            "✳",
            "Мамандық таңдауға көмек",
            "12 сұраққа жауап беріп, өзіңе жақын IT бағыттарын анықта.",
            "Сауалнаманы бастау",
          ],
        ].map(([id, icon, title, desc, cta], i) => (
          <article
            key={id}
            className={`card intent-card ${last === id ? "intent-selected" : ""}`}
          >
            <div className="intent-top">
              <span className="intent-number">0{i + 1}</span>
              <span className="intent-icon">{icon}</span>
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <Link
              href={"/" + id}
              className="intent-link"
              onClick={() => {
                try {
                  setLast(id);
                } catch {}
              }}
            >
              {cta}
              <span>→</span>
            </Link>
            {last === id && (
              <small className="intent-last">Соңғы таңдауың</small>
            )}
          </article>
        ))}
      </div>
      <div className="band test-banner">
        <div>
          <span className="eyebrow">DON’T GUESS. TEST.</span>
          <h2>Біліміңді нақты қадамға айналдыр.</h2>
          <p>HTML · CSS · JavaScript · Java — TechTest барлық бағытқа ортақ.</p>
        </div>
        <Link href="/tests" className="btn btn-light shrink-0">
          Білімімді тексеру →
        </Link>
      </div>
      <div className="section-head">
        <div>
          <span className="eyebrow">FIND YOUR THING</span>
          <h2 className="mt-3">IT-дағы мүмкіндіктерді аш</h2>
        </div>
        <ButtonLink href="/careers">Барлық бағыт</ButtonLink>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {careers.slice(0, 3).map((c) => (
          <CareerCard career={c} key={c.slug} />
        ))}
      </div>
    </div>
  );
}
