import Link from "next/link";
import ApplyPanel from "@/components/ApplyPanel";
import TiltCard from "@/components/TiltCard";

const list = (a: string[]) => <ul className="list-disc pl-5 text-mute grid gap-1">{a.map((x) => <li key={x}>{x}</li>)}</ul>;

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // келесі аптада: id бойынша дерекқордан аламыз
  return (
    <>
      <Link href="/profile" className="text-sm text-mute inline-block min-h-[44px] leading-[44px]">‹ Вакансиялар</Link>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="grid gap-4 min-w-0">
          <TiltCard className="card p-6" k={3}>
            <div className="flex flex-wrap items-center gap-2 mb-3"><span className="chip c-i">Junior</span><span className="chip c-i">Гибрид</span><span className="chip c-i">Frontend</span><span className="chip c-ok">Белсенді</span></div>
            <h1 className="font-bold text-3xl leading-tight">Junior Frontend әзірлеуші</h1>
            <p className="mt-2 text-mute">Kaspi Lab · Астана · жарияланған 27 қазан · №{id}</p>
            <p className="mt-4 text-xl font-bold text-brand">250 000 – 400 000 ₸</p>
          </TiltCard>
          <div className="card p-6 grid gap-6 leading-relaxed">
            <section><h2 className="font-bold text-lg mb-2">Сипаттама</h2><p className="max-w-[70ch] text-mute">Біз банктің мобильді қосымшасына арналған веб-интерфейстерді жасайтын шағын команда боламыз. Жаңа әзірлеушіге ментор бекітіледі.</p></section>
            <section><h2 className="font-bold text-lg mb-2">Міндеттер</h2>{list(["Макеттер бойынша беттерді жасау", "Қайта қолданылатын React компоненттерін жазу", "Код-ревьюге қатысу"])}</section>
            <section><h2 className="font-bold text-lg mb-2">Талаптар</h2>{list(["HTML, CSS, JavaScript негіздері", "Git-пен жұмыс (оқу жобалары да болады)", "Ағылшын құжаттамасын оқи алу"])}</section>
            <section><h2 className="font-bold text-lg mb-2">Дағдылар</h2><div className="flex flex-wrap gap-2"><span className="chip c-ok">HTML ✓</span><span className="chip c-ok">CSS ✓</span><span className="chip c-w">JavaScript · тест 64%</span><span className="chip c-b">React · жоқ</span></div></section>
          </div>
          <div className="card p-6"><h2 className="font-bold text-lg mb-3">Ұқсас вакансиялар</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/jobs/2" className="border border-line rounded-xl p-4 hover:bg-soft"><p className="font-semibold">React тағылымдама</p><p className="text-sm text-mute">Chocofamily · қашықтан</p></Link>
              <Link href="/jobs/3" className="border border-line rounded-xl p-4 hover:bg-soft"><p className="font-semibold">Web әзірлеуші (Junior)</p><p className="text-sm text-mute">Technodom · Астана</p></Link>
            </div></div>
        </div>
        <ApplyPanel match={82} />
      </div>
    </>
  );
}
