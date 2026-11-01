import History from "@/components/History";
import ProgressRing from "@/components/ProgressRing";

export default function ProfilePage() {
  return (
    <>
      <div className="hero rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="blob b1" /><div className="blob b2" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="grow basis-64">
            <span className="chip" style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}><i className="dot" />5 күн қатарынан белсенді</span>
            <h1 className="font-bold text-3xl sm:text-4xl leading-tight mt-3">Frontend жолында 58% өттіңіз</h1>
            <p className="mt-2 text-white/80 max-w-[52ch]">Келесі қадам: JavaScript тестін 80%-ға жеткізіңіз. Сонда Kaspi Lab вакансиясына сәйкестігіңіз 90%-дан асады.</p>
            <a href="/jobs/1" className="btn mt-5" style={{ background: "#fff", color: "#073A35" }}>Сәйкес вакансияны ашу</a>
          </div>
          <ProgressRing value={58} size={128} className="text-3xl" />
        </div>
      </div>
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="card p-5 lg:sticky lg:top-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-soft text-brand grid place-items-center text-xl font-bold">ӘЖ</div>
            <div><h2 className="font-bold text-xl leading-tight">Әсел Жақсылық</h2><p className="text-sm text-mute">asel@mail.kz</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><span className="chip c-i">Кандидат</span><span className="chip c-ok">Junior · Frontend</span></div>
          <h3 className="mt-6 text-sm font-semibold">Менің дағдыларым</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm"><span className="chip c-ok">HTML</span><span className="chip c-ok">CSS</span><span className="chip c-w">JavaScript</span><span className="chip c-b">Java · әлсіз</span></div>
          <div className="mt-6 grid gap-2">
            <button className="btn btn-s">Профильді өңдеу</button>
            <button className="btn btn-s">Құпиясөзді өзгерту</button>
            <button className="min-h-[44px] text-sm font-semibold" style={{ color: "var(--bt)" }}>Аккаунтты жою</button>
          </div>
        </aside>
        <History />
      </div>
    </>
  );
}
