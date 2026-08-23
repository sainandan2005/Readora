"use client";

import { useCallback, useEffect, useRef } from "react";

interface AutoSaveConfig {
  bookId: string;
  chapter: number;
  enabled: boolean;
}

export default function useAutoSave({ bookId, chapter, enabled }: AutoSaveConfig) {
  const lastSavedRef = useRef<string>("");
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(
    async (scrollPosition: number, percentage: number) => {
      const key = `${bookId}-${chapter}-${Math.round(scrollPosition)}-${Math.round(percentage)}`;
      if (key === lastSavedRef.current) return;
      lastSavedRef.current = key;

      try {
        const body = JSON.stringify({ bookId, chapter, scrollPosition, percentage });

        // Use sendBeacon if available and document is hidden
        if (document.hidden && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/progress",
            new Blob([body], { type: "application/json" })
          );
          return;
        }

        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch {
        // Silently fail — will retry on next save
      }
    },
    [bookId, chapter]
  );

  const getScrollData = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    return { scrollPosition: scrollTop, percentage: Math.min(100, percentage) };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Throttled save: every 5 seconds during scrolling
    const handleScroll = () => {
      if (!throttleTimerRef.current) {
        throttleTimerRef.current = setTimeout(() => {
          const { scrollPosition, percentage } = getScrollData();
          saveProgress(scrollPosition, percentage);
          throttleTimerRef.current = null;
        }, 5000);
      }

      // Debounce: save once scrolling stops (1s after last scroll)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const { scrollPosition, percentage } = getScrollData();
        saveProgress(scrollPosition, percentage);
      }, 1000);
    };

    // Save on tab hide
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const { scrollPosition, percentage } = getScrollData();
        saveProgress(scrollPosition, percentage);
      }
    };

    // Save on page unload
    const handleBeforeUnload = () => {
      const { scrollPosition, percentage } = getScrollData();
      const body = JSON.stringify({ bookId, chapter, scrollPosition, percentage });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/progress",
          new Blob([body], { type: "application/json" })
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [enabled, bookId, chapter, saveProgress, getScrollData]);

  return { saveProgress };
}
