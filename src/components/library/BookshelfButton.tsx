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
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
        saved
          ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {saved ? "✓ On your bookshelf" : "+ Save to bookshelf"}
    </button>
  );
}
