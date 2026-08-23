"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BookGrid from "@/components/library/BookGrid";
import SearchBar from "@/components/library/SearchBar";

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImageUrl: string;
  chapterCount: number;
}

interface ContinueReadingBook extends Book {
  progress: number;
  lastReadAt: string;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [continueReading, setContinueReading] = useState<ContinueReadingBook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", p.toString());

      const res = await fetch(`/api/books?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(Array.isArray(data.books) ? data.books : []);
        setTotalPages(data.totalPages || 1);
      } else {
        setBooks([]);
        setTotalPages(1);
      }
    } catch {
      setBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books?page=1");
      if (res.ok) {
        const data = await res.json();
        const books = Array.isArray(data.books) ? data.books : [];
        setRecentBooks(books.slice(0, 5));
      }
    } catch {
      // Silently fail
    }
  }, []);

  const fetchContinueReading = useCallback(async () => {
    try {
      const res = await fetch("/api/progress/continue-reading");
      if (res.ok) {
        const data = await res.json();
        setContinueReading(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchBooks(searchQuery, page);
  }, [searchQuery, page, fetchBooks]);

  useEffect(() => {
    fetchRecentBooks();
  }, [fetchRecentBooks]);

  useEffect(() => {
    if (session?.user) {
      fetchContinueReading();
    }
  }, [session, fetchContinueReading]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const progressMap: Record<string, number> = {};
  for (const item of continueReading) {
    progressMap[item.id] = item.progress;
  }

  const isFiltered = !!searchQuery;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Browse
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            The Library
          </h1>
        </div>
        <Link
          href="/bookshelf"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          My Bookshelf →
        </Link>
      </div>

      {continueReading.length > 0 && !isFiltered && (
        <section className="mb-12">
          <h2 className="font-display mb-4 text-xl font-semibold italic text-[var(--muted-foreground)]">
            Continue reading
          </h2>
          <BookGrid
            books={continueReading}
            progressMap={progressMap}
          />
        </section>
      )}

      {recentBooks.length > 0 && !isFiltered && page === 1 && (
        <section className="mb-12">
          <h2 className="font-display mb-4 text-xl font-semibold italic text-[var(--muted-foreground)]">
            Recently added
          </h2>
          <BookGrid books={recentBooks} progressMap={progressMap} />
        </section>
      )}

      <section>
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
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
              {searchQuery
                ? `Nothing found for “${searchQuery}”`
                : "The shelves are empty — for now."}
            </p>
            {isFiltered && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <h2 className="font-display mb-4 text-xl font-semibold italic text-[var(--muted-foreground)]">
              {searchQuery ? "Search results" : "All books"}
            </h2>
            <BookGrid books={books} progressMap={progressMap} />
          </>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-[var(--muted-foreground)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
