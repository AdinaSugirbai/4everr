import { Dashboard, PostEditor, PostView } from "@/components/workspace";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Home } from "@/components/home";
import { Catalog } from "@/components/catalog";
import { InterestQuiz } from "@/components/interest-quiz";
import { JobList, ApplyButton, EmployerForm } from "@/components/jobs";
import { TestList, TechTest, Stats } from "@/components/tech-test";
import { Heading, Notice, ButtonLink, Chips } from "@/components/ui";
import { careers, jobs, formats, topics } from "@/lib/data";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const [section, id] = slug;
  if (!section) return <Home />;
  if (slug.length > 2) notFound();
  if (section === "dashboard" && !id) return <Dashboard />;
  if (section === "posts" && id === "new") return <PostEditor />;
  if (section === "posts" && id)
    return (
      <Suspense fallback={<p role="status">Жүктелуде...</p>}>
        <PostView id={id} />
      </Suspense>
    );
  if (section === "careers" && !id)
    return (
      <>
        <Heading
          label="Career Navigator"
          title="Өзіңе жақын бағытты тап."
          description="Жеті бағыт. Әртүрлі мүмкіндіктер. Қызығушылығыңа сай алғашқы қадам."
        />
        <Catalog />
      </>
    );
  if (section === "careers" || section === "roadmap") {
    const c = careers.find((c) => c.slug === id);
    if (!c) notFound();
    const roadmap = section === "roadmap",
      steps = [
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
                    <p className="text-sm">
                      Демо оқу қадамы · Шамамен 1–2 апта
                    </p>
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
  if (section === "quiz-interests" && !id) return <InterestQuiz />;
  if (section === "jobs" && !id)
    return (
      <>
        <Heading
          label="Job Board"
          title="Келесі қадамың — осында."
          description="Жұмыс пен тағылымдама мүмкіндіктерін өз бағытыңа сай ізде."
        />
        <Notice>
          Барлық вакансиялар, компаниялар мен жалақылар — интерфейсті көрсетуге
          арналған ойдан шығарылған деректер.
        </Notice>
        <Suspense fallback={<p role="status">Вакансиялар жүктелуде...</p>}>
          <JobList />
        </Suspense>
      </>
    );
  if (section === "jobs" && id) {
    const j = jobs.find((j) => j.id === id);
    if (!j) notFound();
    return (
      <>
        <Link
          className="inline-flex min-h-11 items-center text-sm mt-6"
          href="/jobs"
        >
          ← Вакансиялар
        </Link>
        <Heading
          label="Демо-вакансия"
          title={j.title}
          description={`${j.company} · ${j.city} · ${formats[j.format]}`}
        />
        <div className="grid lg:grid-cols-[1.8fr_1fr] gap-5">
          <article className="card">
            <h2>Жұмыс туралы</h2>
            <p className="my-5">
              Оқу жобаларында алған біліміңді командадағы міндеттерге қолдан.
              Тәлімгермен бірге өнімді дамытуға қатыс.
            </p>
            <h3 className="text-lg mb-4">Қажетті дағдылар</h3>
            <Chips items={j.skills} />
            <h3 className="text-lg mt-7 mb-3">Міндеттер</h3>
            <p>
              Командалық тапсырмаларды орындау, кодты тексеруге қатысу және жаңа
              дағдыларды меңгеру.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <ButtonLink href="/tests">Дағдыларымды тексеру</ButtonLink>
              <ButtonLink href={"/careers/" + j.career}>
                Бағытпен танысу
              </ButtonLink>
            </div>
          </article>
          <aside className="card self-start">
            <h2 className="text-2xl">{j.salary}</h2>
            <p className="my-5">Айына · {j.level} · демо</p>
            <ApplyButton />
            <Notice>
              Алдын ала төлем сұраған жұмыс берушіден сақ болыңыз.
            </Notice>
          </aside>
        </div>
      </>
    );
  }
  if (section === "tests") {
    if (!id)
      return (
        <>
          <Heading
            label="TechTest"
            title="Біліміңді тексер. Келесі қадамды біл."
            description="Тақырыпты таңда, тапсырмаларды орында және қай дағдыны дамыту керегін анықта."
          />
          <TestList />
        </>
      );
    const topic = topics.find((t) => t.toLowerCase() === id);
    if (!topic) notFound();
    return <TechTest key={topic} topic={topic} />;
  }
  if (section === "stats" && !id)
    return (
      <>
        <Heading
          label="Жеке статистика"
          title="Прогресіңді көр. Өзіңді дамыт."
          description="Осы браузердегі демо-тест нәтижелері. Деректер серверге жіберілмейді."
        />
        <Stats />
      </>
    );
  if (section === "employer") {
    if (id === "new")
      return (
        <>
          <Heading
            label="Вакансия жобасы"
            title="Командаңа кімді іздеп жүрсің?"
            description="UI үлгісі: деректер серверге жіберілмейді және жарияланбайды."
          />
          <EmployerForm />
        </>
      );
    if (id) notFound();
    return (
      <>
        <Heading
          label="Жұмыс берушілерге"
          title="Жаңа таланттармен таныс."
          description="Вакансия жариялау мен өтінімдерді басқару — бір жерде."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {[
            [
              "01",
              "Компания профилі",
              "Компанияң туралы ақпарат пен жұмыс форматын көрсет.",
            ],
            [
              "02",
              "Вакансия жасау",
              "Бағыт, қажетті дағдылар мен жұмыс шарттарын таңда.",
            ],
            [
              "03",
              "Өтінімдерді басқару",
              "Модерациядан кейін үміткерлердің өтінімдерін қара.",
            ],
          ].map(([n, t, d]) => (
            <article className="card" key={n}>
              <span className="eyebrow">{n}</span>
              <h3 className="text-2xl mt-6 mb-3">{t}</h3>
              <p className="text-sm">{d}</p>
            </article>
          ))}
        </div>
        <div className="band">
          <div>
            <h2 className="text-2xl mb-2">Вакансияңды дайында.</h2>
            <p>Демо форма ештеңе жарияламайды және деректерді сақтамайды.</p>
          </div>
          <Link href="/employer/new" className="btn btn-light">
            Демо форманы ашу →
          </Link>
        </div>
      </>
    );
  }
  if (section === "profile" && !id)
    return (
      <>
        <Heading
          label="Жеке кабинет"
          title="Сенің дамуың — бір жерде."
          description="Нәтижелер, оқу жолы және жұмысқа алғашқы қадамдар."
        />
        <Notice>
          Бұл — интерфейс нұсқасы. Кіру мен тіркелу, рөлдерді тексеру және
          дерекқор келесі серверлік кезеңге жатады.
        </Notice>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            [
              "Менің нәтижелерім",
              "Осы браузердегі демо тесттер тарихы.",
              "/stats",
              "Статистика",
            ],
            [
              "Менің өтінімдерім",
              "Нақты өтінімдер үшін кандидат аккаунты қажет.",
              "/jobs",
              "Вакансиялар",
            ],
            [
              "Оқу жолым",
              "Өз бағытыңды таңдап, оқу қадамдарын зертте.",
              "/careers",
              "Мамандықтар",
            ],
          ].map(([t, d, url, cta]) => (
            <article className="card" key={t}>
              <h2 className="text-2xl">{t}</h2>
              <p className="my-5 text-sm">{d}</p>
              <ButtonLink href={url}>{cta}</ButtonLink>
            </article>
          ))}
        </div>
      </>
    );
  notFound();
}
