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
    <main className="max-w-5xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
      <div className="flex items-end justify-between mb-8 border-b-4 border-[var(--border)] pb-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Library
        </h1>
        <Link
          href="/bookshelf"
          className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
        >
          My Bookshelf &rarr;
        </Link>
      </div>

      {continueReading.length > 0 && !isFiltered && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4">
            <span className="text-[var(--accent)]">01.</span>{" "}
            Continue Reading
          </h2>
          <BookGrid
            books={continueReading}
            progressMap={progressMap}
          />
        </section>
      )}

      {recentBooks.length > 0 && !isFiltered && page === 1 && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4">
            <span className="text-[var(--accent)]">02.</span>{" "}
            Recently Added
          </h2>
          <BookGrid books={recentBooks} progressMap={progressMap} />
        </section>
      )}

      <section>
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-[var(--muted)] border-2 border-[var(--muted)]" />
                <div className="mt-2 h-4 bg-[var(--muted)] w-3/4" />
                <div className="mt-1 h-3 bg-[var(--muted)] w-1/2" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 border-2 border-[var(--border)]">
            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
              {searchQuery
                ? `No books found for "${searchQuery}"`
                : "No books in the library yet."}
            </p>
            {isFiltered && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4">
              <span className="text-[var(--accent)]">03.</span>{" "}
              {searchQuery ? "Search Results" : "All Books"}
            </h2>
            <BookGrid books={books} progressMap={progressMap} />
          </>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 text-xs font-bold uppercase tracking-wide border-2 border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 text-xs font-bold uppercase tracking-wide border-2 border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
