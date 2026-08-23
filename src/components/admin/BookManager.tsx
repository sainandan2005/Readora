"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface AdminBook {
  id: string;
  gutenbergId: number;
  title: string;
  author: string;
  slug: string;
  status: string;
  chapterCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-[var(--accent-soft)] text-[var(--accent)]",
  failed: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
  processing: "bg-[var(--gold)]/10 text-[var(--gold)]",
  pending: "bg-[var(--gold)]/10 text-[var(--gold)]",
};

export default function BookManager() {
  const { data: session } = useSession();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isAdmin = session?.user?.role === "admin";

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(Array.isArray(data.books) ? data.books : []);
      } else {
        setError("Failed to load books.");
      }
    } catch {
      setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function handleDelete(book: AdminBook) {
    setDeletingId(book.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== book.id));
        setConfirmingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete book.");
      }
    } catch {
      setError("Failed to delete book.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <h3 className="font-display mb-4 text-xl font-semibold italic text-[var(--muted-foreground)]">
        Library books
      </h3>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-5">
          <p className="text-sm text-[var(--destructive)]">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border-strong)] py-12 text-center text-sm italic text-[var(--muted-foreground)]">
          No books in the library yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          {books.map((book, i) => (
            <div
              key={book.id}
              className={`flex items-center gap-4 px-5 py-3.5 ${
                i > 0 ? "border-t border-[var(--border)]" : ""
              }`}
            >
              <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                #{book.gutenbergId}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/book/${book.slug}`}
                  className="block truncate text-sm font-semibold hover:text-[var(--accent)]"
                  title={book.title}
                >
                  {book.title}
                </Link>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  {book.author} · {book.chapterCount} chapter
                  {book.chapterCount !== 1 ? "s" : ""}
                </p>
              </div>
              <span
                className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline ${
                  STATUS_STYLES[book.status] ?? ""
                }`}
              >
                {book.status}
              </span>

              {isAdmin &&
                (confirmingId === book.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(book)}
                      disabled={deletingId === book.id}
                      className="rounded-full bg-[var(--destructive)] px-3 py-1.5 text-xs font-semibold text-[var(--destructive-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {deletingId === book.id ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      disabled={deletingId === book.id}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(book.id)}
                    className="shrink-0 rounded-full border border-transparent p-2 text-[var(--muted-foreground)] transition-colors duration-200 hover:border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
                    title={`Delete "${book.title}"`}
                    aria-label={`Delete ${book.title}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
