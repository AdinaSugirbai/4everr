"use client";
import { useState } from "react";
import { Workspace, workspaceKey, initialWorkspace } from "./workspace";
import { useBrowserStorage } from "./use-browser-storage";
export function useWorkspace() {
  const [data, ready, persist] = useBrowserStorage(
    workspaceKey,
    initialWorkspace,
  );
  const [error, setError] = useState("");
  function save(next: Workspace) {
    try {
      persist(next);
      setError("");
      return true;
    } catch {
      setError(
        "Сақтау мүмкін болмады. Браузердегі жергілікті сақтауға рұқсатты тексер.",
      );
      return false;
    }
  }
  return { data, ready, error, save };
}
