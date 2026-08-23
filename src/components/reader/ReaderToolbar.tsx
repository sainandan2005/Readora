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
    <header className="sticky top-0 z-10 bg-[var(--background)] border-b-4 border-[var(--border)] px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="shrink-0 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
          >
            &larr;
          </button>
          <button
            onClick={onToggleToc}
            className="shrink-0 px-2 py-1 text-xs font-bold uppercase tracking-wide border-2 border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200"
            title="Table of Contents (T)"
          >
            TOC
          </button>
          <span className="text-xs font-bold uppercase tracking-wide truncate">
            {bookTitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {readingTime > 0 && (
            <>
              <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] whitespace-nowrap hidden sm:inline">
                {readingTime} min
              </span>
              <div className="w-px h-4 bg-[var(--border)] mx-1 hidden sm:block" />
            </>
          )}

          <button
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="px-2 py-1 text-sm font-bold hover:text-[var(--accent)] disabled:opacity-30 transition-colors duration-200"
            title="Previous chapter (Left arrow)"
          >
            &lsaquo;
          </button>
          <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] whitespace-nowrap font-bold">
            {currentChapter}/{totalChapters}
          </span>
          <button
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={currentChapter >= totalChapters}
            className="px-2 py-1 text-sm font-bold hover:text-[var(--accent)] disabled:opacity-30 transition-colors duration-200"
            title="Next chapter (Right arrow)"
          >
            &rsaquo;
          </button>

          <div className="w-px h-4 bg-[var(--border)] mx-1" />

          <button
            onClick={onAddBookmark}
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide hover:text-[var(--accent)] transition-colors duration-200 relative"
            title="Add bookmark (B)"
          >
            BM
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] text-[var(--accent-foreground)] text-[9px] flex items-center justify-center font-bold">
                {bookmarkCount}
              </span>
            )}
          </button>

          <div className="w-px h-4 bg-[var(--border)] mx-1" />

          <button
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
            className="px-2 py-1 text-xs font-bold hover:text-[var(--accent)] transition-colors duration-200"
            title="Decrease font size"
          >
            A-
          </button>
          <button
            onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
            className="px-2 py-1 text-sm font-bold hover:text-[var(--accent)] transition-colors duration-200"
            title="Increase font size"
          >
            A+
          </button>

          <div className="w-px h-4 bg-[var(--border)] mx-1" />

          <button
            onClick={() =>
              onFontFamilyChange(fontFamily === "serif" ? "sans-serif" : "serif")
            }
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide hover:text-[var(--accent)] transition-colors duration-200"
            title={`Switch to ${fontFamily === "serif" ? "sans-serif" : "serif"}`}
          >
            {fontFamily === "serif" ? "Sans" : "Serif"}
          </button>

          <div className="w-px h-4 bg-[var(--border)] mx-1 hidden sm:block" />

          <button
            onClick={onShowShortcuts}
            className="px-2 py-1 text-xs font-bold hover:text-[var(--accent)] transition-colors duration-200 hidden sm:block"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
        </div>
      </div>
    </header>
  );
}
