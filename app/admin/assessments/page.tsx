"use client";
import { useCallback, useEffect, useState } from "react";
import { deleteAssessment, loadAssessmentCatalog, saveAssessment, type Assessment, type AssessmentCatalog, type AssessmentKind } from "@/lib/assessments";
import { useI18n } from "@/lib/i18n";

const emptyPayload = (kind: AssessmentKind): Assessment => kind === "test"
  ? { name: "", q: [{ q: "", a: ["", "", "", ""] }] }
  : { name: "", dirs: ["", ""], q: [{ q: "", o: [["", 0], ["", 1]] }] };

function validPayload(kind: AssessmentKind, value: unknown): value is Assessment {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (typeof item.name !== "string" || !Array.isArray(item.q) || item.q.length === 0) return false;
  if (kind === "test") return item.q.every((q) => !!q && typeof q === "object" && typeof (q as Record<string, unknown>).q === "string" && Array.isArray((q as Record<string, unknown>).a) && ((q as Record<string, unknown>).a as unknown[]).length >= 2);
  return Array.isArray(item.dirs) && item.dirs.length >= 2 && item.q.every((q) => !!q && typeof q === "object" && typeof (q as Record<string, unknown>).q === "string" && Array.isArray((q as Record<string, unknown>).o) && ((q as Record<string, unknown>).o as unknown[]).length >= 2);
}

export default function AdminAssessments() {
  const { t } = useI18n();
  const [kind, setKind] = useState<AssessmentKind>("test");
  const [items, setItems] = useState<AssessmentCatalog>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [json, setJson] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setErr(null);
    try {
      setItems(await loadAssessmentCatalog(kind));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [kind]);
  useEffect(() => { setSelected(null); setId(""); setJson(""); load(); }, [kind, load]);

  function choose(itemId: string) {
    setSelected(itemId);
    setId(itemId);
    setJson(JSON.stringify(items[itemId], null, 2));
    setErr(null);
  }

  function create() {
    setSelected(null);
    setId("");
    setJson(JSON.stringify(emptyPayload(kind), null, 2));
    setErr(null);
  }

  async function save() {
    const normalizedId = id.trim().toLowerCase().replace(/\s+/g, "-");
    if (!normalizedId) { setErr(t("ID енгізіңіз.|Введите ID.|Enter an ID.")); return; }
    let payload: unknown;
    try { payload = JSON.parse(json); } catch { setErr(t("JSON пішімі қате.|Неверный формат JSON.|Invalid JSON format.")); return; }
    if (!validPayload(kind, payload)) { setErr(t("Құрылым толық емес. Анықтамаға сай JSON енгізіңіз.|Структура неполная. Проверьте формат JSON.|The structure is incomplete. Check the JSON shape.")); return; }
    setBusy(true);
    setErr(null);
    try {
      await saveAssessment(kind, normalizedId, payload);
      setSelected(normalizedId);
      setId(normalizedId);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected || !confirm(t("Бұл тесті немесе сауалнаманы өшіресіз бе?|Удалить этот тест или опрос?|Delete this test or survey?"))) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteAssessment(kind, selected);
      setSelected(null); setId(""); setJson("");
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const rows = Object.entries(items);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("Тесттер мен сауалнамалар|Тесты и опросы|Tests and surveys")}</h1>
          <p className="mt-1 text-sm text-mute">{t("Қосу, толық өзгерту немесе сайттан алып тастау.|Добавляйте, редактируйте или удаляйте материалы сайта.|Add, edit, or remove items shown on the site.")}</p>
        </div>
        <div className="flex gap-2">
          {(["test", "survey"] as AssessmentKind[]).map((value) => <button key={value} onClick={() => setKind(value)} className={"btn " + (kind === value ? "btn-p" : "btn-s")}>{value === "test" ? t("Тесттер|Тесты|Tests") : t("Сауалнамалар|Опросы|Surveys")}</button>)}
        </div>
        <button className="btn btn-p" onClick={create}>{kind === "test" ? t("Тест қосу|Добавить тест|Add test") : t("Сауалнама қосу|Добавить опрос|Add survey")}</button>
        <div className="grid gap-2">
          {rows.map(([itemId, item]) => <button key={itemId} onClick={() => choose(itemId)} className={"card p-4 text-left hover:bg-soft " + (selected === itemId ? "border-brand" : "")}><span className="text-xs text-mute">{itemId}</span><span className="mt-1 block font-semibold">{t(item.name)}</span><span className="text-xs text-mute">{item.q.length} {t("сұрақ|вопросов|questions")}</span></button>)}
          {!rows.length && !busy && <p className="card p-4 text-sm text-mute">{t("Әзірге материал жоқ.|Пока материалов нет.|No items yet.")}</p>}
        </div>
      </section>

      <section className="card grid content-start gap-3 p-5">
        <h2 className="text-lg font-bold">{selected ? t("Материалды өңдеу|Редактировать материал|Edit item") : t("Жаңа материал|Новый материал|New item")}</h2>
        <label className="grid gap-1 text-sm">ID
          <input className="inp" value={id} onChange={(e) => setId(e.target.value)} placeholder="react-basics" />
        </label>
        <p className="text-sm text-mute">{kind === "test"
          ? t("JSON үлгісі: { name: 'Қазақша|Русский|English', q: [{ q: 'Сұрақ|Вопрос|Question', a: ['Дұрыс жауап|...', 'Қате жауап|...'] }] }. Бірінші жауап дұрыс деп есептеледі.|JSON-формат: объект с name и массивом q; у каждого вопроса есть q и массив a. Первый ответ правильный.|JSON shape: name plus q array; each question has q and an a array. The first answer is correct.")
          : t("JSON үлгісі: { name: '...', dirs: ['Нәтиже|...', 'Нәтиже 2|...'], q: [{ q: 'Сұрақ|...', o: [['Жауап|...', 0], ['Жауап 2|...', 1]] }] }. Жауап соңындағы сан dirs индексі.|JSON-формат: name, dirs и q; варианты o — пары [текст, индекс результата].|JSON shape: name, dirs, and q; each o choice is [text, result index].")}</p>
        <textarea className="inp min-h-[420px] font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} placeholder="{}" />
        {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{err}</p>}
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-p" disabled={busy || !json.trim()} onClick={save}>{t("Сақтау|Сохранить|Save")}</button>
          {selected && <button className="btn btn-s text-red-500" disabled={busy} onClick={remove}>{t("Өшіру|Удалить|Delete")}</button>}
        </div>
      </section>
    </div>
  );
}
