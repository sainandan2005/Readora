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
    <main className="max-w-3xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
      <div className="flex items-end justify-between mb-8 border-b-4 border-[var(--border)] pb-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Reading Stats
        </h1>
        <Link
          href="/library"
          className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
        >
          Library &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse p-8 border-2 border-[var(--muted)]">
              <div className="h-10 bg-[var(--muted)] w-16 mb-2" />
              <div className="h-4 bg-[var(--muted)] w-24" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Books Completed" value={stats.booksCompleted} />
          <StatCard label="In Progress" value={stats.booksInProgress} />
          <StatCard label="Chapters Read" value={stats.totalChaptersRead} />
          <StatCard label="Total Books Started" value={stats.totalBooks} />
          <StatCard
            label="Reading Streak"
            value={stats.currentStreak}
            suffix={stats.currentStreak === 1 ? " day" : " days"}
          />
        </div>
      ) : (
        <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] text-center py-16">
          Could not load stats. Try again later.
        </p>
      )}

      {stats && stats.totalBooks === 0 && (
        <div className="text-center py-16 border-2 border-[var(--border)] mt-8">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-6">
            No reading activity yet.
          </p>
          <Link
            href="/library"
            className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wide text-xs hover:bg-[var(--accent)] transition-colors duration-200 inline-block"
          >
            Start Reading
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
    <div className="p-8 border-2 border-[var(--border)] group hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200">
      <p className="text-4xl md:text-5xl font-black tracking-tighter group-hover:scale-105 transition-transform duration-200 origin-left">
        {value}
        {suffix && (
          <span className="text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--background)] ml-1 transition-colors duration-200">
            {suffix}
          </span>
        )}
      </p>
      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--background)] mt-2 transition-colors duration-200">
        {label}
      </p>
    </div>
  );
}
