"use client";

interface ReaderToolbarProps {
  bookTitle: string;
  currentChapter: number;
  totalChapters: number;
  fontSize: number;
  fontFamily: "serif" | "sans-serif";
  readingTime: number;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: "serif" | "sans-serif") => void;
  onChapterChange: (chapter: number) => void;
  onBack: () => void;
  onToggleToc: () => void;
  onAddBookmark: () => void;
  onShowShortcuts: () => void;
  bookmarkCount: number;
}

export default function ReaderToolbar({
  bookTitle,
  currentChapter,
  totalChapters,
  fontSize,
  fontFamily,
  readingTime,
  onFontSizeChange,
  onFontFamilyChange,
  onChapterChange,
  onBack,
  onToggleToc,
  onAddBookmark,
  onShowShortcuts,
  bookmarkCount,
}: ReaderToolbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            onClick={onBack}
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            title="Back to book"
          >
            ←
          </button>
          <button
            onClick={onToggleToc}
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            title="Table of Contents (T)"
          >
            Chapters
          </button>
          <span className="font-display hidden truncate text-sm italic text-[var(--muted-foreground)] sm:inline">
            {bookTitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {readingTime > 0 && (
            <>
              <span className="hidden whitespace-nowrap text-xs text-[var(--muted-foreground)] sm:inline">
                {readingTime} min
              </span>
              <div className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:block" />
            </>
          )}

          <button
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="px-2 py-1 text-sm font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)] disabled:opacity-30"
            title="Previous chapter (Left arrow)"
          >
            ‹
          </button>
          <span className="whitespace-nowrap text-xs font-medium tabular-nums text-[var(--muted-foreground)]">
            {currentChapter} / {totalChapters}
          </span>
          <button
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={currentChapter >= totalChapters}
            className="px-2 py-1 text-sm font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)] disabled:opacity-30"
            title="Next chapter (Right arrow)"
          >
            ›
          </button>

          <div className="mx-1 h-4 w-px bg-[var(--border)]" />

          <button
            onClick={onAddBookmark}
            className="relative rounded-full px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--gold)]"
            title="Add bookmark (B)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="inline">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--gold)] text-[9px] font-bold text-white">
                {bookmarkCount}
              </span>
            )}
          </button>

          <div className="mx-1 h-4 w-px bg-[var(--border)]" />

          <button
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
            className="px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)]"
            title="Decrease font size"
          >
            A−
          </button>
          <button
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
            className="px-2 py-1 text-base font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)]"
            title="Increase font size"
          >
            A+
          </button>

          <div className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:block" />

          <button
            onClick={() =>
              onFontFamilyChange(fontFamily === "serif" ? "sans-serif" : "serif")
            }
            className="hidden rounded-full px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)] sm:inline"
            title={`Switch to ${fontFamily === "serif" ? "sans-serif" : "serif"}`}
          >
            {fontFamily === "serif" ? "Sans" : "Serif"}
          </button>

          <div className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:block" />

          <button
            onClick={onShowShortcuts}
            className="hidden rounded-full px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)] sm:block"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
        </div>
      </div>
    </header>
  );
}
