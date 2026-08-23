"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  booksCompleted: number;
  booksInProgress: number;
  totalChaptersRead: number;
  totalBooks: number;
  currentStreak: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8 lg:py-14">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Your journey
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Reading Stats
          </h1>
        </div>
        <Link
          href="/library"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Library →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[var(--border)] p-8">
              <div className="h-10 w-16 rounded bg-[var(--muted)]" />
              <div className="mt-3 h-3 w-24 rounded bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Books completed" value={stats.booksCompleted} />
          <StatCard label="In progress" value={stats.booksInProgress} />
          <StatCard label="Chapters read" value={stats.totalChaptersRead} />
          <StatCard label="Books started" value={stats.totalBooks} />
          <StatCard
            label="Reading streak"
            value={stats.currentStreak}
            suffix={stats.currentStreak === 1 ? " day" : " days"}
          />
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">
          Could not load stats. Try again later.
        </p>
      )}

      {stats && stats.totalBooks === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center">
          <p className="font-display mb-6 text-lg italic text-[var(--muted-foreground)]">
            Every great reader started somewhere.
          </p>
          <Link
            href="/library"
            className="inline-block rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:bg-[var(--accent-hover)]"
          >
            Pick your first book
          </Link>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <p className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </p>
    </div>
  );
}
