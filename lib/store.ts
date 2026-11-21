"use client";
import { useEffect, useState } from "react";

export function useLocal<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    setVal(initial);
    try {
      const s = localStorage.getItem(key);
      if (s) setVal(JSON.parse(s));
    } catch {}
    const on = (e: StorageEvent) => {
      if (e.key !== key) return;
      try { setVal(e.newValue ? JSON.parse(e.newValue) : initial); } catch { setVal(initial); }
    };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, [key]);
  const save = (v: T) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, save];
}
