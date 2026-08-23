"use client";

import { useEffect, useRef, useState } from "react";

interface ChapterInfo {
  chapterNumber: number;
  title: string;
}

interface BookmarkInfo {
  id: string;
  chapterNumber: number;
  scrollPosition: number;
  label: string;
}

interface ChapterDrawerProps {
  chapters: ChapterInfo[];
  bookmarks: BookmarkInfo[];
  currentChapter: number;
  open: boolean;
  onClose: () => void;
  onSelect: (chapter: number) => void;
  onGoToBookmark: (bookmark: BookmarkInfo) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export default function ChapterDrawer({
  chapters,
  bookmarks,
  currentChapter,
  open,
  onClose,
  onSelect,
  onGoToBookmark,
  onDeleteBookmark,
}: ChapterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"chapters" | "bookmarks">("chapters");

  // Scroll active chapter into view when drawer opens
  useEffect(() => {
    if (open && tab === "chapters" && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div
        ref={drawerRef}
        className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
      >
        {/* Tabs */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-stretch">
            {(
              [
                ["chapters", `Chapters`],
                ["bookmarks", `Bookmarks${bookmarks.length > 0 ? ` (${bookmarks.length})` : ""}`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 px-4 py-4 font-display text-sm font-semibold italic transition-colors duration-150 ${
                  tab === key
                    ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                    : "border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={onClose}
              aria-label="Close"
              className="px-4 text-xl leading-none text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--foreground)]"
            >
              &times;
            </button>
          </div>
        </div>

        {tab === "chapters" ? (
          <nav className="overflow-y-auto p-3">
            {chapters.map((ch) => (
              <button
                key={ch.chapterNumber}
                ref={ch.chapterNumber === currentChapter ? activeRef : null}
                onClick={() => {
                  onSelect(ch.chapterNumber);
                  onClose();
                }}
                className={`flex w-full items-baseline rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                  ch.chapterNumber === currentChapter
                    ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <span className="font-display mr-2.5 w-6 shrink-0 text-xs italic text-[var(--muted-foreground)]/70">
                  {String(ch.chapterNumber).padStart(2, "0")}
                </span>
                <span className="flex-1">{ch.title || `Chapter ${ch.chapterNumber}`}</span>
              </button>
            ))}
          </nav>
        ) : (
          <div className="overflow-y-auto p-3">
            {bookmarks.length === 0 ? (
              <div className="px-3 py-12 text-center">
                <p className="font-display mb-1.5 text-base italic text-[var(--muted-foreground)]">
                  No bookmarks yet
                </p>
                <p className="text-xs leading-relaxed text-[var(--muted-foreground)]/80">
                  Press <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[10px]">B</kbd> while reading to mark a spot.
                </p>
              </div>
            ) : (
              [...bookmarks]
                .sort((a, b) => b.chapterNumber - a.chapterNumber)
                .map((bm) => (
                  <div
                    key={bm.id}
                    className="group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-[var(--muted)]"
                  >
                    <button
                      onClick={() => {
                        onGoToBookmark(bm);
                        onClose();
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm text-[var(--foreground)]">
                        {bm.label}
                      </span>
                      <span className="font-display text-xs italic text-[var(--muted-foreground)]">
                        Chapter {bm.chapterNumber}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      aria-label="Delete bookmark"
                      className="shrink-0 rounded-full px-2 py-1 text-sm leading-none text-[var(--muted-foreground)] opacity-0 transition-all duration-150 hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] focus:opacity-100 group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
