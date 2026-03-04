"use client";

import { useEffect, useRef } from "react";

export function useTrackExperienceView(
  userId: string | undefined,
  experienceId: string | undefined
) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!userId || !experienceId || tracked.current) return;
    tracked.current = true;

    const timer = setTimeout(() => {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId }),
      }).catch(() => {
        tracked.current = false;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [userId, experienceId]);
}
