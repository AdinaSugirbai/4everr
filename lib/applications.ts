function Applications() {
  const { t } = useI18n();
  const tr = useTr();
  const [f, setF] = useState("all");
  const [s, setS] = useState("new");
  const base = applications.filter((a) => f === "all" || a.status === f);
  const rows = s === "old" ? [...base].reverse() : base;
  const keys: ("all" | AppStatus)[] = ["all", "NEW", "VIEWED", "INVITED", "REJECTED"];

  function vacancyId(title: string) {
    const key = title.split("|")[0];
    return vacancies.find((v) => v.title.split("|")[0] === key)?.id;
  }

  return (
    <div className="pt-4">
      <Toolbar value={f} onChange={setF} sort={s} onSort={setS}
        chips={keys.map((v) => ({ v, l: t(v === "all" ? "Барлығы|Все|All" : STATUS[v] ?? statusUi[v].label) }))}
        sorts={[{ v: "new", l: t("Жаңасы бірінші|Сначала новые|Newest first") }, { v: "old", l: t("Ескісі бірінші|Сначала старые|Oldest first") }]} />
      <div id="t2" key={f + s} className="grid gap-3">
        {rows.map((a) => {
          const id = vacancyId(a.title);
          const Card = (
            <>
              <div className="grow"><h3 className="font-semibold">{tr(a.title)}</h3><p className="text-sm text-mute">{tr(a.meta)}</p></div>
              <span className="text-sm text-mute">{tr(a.date)}</span>
              <span className={chip ${statusUi[a.status].cls}}>{t(STATUS[a.status] ?? statusUi[a.status].label)}</span>
            </>
          );
          return id ? (
            <Link key={a.title} href={/jobs/${id}} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4 hover:bg-soft">
              {Card}
            </Link>
          ) : (
            <article key={a.title} className="flex flex-wrap items-center gap-3 border border-line rounded-xl p-4">
              {Card}
            </article>
          );
        })}
      </div>
      {!rows.length && <p className="py-8 text-center text-mute">{t("Бұл күйде өтінім жоқ.|Заявок с таким статусом нет.|No applications with this status.")}</p>}
    </div>
  );
}
