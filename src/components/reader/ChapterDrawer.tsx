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
    <div className="fixed inset-0 z-50 bg-black/30">
      <div
        ref={drawerRef}
        className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-[var(--background)] border-r-4 border-[var(--border)] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b-4 border-[var(--border)]">
          <h2 className="font-black uppercase tracking-tight text-sm">
            Table of Contents
          </h2>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 font-bold hover:text-[var(--accent)] transition-colors duration-200"
          >
            &times;
          </button>
        </div>

        <nav className="p-2">
          {chapters.map((ch) => (
            <button
              key={ch.chapterNumber}
              ref={ch.chapterNumber === currentChapter ? activeRef : null}
              onClick={() => {
                onSelect(ch.chapterNumber);
                onClose();
              }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors duration-200 ${
                ch.chapterNumber === currentChapter
                  ? "border-l-4 border-l-[var(--accent)] font-bold bg-[var(--muted)]"
                  : "hover:bg-[var(--foreground)] hover:text-[var(--background)]"
              }`}
            >
              <span className="text-[var(--muted-foreground)] mr-2 text-xs uppercase tracking-widest">
                {String(ch.chapterNumber).padStart(2, "0")}.
              </span>
              {ch.title || `Chapter ${ch.chapterNumber}`}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
