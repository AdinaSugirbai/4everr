"use client";
import { useState } from "react";
import { interestQuestions, interestOptions, recommend } from "@/lib/data";
import { ButtonLink, Notice } from "./ui";
export function InterestQuiz() {
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<number[]>([]),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  if (done) {
    const ranked = recommend(answers);
    return (
      <>
        <div className="subhead">
          <span className="eyebrow">САУАЛНАМА НӘТИЖЕСІ</span>
          <h1>Саған жақын бағыттар.</h1>
          <p>
            Қызығушылығың — бастапқы нүкте. Бағыттарды зерттеп, өз таңдауыңды
            жаса.
          </p>
        </div>
        <Notice>
          Пайыздар демонстрациялық салмақтармен есептелді. Бұл кәсіби бағдарлау
          қорытындысы немесе біліктілік бағасы емес.
        </Notice>
        <div className="grid md:grid-cols-3 gap-4">
          {ranked.slice(0, 3).map(({ career: c, percent }) => (
            <article className="card" key={c.slug}>
              <span className="eyebrow">Қызығушылық сәйкестігі</span>
              <div className="flex justify-between items-center my-6">
                <h2>{c.title}</h2>
                <strong className="text-2xl text-[#527a32]">{percent}%</strong>
              </div>
              <p className="text-sm mb-6">{c.description}</p>
              <ButtonLink primary href={"/careers/" + c.slug}>
                Бағытты зерттеу
              </ButtonLink>
            </article>
          ))}
        </div>
        <div className="card mt-5">
          <h2 className="mb-7">Барлық бағыт</h2>
          {ranked.map(({ career: c, percent }) => (
            <div key={c.slug} className="mb-5">
              <div className="flex justify-between mb-3 text-sm">
                <span>{c.title}</span>
                <span>{percent}%</span>
              </div>
              <div className="progress">
                <span style={{ width: percent + "%" }} />
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn mt-6"
          onClick={() => {
            setDone(false);
            setIndex(0);
            setAnswers([]);
          }}
        >
          Қайта өту
        </button>
      </>
    );
  }
  return (
    <section className="max-w-3xl mx-auto py-12">
      <div className="flex justify-between text-xs gap-3">
        <span className="eyebrow">Қызығушылық сауалнамасы</span>
        <span>{index + 1} / 12</span>
      </div>
      <div className="progress mt-5 mb-8">
        <span style={{ width: ((index + 1) / 12) * 100 + "%" }} />
      </div>
      <h2 className="leading-snug">{interestQuestions[index]}</h2>
      <p className="my-4 text-sm">
        Өзіңе ең жақын нұсқаны таңда. Дұрыс немесе қате жауап жоқ.
      </p>
      <fieldset className="grid gap-3">
        <legend className="sr-only">Жауап нұсқалары</legend>
        {interestOptions.map((o, i) => (
          <label className="option" key={i}>
            <input
              type="radio"
              name="interest"
              checked={answers[index] === i}
              onChange={() => {
                const next = [...answers];
                next[index] = i;
                setAnswers(next);
                setError("");
              }}
            />
            {o[index % 4]}
          </label>
        ))}
      </fieldset>
      <div className="flex justify-between gap-3 mt-6">
        <button
          className="btn"
          disabled={index === 0}
          onClick={() => {
            setIndex(index - 1);
            setError("");
          }}
        >
          ← Артқа
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (answers[index] === undefined) {
              setError("Жауап нұсқасын таңда.");
              return;
            }
            if (index === 11) setDone(true);
            else setIndex(index + 1);
          }}
        >
          {index === 11 ? "Нәтижені көру" : "Келесі сұрақ →"}
        </button>
      </div>
      <p role="status" className="text-[#a23829] mt-3">
        {error}
      </p>
      <Notice>
        12 сұрақ пен жауап салмақтары — интерфейсті тексеруге арналған үлгі.
        Нақты ұсыныс алгоритмі серверге кейін қосылады.
      </Notice>
    </section>
  );
}
