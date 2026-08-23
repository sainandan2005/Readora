"use client";

import { useEffect, useRef } from "react";

interface ChapterInfo {
  chapterNumber: number;
  title: string;
}

interface ChapterDrawerProps {
  chapters: ChapterInfo[];
  currentChapter: number;
  open: boolean;
  onClose: () => void;
  onSelect: (chapter: number) => void;
}

export default function ChapterDrawer({
  chapters,
  currentChapter,
  open,
  onClose,
  onSelect,
}: ChapterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active chapter into view when drawer opens
  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
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
        className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <h2 className="font-display text-lg font-semibold italic">Contents</h2>
          <button
            onClick={onClose}
            className="rounded-full px-2.5 py-1 text-xl leading-none text-[var(--muted-foreground)] transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            &times;
          </button>
        </div>

        <nav className="p-3">
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
      </div>
    </div>
  );
}
