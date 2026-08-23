"use client";

import { useCallback, useEffect, useState } from "react";

interface BookshelfButtonProps {
  bookId: string;
  initialSaved: boolean;
}

export default function BookshelfButton({ bookId, initialSaved }: BookshelfButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookshelf", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) {
        setSaved(!saved);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [bookId, saved]);

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors duration-200 ${
        saved
          ? "bg-[var(--foreground)] text-[var(--background)] border-2 border-[var(--border)]"
          : "border-2 border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
      } disabled:opacity-50`}
    >
      {saved ? "Saved" : "Save to Bookshelf"}
    </button>
  );
}
