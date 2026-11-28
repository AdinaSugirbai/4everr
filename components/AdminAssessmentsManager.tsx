"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiPlus, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import {
  deleteAssessment, loadAssessmentEntries, saveAssessment,
  type Assessment, type AssessmentEntries, type AssessmentKind,
} from "@/lib/assessments";
import type { Survey, Test } from "@/lib/quizdata";
import { useI18n } from "@/lib/i18n";
import AdminListToolbar from "@/components/AdminListToolbar";
import AdminLoading from "@/components/AdminLoading";

const emptyTest = (): Test => ({ name: "", q: [{ q: "", a: ["", "", "", ""] }] });
const emptySurvey = (): Survey => ({ name: "", dirs: ["", ""], q: [{ q: "", o: [["", 0], ["", 1]] }] });
const normalizeId = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");
const validId = (value: string) => /^[a-z0-9][a-z0-9_-]{1,49}$/.test(value);

function validate(kind: AssessmentKind, value: Assessment): string | null {
  if (value.name.trim().length < 2) return "Атауын енгізіңіз.|Введите название.|Enter a title.";
  if (!value.q.length) return "Кемінде бір сұрақ қосыңыз.|Добавьте хотя бы один вопрос.|Add at least one question.";
  if (kind === "test") {
    const test = value as Test;
    if (test.q.some((item) => item.q.trim().length < 3 || item.a.length < 2 || item.a.some((answer) => !answer.trim()))) {
      return "Әр тест сұрағына мәтін және кемінде екі жауап қажет.|Для каждого тестового вопроса нужны текст и минимум два ответа.|Each test question needs text and at least two answers.";
    }
    return null;
  }
  const survey = value as Survey;
  if (survey.dirs.length < 2 || survey.dirs.some((result) => result.trim().length < 2)) {
    return "Сауалнамаға кемінде екі нәтиже атауын енгізіңіз.|Добавьте минимум два результата опроса.|Add at least two survey result labels.";
  }
  if (survey.q.some((item) => item.q.trim().length < 3 || item.o.length < 2 || item.o.some(([answer, target]) => !answer.trim() || !Number.isInteger(target) || target < 0 || target >= survey.dirs.length))) {
    return "Әр сауалнама сұрағына жауап және нәтиже сәйкестігін таңдаңыз.|Для каждого ответа опроса выберите результат.|Each survey answer needs a matching result.";
  }
  return null;
}

export default function AdminAssessments({ editorOnly = false }: { editorOnly?: boolean }) {
  const { t } = useI18n();
  const [kind, setKind] = useState<AssessmentKind>("test");
  const [entries, setEntries] = useState<AssessmentEntries>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [draft, setDraft] = useState<Assessment | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [enabledFilter, setEnabledFilter] = useState("ALL");
  const [sort, setSort] = useState("id");
  const editingTest = kind === "test" && draft && "q" in draft && draft.q.length > 0 && "a" in draft.q[0];
  const test = editingTest ? draft as Test : null;
  const survey = kind === "survey" && draft && "dirs" in draft ? draft as Survey : null;
  const rows = useMemo(() => Object.entries(entries)
    .filter(([itemId, entry]) => (enabledFilter === "ALL" || (enabledFilter === "VISIBLE" ? entry.enabled : !entry.enabled))
      && `${itemId} ${entry.payload.name}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort(([a, av], [b, bv]) => sort === "name" ? t(av.payload.name).localeCompare(t(bv.payload.name)) : a.localeCompare(b)), [entries, enabledFilter, query, sort, t]);

  function changeKind(value: AssessmentKind) {
    setKind(value); setSelected(null); setId(""); setDraft(editorOnly ? (value === "test" ? emptyTest() : emptySurvey()) : null); setErr(""); setNotice("");
  }

  const load = useCallback(async () => {
    setBusy(true); setErr("");
    try { setEntries(await loadAssessmentEntries(kind)); }
    catch (error) { setErr((error as Error).message); }
    finally { setBusy(false); }
  }, [kind]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [kind, load]);

  function choose(itemId: string) {
    const entry = entries[itemId];
    if (!entry) return;
    setSelected(itemId); setId(itemId); setDraft(structuredClone(entry.payload)); setErr(""); setNotice("");
  }
  function create() {
    setSelected(null); setId(""); setDraft(kind === "test" ? emptyTest() : emptySurvey()); setErr(""); setNotice("");
  }
  useEffect(() => { if (editorOnly) { const timer = window.setTimeout(create, 0); return () => window.clearTimeout(timer); } }, [editorOnly]);
  function setName(name: string) { setDraft((current) => current ? { ...current, name } as Assessment : current); }
  function updateTest(update: (value: Test) => Test) {
    setDraft((current) => current && "dirs" in current === false ? update(current) : current);
  }
  function updateSurvey(update: (value: Survey) => Survey) {
    setDraft((current) => current && "dirs" in current ? update(current) : current);
  }

  async function save() {
    if (!draft) return;
    const normalized = normalizeId(id);
    if (!validId(normalized)) { setErr(t("ID 2–50 таңба: латын әріптері, сан, дефис немесе астын сызу.|ID: 2–50 символов — латиница, цифры, дефис или подчёркивание.|ID must be 2–50 characters: lowercase letters, numbers, hyphen or underscore.")); return; }
    if (!selected && entries[normalized]) { setErr(t("Бұл ID қолданыста. Басқа ID таңдаңыз.|Этот ID уже используется. Выберите другой.|That ID is in use. Choose another.")); return; }
    const validation = validate(kind, draft);
    if (validation) { setErr(t(validation)); return; }
    setBusy(true); setErr(""); setNotice("");
    try {
      await saveAssessment(kind, normalized, draft);
      setSelected(normalized); setId(normalized); setNotice(t("Сақталды. Сайттағы тест/сауалнама тізімін жаңартыңыз.|Сохранено. Обновите страницу тестов/опросов сайта.|Saved. The site assessment list will use this version."));
      await load();
    } catch (error) { setErr((error as Error).message); }
    finally { setBusy(false); }
  }
  async function setEnabled(enabled: boolean) {
    if (!selected || !draft) return;
    if (!enabled && !window.confirm(t("Бұл материал сайттан жасырылады. Деректері сақталып, кейін қалпына келтіруге болады.|Материал будет скрыт на сайте. Данные сохранятся, его можно будет восстановить.|This hides the item from the site. Its data is kept so it can be restored later."))) return;
    setBusy(true); setErr(""); setNotice("");
    try {
      if (enabled) await saveAssessment(kind, selected, draft);
      else await deleteAssessment(kind, selected, entries[selected].payload);
      await load(); choose(selected);
      setNotice(t(enabled ? "Материал қайта қосылды.|Материал восстановлен.|Item restored." : "Материал уақытша жасырылды. Деректері сақталды.|Материал временно скрыт. Данные сохранены.|Item hidden; its data was kept."));
    } catch (error) { setErr((error as Error).message); }
    finally { setBusy(false); }
  }

  const field = "inp w-full";
  return (
    <div className={editorOnly ? "grid gap-5" : "grid gap-5 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]"}>
      {!editorOnly && <section className="grid content-start gap-4">
        <div><h1 className="text-2xl font-bold">{t("Тесттер мен сауалнамалар|Тесты и опросы|Tests and surveys")}</h1><p className="mt-1 text-sm text-mute">{t("Сұрақтарды форма арқылы қосыңыз. Жасырылған материалды кейін қайта қоса аласыз.|Добавляйте вопросы через форму. Скрытый материал можно восстановить.|Add questions with the form. Hidden items can be restored.")}</p></div>
        <div className="flex gap-2">{(["test", "survey"] as AssessmentKind[]).map((value) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => changeKind(value)} className={`btn ${kind === value ? "btn-p" : "btn-s"}`}>{value === "test" ? t("Тесттер|Тесты|Tests") : t("Сауалнамалар|Опросы|Surveys")}</button>)}</div>
        <Link href="/admin/assessments/new" className="btn btn-p w-fit"><FiPlus className="mr-1 inline" />{t("Тест немесе сауалнама қосу|Добавить тест или опрос|Add test or survey")}</Link>
        <AdminListToolbar search={query} onSearch={setQuery} placeholder="ID немесе атауы бойынша іздеу|Поиск по ID или названию|Search by ID or title" sort={sort} onSort={setSort} sortOptions={[{ value: "id", label: "ID бойынша|По ID|By ID" }, { value: "name", label: "Атауы бойынша|По названию|By name" }]} filters={<select className="inp min-w-0" value={enabledFilter} onChange={(e) => setEnabledFilter(e.target.value)} aria-label={t("Көріну күйі|Статус публикации|Visibility")}><option value="ALL">{t("Барлығы|Все|All")}</option><option value="VISIBLE">{t("Көрсетіліп тұр|Опубликовано|Visible")}</option><option value="HIDDEN">{t("Жасырылған|Скрыто|Hidden")}</option></select>} />
        {busy && <AdminLoading />}
        <div className="grid gap-2">{rows.map(([itemId, entry]) => <button type="button" key={itemId} onClick={() => choose(itemId)} className={`card p-4 text-left hover:bg-soft ${selected === itemId ? "border-brand" : ""}`}><span className="flex items-center justify-between gap-2"><code className="text-xs text-mute">{itemId}</code><span className={`chip ${entry.enabled ? "c-ok" : "c-w"}`}>{t(entry.enabled ? "Көрсетіліп тұр|Опубликовано|Visible" : "Жасырылған|Скрыто|Hidden")}</span></span><span className="mt-1 block font-semibold">{t(entry.payload.name)}</span><span className="text-xs text-mute">{entry.payload.q.length} {t("сұрақ|вопросов|questions")}</span></button>)}
          {!rows.length && !busy && !err && <p className="card p-4 text-sm text-mute">{t("Материал табылмады.|Материалы не найдены.|No items found.")}</p>}</div>
      </section>}

      <section className="card grid content-start gap-4 p-5">
        {editorOnly && <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin/assessments" className="text-sm text-mute underline">‹ {t("Тесттер мен сауалнамалар тізімі|К списку тестов и опросов|Back to tests & surveys")}</Link><div className="flex gap-2">{(["test", "survey"] as AssessmentKind[]).map((value) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => changeKind(value)} className={`btn ${kind === value ? "btn-p" : "btn-s"}`}>{value === "test" ? t("Тест|Тест|Test") : t("Сауалнама|Опрос|Survey")}</button>)}</div></div>}
        {editorOnly && busy && <AdminLoading />}
        <h2 className="text-lg font-bold">{selected ? t("Материалды өңдеу|Редактировать материал|Edit item") : t(editorOnly ? "Жаңа тест немесе сауалнама|Новый тест или опрос|New test or survey" : "Материалды өңдеу|Редактировать материал|Edit item")}</h2>
        {!draft ? <p className="text-sm text-mute">{t("Тізімнен материал таңдаңыз немесе жаңасын қосыңыз.|Выберите материал из списка или добавьте новый.|Select an item or add a new one.")}</p> : <>
          <label className="grid gap-1 text-sm font-semibold">{t("Қысқа ID (сілтемеде қолданылады)|Короткий ID (используется в ссылке)|Short ID (used internally)")}<input className={field} value={id} readOnly={Boolean(selected)} onChange={(e) => setId(e.target.value)} placeholder={kind === "test" ? "html-basics" : "team-style"} /></label>
          <label className="grid gap-1 text-sm font-semibold">{t("Атауы: қазақша | орысша | ағылшынша|Название: казахский | русский | английский|Title: Kazakh | Russian | English")}<input className={field} value={draft.name} onChange={(e) => setName(e.target.value)} placeholder="Веб негіздері | Основы веба | Web basics" /></label>

          {test && <div className="grid gap-4">{test.q.map((question, qi) => <article className="rounded-xl border border-line p-4" key={qi}><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{t("Сұрақ|Вопрос|Question")} {qi + 1}</h3><button type="button" className="btn btn-s px-3 py-2 text-red-600" disabled={test.q.length <= 1} aria-label={t("Сұрақты алып тастау|Удалить вопрос|Remove question")} onClick={() => updateTest((current) => ({ ...current, q: current.q.filter((_, i) => i !== qi) }))}><FiTrash2 /></button></div>
            <label className="mt-3 grid gap-1 text-sm">{t("Сұрақ мәтіні (kk | ru | en)|Текст вопроса (kk | ru | en)|Question text (kk | ru | en)")}<textarea className={field} rows={2} value={question.q} onChange={(e) => updateTest((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, q: e.target.value } : item) }))} /></label>
            <div className="mt-3 grid gap-2"><p className="text-sm font-medium">{t("Жауап нұсқалары. Бірінші жауап — дұрыс.|Варианты ответа. Первый — правильный.|Answer options. The first answer is correct.")}</p>{question.a.map((answer, ai) => <div key={ai} className="flex gap-2"><input className={field} value={answer} onChange={(e) => updateTest((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, a: item.a.map((value, j) => j === ai ? e.target.value : value) } : item) }))} placeholder={t("Жауап (kk | ru | en)|Ответ (kk | ru | en)|Answer (kk | ru | en)")} /><button type="button" className="btn btn-s px-3" disabled={question.a.length <= 2} aria-label={t("Жауапты алып тастау|Удалить ответ|Remove answer")} onClick={() => updateTest((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, a: item.a.filter((_, j) => j !== ai) } : item) }))}><FiTrash2 /></button></div>)}
              <button type="button" className="btn btn-s w-fit" onClick={() => updateTest((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, a: [...item.a, ""] } : item) }))}><FiPlus className="mr-1 inline" />{t("Жауап қосу|Добавить ответ|Add answer")}</button></div></article>)}
            <button type="button" className="btn btn-s w-fit" onClick={() => updateTest((current) => ({ ...current, q: [...current.q, { q: "", a: ["", "", "", ""] }] }))}><FiPlus className="mr-1 inline" />{t("Сұрақ қосу|Добавить вопрос|Add question")}</button></div>}

          {survey && <div className="grid gap-4">
            <fieldset className="grid gap-2 rounded-xl border border-line p-4"><legend className="px-1 text-sm font-semibold">{t("Нәтиже санаттары|Категории результата|Result categories")}</legend><p className="text-xs text-mute">{t("Әр жауапты осы санаттардың біріне сәйкестендіріңіз.|Свяжите каждый ответ с одной из категорий.|Map each answer to one category.")}</p>{survey.dirs.map((result, ri) => <div className="flex gap-2" key={ri}><input className={field} value={result} onChange={(e) => updateSurvey((current) => ({ ...current, dirs: current.dirs.map((value, i) => i === ri ? e.target.value : value) }))} placeholder={t("Нәтиже атауы (kk | ru | en)|Название результата (kk | ru | en)|Result label (kk | ru | en)")} /><button type="button" className="btn btn-s px-3" disabled={survey.dirs.length <= 2} aria-label={t("Санатты алып тастау|Удалить категорию|Remove category")} onClick={() => updateSurvey((current) => ({ ...current, dirs: current.dirs.filter((_, i) => i !== ri), q: current.q.map((question) => ({ ...question, o: question.o.map(([text, target]) => [text, target >= ri ? Math.max(0, target - 1) : target] as [string, number]) })) }))}><FiTrash2 /></button></div>)}<button type="button" className="btn btn-s w-fit" onClick={() => updateSurvey((current) => ({ ...current, dirs: [...current.dirs, ""] }))}><FiPlus className="mr-1 inline" />{t("Нәтиже қосу|Добавить результат|Add result")}</button></fieldset>
            {survey.q.map((question, qi) => <article className="rounded-xl border border-line p-4" key={qi}><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{t("Сұрақ|Вопрос|Question")} {qi + 1}</h3><button type="button" className="btn btn-s px-3 py-2 text-red-600" disabled={survey.q.length <= 1} aria-label={t("Сұрақты алып тастау|Удалить вопрос|Remove question")} onClick={() => updateSurvey((current) => ({ ...current, q: current.q.filter((_, i) => i !== qi) }))}><FiTrash2 /></button></div>
              <label className="mt-3 grid gap-1 text-sm">{t("Сұрақ мәтіні (kk | ru | en)|Текст вопроса (kk | ru | en)|Question text (kk | ru | en)")}<textarea className={field} rows={2} value={question.q} onChange={(e) => updateSurvey((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, q: e.target.value } : item) }))} /></label>
              <div className="mt-3 grid gap-2">{question.o.map(([answer, target], ai) => <div key={ai} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input className={field} value={answer} onChange={(e) => updateSurvey((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, o: item.o.map(([text, result], j) => j === ai ? [e.target.value, result] : [text, result]) } : item) }))} placeholder={t("Жауап мәтіні (kk | ru | en)|Текст ответа (kk | ru | en)|Answer text (kk | ru | en)")} /><select className={field} aria-label={t("Бұл жауаптың нәтижесі|Результат этого ответа|Result for this answer")} value={target} onChange={(e) => updateSurvey((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, o: item.o.map(([text, result], j) => j === ai ? [text, Number(e.target.value)] : [text, result]) } : item) }))}>{survey.dirs.map((result, index) => <option key={index} value={index}>{t(result) || `${index + 1}. ${result}`}</option>)}</select><button type="button" className="btn btn-s px-3" disabled={question.o.length <= 2} aria-label={t("Жауапты алып тастау|Удалить ответ|Remove answer")} onClick={() => updateSurvey((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, o: item.o.filter((_, j) => j !== ai) } : item) }))}><FiTrash2 /></button></div>)}
                <button type="button" className="btn btn-s w-fit" onClick={() => updateSurvey((current) => ({ ...current, q: current.q.map((item, i) => i === qi ? { ...item, o: [...item.o, ["", 0]] } : item) }))}><FiPlus className="mr-1 inline" />{t("Жауап қосу|Добавить ответ|Add answer")}</button></div></article>)}
            <button type="button" className="btn btn-s w-fit" onClick={() => updateSurvey((current) => ({ ...current, q: [...current.q, { q: "", o: [["", 0], ["", 1]] }] }))}><FiPlus className="mr-1 inline" />{t("Сұрақ қосу|Добавить вопрос|Add question")}</button>
          </div>}
        </>}
        {err && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
        {notice && <p role="status" className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">{notice}</p>}
        <div className="flex flex-wrap gap-2">{draft && <button type="button" className="btn btn-p" disabled={busy} onClick={save}>{t("Сақтау|Сохранить|Save")}</button>}{selected && draft && entries[selected] && <button type="button" className="btn btn-s" disabled={busy} onClick={() => setEnabled(!entries[selected].enabled)}>{entries[selected].enabled ? <><FiTrash2 className="mr-1 inline" />{t("Сайттан жасыру|Скрыть на сайте|Hide from site")}</> : <><FiRotateCcw className="mr-1 inline" />{t("Қайта қосу|Восстановить|Restore")}</>}</button>}</div>
      </section>
    </div>
  );
}
