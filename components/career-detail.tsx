import Link from "next/link";
import { notFound } from "next/navigation";
import { careers } from "@/lib/data";
import { Heading, Chips, Notice, ButtonLink } from "./ui";
export function CareerDetail({
  id,
  roadmap = false,
}: {
  id: string;
  roadmap?: boolean;
}) {
  const c = careers.find((c) => c.slug === id);
  if (!c) notFound();
  const steps = [
    "Негізгі ұғымдармен танысу",
    ...c.skills.map((s) => s + " негіздерін меңгеру"),
    "Шағын жоба жасау",
    "Портфолио дайындау",
  ];
  return (
    <>
      <Link
        className="inline-flex items-center min-h-11 text-sm mt-6"
        href="/careers"
      >
        ← Мамандықтар
      </Link>
      <Heading
        label="Career Navigator"
        title={c.title + (roadmap ? " · Оқу жолы" : "")}
        description={c.description}
      />
      <div className="max-w-3xl">
        <Chips items={c.skills} />
        {roadmap ? (
          <>
            <h2 className="mt-8">Қадамнан қадамға.</h2>
            {steps.map((s, i) => (
              <div className="roadstep" key={s}>
                <span className="text-[#7b965b] font-serif text-2xl">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-lg mb-2">{s}</h3>
                  <p className="text-sm">Демо оқу қадамы · Шамамен 1–2 апта</p>
                </div>
              </div>
            ))}
            <Notice>
              Оқу картасының UI үлгісі. Прогресті аккаунтқа сақтау сервер
              қосылғанда қолжетімді болады.
            </Notice>
          </>
        ) : (
          <>
            <h2 className="my-7">Бұл бағыт кімге арналған?</h2>
            <p>
              {c.description} Қызығушылығыңды шағын жобаларда байқап көр.
              Негізгі дағдылардан бастап, біртіндеп портфолио жина.
            </p>
            <Notice>
              Мамандық сипаттамалары — қысқартылған үлгілер. Жалақы мен кіру
              қиындығы тексерілген контентпен толықтырылады.
            </Notice>
            <div className="flex flex-wrap gap-3">
              <ButtonLink primary href={"/roadmap/" + c.slug}>
                Оқу жолын ашу
              </ButtonLink>
              <ButtonLink href="/tests">Білімімді тексеру</ButtonLink>
            </div>
          </>
        )}
        <div className="band">
          <div>
            <h2 className="text-2xl mb-2">Оқудан алғашқы жұмысқа.</h2>
            <p>Осы бағыттағы демо мүмкіндіктерді қара.</p>
          </div>
          <ButtonLink href={"/jobs?career=" + c.slug}>Вакансиялар</ButtonLink>
        </div>
      </div>
    </>
  );
}
