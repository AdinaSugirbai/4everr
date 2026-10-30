"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const eventName = "4everr-browser-storage";

/** Hydrates browser-only demo state without changing the server snapshot. */
export function useBrowserStorage<T>(key: string, fallback: T) {
  const subscribe = useCallback((listener: () => void) => {
    window.addEventListener("storage", listener);
    window.addEventListener(eventName, listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener(eventName, listener);
    };
  }, []);
  const snapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => undefined);
  const value = useMemo<T>(() => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const save = useCallback(
    (next: T) => {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(eventName));
    },
    [key],
  );
  return [value, raw !== undefined, save] as const;
}
