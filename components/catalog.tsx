"use client";
import { useState } from "react";
import { careers } from "@/lib/data";
import { CareerCard } from "./ui";
export function Catalog() {
  const [search, setSearch] = useState(""),
    [skill, setSkill] = useState("");
  const found = careers.filter(
    (c) =>
      (c.title + " " + c.skills.join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!skill || c.skills.includes(skill)),
  );
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <input
          aria-label="Мамандық іздеу"
          placeholder="Мамандық немесе дағды іздеу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Дағды сүзгісі"
          className="sm:max-w-56"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="">Барлық дағды</option>
          {["JavaScript", "Java", "SQL", "Git", "Figma", "Python"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <p className="text-xs mb-4" aria-live="polite">
        {found.length} бағыт
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {found.map((c) => (
          <CareerCard key={c.slug} career={c} />
        ))}
      </div>
      {!found.length && (
        <p className="card text-center">
          Бағыт табылмады. Іздеу шарттарын өзгертіп көр.
        </p>
      )}
    </>
  );
}
