"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BookGrid from "@/components/library/BookGrid";

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImageUrl: string;
  chapterCount: number;
}

export default function BookshelfPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookshelf = useCallback(async () => {
    try {
      const res = await fetch("/api/bookshelf");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookshelf();
  }, [fetchBookshelf]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Saved for later
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            My Bookshelf
          </h1>
        </div>
        <Link
          href="/library"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Browse Library →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-[var(--muted)]" />
              <div className="mt-3 h-4 w-3/4 rounded bg-[var(--muted)]" />
              <div className="mt-1.5 h-3 w-1/2 rounded bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center">
          <p className="font-display mb-2 text-lg italic text-[var(--muted-foreground)]">
            Your bookshelf is empty.
          </p>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]/80">
            Save books while browsing to build your collection.
          </p>
          <Link
            href="/library"
            className="inline-block rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:bg-[var(--accent-hover)]"
          >
            Browse the Library
          </Link>
        </div>
      ) : (
        <BookGrid books={books} />
      )}
    </main>
  );
}
