import Link from "next/link";
import ApplyPanel from "@/components/ApplyPanel";
import TiltCard from "@/components/TiltCard";
import VacancySearch from "@/components/VacancySearch";
import SaveJobButton from "@/components/SaveJobButton";

const list = (a: string[]) => (
  <ul className="grid list-disc gap-1 pl-5 text-mute">
    {a.map((x) => <li key={x}>{x}</li>)}
  </ul>
);

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Link href="/jobs" className="inline-block min-h-[44px] text-sm leading-[44px] text-mute">‹ Вакансиялар</Link>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid min-w-0 gap-4">
          <TiltCard className="card p-6" k={3}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="chip c-i">Junior</span>
              <span className="chip c-i">Гибрид</span>
              <span className="chip c-i">Frontend</span>
              <span className="chip c-ok">Белсенді</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight">Junior Frontend әзірлеуші</h1>
            <p className="mt-2 text-mute">Kaspi Lab · Астана · жарияланған 27 қазан · №{id}</p>
            <p className="mt-4 text-xl font-bold text-brand">250 000 – 400 000 ₸</p>
            <div className="mt-5">
              <SaveJobButton jobId={id} />
            </div>
          </TiltCard>

          <div className="card grid gap-6 p-6 leading-relaxed">
            <section>
              <h2 className="mb-2 text-lg font-bold">Сипаттама</h2>
              <p className="max-w-[70ch] text-mute">
                Біз банктің мобильді қосымшасына арналған веб-интерфейстерді жасайтын шағын команда боламыз. Жаңа әзірлеушіге ментор бекітіледі.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-bold">Міндеттер</h2>
              {list(["Макеттер бойынша беттерді жасау", "Қайта қолданылатын React компоненттерін жазу", "Код-ревьюге қатысу"])}
            </section>
            <section>
              <h2 className="mb-2 text-lg font-bold">Талаптар</h2>
              {list(["HTML, CSS, JavaScript негіздері", "Git-пен жұмыс (оқу жобалары да болады)", "Ағылшын құжаттамасын оқи алу"])}
            </section>
            <section>
              <h2 className="mb-2 text-lg font-bold">Дағдылар</h2>
              <div className="flex flex-wrap gap-2">
                <span className="chip c-ok">HTML ✓</span>
                <span className="chip c-ok">CSS ✓</span>
                <span className="chip c-w">JavaScript · тест 64%</span>
                <span className="chip c-b">React · жоқ</span>
              </div>
            </section>
          </div>

          <VacancySearch />
        </div>
        <ApplyPanel match={82} />
      </div>
    </>
  );
}
