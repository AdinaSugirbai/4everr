"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { jobs, careers, formats } from "@/lib/data";
import { ButtonLink } from "./ui";
export function JobList() {
  const router = useRouter(),
    params = useSearchParams();
  const [text, setText] = useState(params.get("search") || "");
  function change(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push("/jobs" + (p.size ? "?" + p.toString() : ""), {
      scroll: false,
    });
  }
  const q = (params.get("search") || "").toLowerCase();
  const found = jobs.filter(
    (j) =>
      (j.title + " " + j.company).toLowerCase().includes(q) &&
      (!params.get("level") || params.get("level") === j.level) &&
      (!params.get("format") || params.get("format") === j.format) &&
      (!params.get("career") || params.get("career") === j.career),
  );
  return (
    <>
      <form
        className="flex gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          change("search", text);
        }}
      >
        <input
          aria-label="Вакансия іздеу"
          placeholder="Лауазым немесе компания"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary">Іздеу</button>
      </form>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <select
          aria-label="Деңгей"
          value={params.get("level") || ""}
          onChange={(e) => change("level", e.target.value)}
        >
          <option value="">Барлық деңгей</option>
          <option>Junior</option>
          <option value="Intern">Тағылымдама</option>
        </select>
        <select
          aria-label="Формат"
          value={params.get("format") || ""}
          onChange={(e) => change("format", e.target.value)}
        >
          <option value="">Барлық формат</option>
          {Object.entries(formats).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          aria-label="Бағыт"
          value={params.get("career") || ""}
          onChange={(e) => change("career", e.target.value)}
        >
          <option value="">Барлық бағыт</option>
          {careers.map((c) => (
            <option value={c.slug} key={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm mb-4" aria-live="polite">
        {found.length} демо-вакансия
      </p>
      <div className="grid gap-3">
        {found.map((j) => (
          <article
            className="card flex flex-wrap items-center gap-4"
            key={j.id}
            data-testid="job-card"
          >
            <span className="w-12 h-12 rounded-xl bg-soft grid place-items-center text-lg shrink-0">
              {j.company[0]}
            </span>
            <div className="flex-1 min-w-44">
              <h3 className="text-lg mb-2">{j.title}</h3>
              <p className="text-xs">
                {j.company} · {j.city} · {formats[j.format]}
              </p>
              <span className="chip mt-2">{j.level}</span>
            </div>
            <div>
              <strong className="font-normal">{j.salary}</strong>
              <p className="text-xs">айына · демо</p>
            </div>
            <ButtonLink href={"/jobs/" + j.id}>Ашу</ButtonLink>
          </article>
        ))}
      </div>
      {!found.length && (
        <p className="card text-center">
          Вакансия табылмады. Сүзгілерді өзгертіп көр.
        </p>
      )}
    </>
  );
}
export function ApplyButton() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setShow(true)}>
        Өтінім беру →
      </button>
      {show && (
        <p role="status" className="text-sm mt-4">
          Бұл UI демо. Нақты өтінім жіберілмейді. Толық нұсқада кандидат
          аккаунты қажет.
        </p>
      )}
    </>
  );
}
export function EmployerForm() {
  const [ready, setReady] = useState(false);
  return (
    <form
      className="card max-w-3xl"
      onSubmit={(e) => {
        e.preventDefault();
        setReady(true);
      }}
    >
      <label className="input-label">
        Вакансия атауы
        <input
          name="title"
          required
          maxLength={100}
          placeholder="Junior Frontend Developer"
        />
      </label>
      <label className="input-label">
        IT бағыты
        <select>
          {careers.map((c) => (
            <option key={c.slug}>{c.title}</option>
          ))}
        </select>
      </label>
      <label className="input-label">
        Жұмыс форматы
        <select>
          {Object.values(formats).map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </label>
      <label className="input-label">
        Жұмыс туралы
        <textarea
          required
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="Міндеттер мен талаптар"
        />
      </label>
      <button className="btn btn-primary">Демо жобаны тексеру →</button>
      {ready && (
        <p role="status" className="mt-5">
          Демо жоба дайын. Толық нұсқада PENDING күйімен модерацияға жіберіледі.
          Қазір ештеңе жарияланған жоқ.
        </p>
      )}
    </form>
  );
}
