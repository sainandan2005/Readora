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
    <main className="max-w-5xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
      <div className="flex items-end justify-between mb-8 border-b-4 border-[var(--border)] pb-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          My Bookshelf
        </h1>
        <Link
          href="/library"
          className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
        >
          Browse Library &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-[var(--muted)] border-2 border-[var(--muted)]" />
              <div className="mt-2 h-4 bg-[var(--muted)] w-3/4" />
              <div className="mt-1 h-3 bg-[var(--muted)] w-1/2" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 border-2 border-[var(--border)]">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-6">
            Your bookshelf is empty.
          </p>
          <Link
            href="/library"
            className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wide text-xs hover:bg-[var(--accent)] transition-colors duration-200 inline-block"
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
