"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const d = saved ? saved === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    setDark(d);
    document.documentElement.dataset.theme = d ? "dark" : "light";
  }, []);

  function toggle() {
    const d = !dark;
    setDark(d);
    document.documentElement.dataset.theme = d ? "dark" : "light";
    localStorage.setItem("theme", d ? "dark" : "light");
  }

  return (
    <button onClick={toggle} aria-label="Жарық/қараңғы режимді ауыстыру" className="w-9 h-9 rounded-full border border-line grid place-items-center hover:bg-soft">
      {dark ? "☀️" : "☾"}
    </button>
  );
}
