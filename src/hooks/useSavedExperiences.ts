"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "savedExperiences";

function getStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSavedExperiences() {
  const [savedIds, setSavedIds] = useState<string[]>(getStoredIds);

  useEffect(() => {
    const sync = () => setSavedIds(getStoredIds());
    window.addEventListener("storage", sync);
    window.addEventListener("savedExperiencesChanged", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("savedExperiencesChanged", sync);
    };
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  );

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("savedExperiencesChanged"));
      return next;
    });
  }, []);

  return { savedIds, isSaved, toggleSaved };
}
