"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useAutoSave from "@/hooks/useAutoSave";
import ReaderToolbar from "./ReaderToolbar";
import ChapterDrawer from "./ChapterDrawer";

interface ChapterInfo {
  chapterNumber: number;
  title: string;
}

interface BookmarkData {
  id: string;
  chapterNumber: number;
  scrollPosition: number;
  label: string;
}

interface ReaderViewProps {
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  totalChapters: number;
  initialChapter: number;
  initialScrollPosition?: number;
  chapters: ChapterInfo[];
}

export default function ReaderView({
  bookId,
  bookSlug,
  bookTitle,
  totalChapters,
  initialChapter,
  initialScrollPosition = 0,
  chapters,
}: ReaderViewProps) {
  const router = useRouter();
  const [chapter, setChapter] = useState(initialChapter);
  const [chapterTitle, setChapterTitle] = useState("");
  const [contentHTML, setContentHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans-serif">("serif");
  const [readingTime, setReadingTime] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldRestoreScroll = useRef(true);

  // Swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useAutoSave({ bookId, chapter, enabled: !loading });

  // Load preferences from localStorage
  useEffect(() => {
    const storedSize = localStorage.getItem("readora-font-size");
    if (storedSize) setFontSize(parseInt(storedSize, 10));

    const storedFamily = localStorage.getItem("readora-font-family");
    if (storedFamily === "serif" || storedFamily === "sans-serif") {
      setFontFamily(storedFamily);
    }
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await fetch(`/api/bookmarks?bookId=${bookId}`);
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks);
        }
      } catch {
        // Silently fail
      }
    }
    loadBookmarks();
  }, [bookId]);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
    localStorage.setItem("readora-font-size", size.toString());
  }, []);

  const handleFontFamilyChange = useCallback((family: "serif" | "sans-serif") => {
    setFontFamily(family);
    localStorage.setItem("readora-font-family", family);
  }, []);

  // Fetch chapter content
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function loadChapter() {
      try {
        const res = await fetch(`/api/books/${bookSlug}/chapters/${chapter}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setContentHTML(data.contentHTML);
          setChapterTitle(data.title);
          setReadingTime(data.readingTime ?? 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    loadChapter();
    return () => { cancelled = true; };
  }, [bookSlug, chapter]);

  // Restore scroll position after content loads
  useEffect(() => {
    if (!loading && contentHTML && shouldRestoreScroll.current) {
      if (initialScrollPosition > 0 && chapter === initialChapter) {
        setTimeout(() => {
          window.scrollTo(0, initialScrollPosition);
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
      shouldRestoreScroll.current = false;
    } else if (!loading && !shouldRestoreScroll.current) {
      window.scrollTo(0, 0);
    }
  }, [loading, contentHTML, initialScrollPosition, initialChapter, chapter]);

  // Scroll progress tracking
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, (scrollTop / docHeight) * 100));
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChapterChange = useCallback(
    (newChapter: number) => {
      if (newChapter >= 1 && newChapter <= totalChapters) {
        setChapter(newChapter);
        shouldRestoreScroll.current = false;
      }
    },
    [totalChapters]
  );

  const handleBack = useCallback(() => {
    router.push(`/book/${bookSlug}`);
  }, [router, bookSlug]);

  const handleAddBookmark = useCallback(async () => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          chapterNumber: chapter,
          scrollPosition: Math.round(window.scrollY),
          label: chapterTitle || `Chapter ${chapter}`,
        }),
      });
      if (res.ok) {
        const bookmark = await res.json();
        setBookmarks((prev) => [bookmark, ...prev]);
      }
    } catch {
      // Silently fail
    }
  }, [bookId, chapter, chapterTitle]);

  const handleDeleteBookmark = useCallback(async (bookmarkId: string) => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      }
    } catch {
      // Silently fail
    }
  }, []);

  const handleGoToBookmark = useCallback((bm: BookmarkData) => {
    if (bm.chapterNumber !== chapter) {
      setChapter(bm.chapterNumber);
      shouldRestoreScroll.current = false;
      // Wait for chapter to load then scroll
      setTimeout(() => {
        window.scrollTo(0, bm.scrollPosition);
      }, 500);
    } else {
      window.scrollTo({ top: bm.scrollPosition, behavior: "smooth" });
    }
  }, [chapter]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          handleChapterChange(chapter - 1);
          break;
        case "ArrowRight":
          handleChapterChange(chapter + 1);
          break;
        case "t":
        case "T":
          setTocOpen((prev) => !prev);
          break;
        case "Escape":
          setTocOpen(false);
          setShowShortcuts(false);
          break;
        case "?":
          setShowShortcuts((prev) => !prev);
          break;
        case "b":
        case "B":
          handleAddBookmark();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter, handleChapterChange, handleAddBookmark]);

  // Swipe gestures
  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Only trigger if horizontal swipe is dominant and significant
      if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
        if (deltaX > 0) {
          handleChapterChange(chapter - 1);
        } else {
          handleChapterChange(chapter + 1);
        }
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [chapter, handleChapterChange]);

  const fontFamilyValue =
    fontFamily === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : "system-ui, -apple-system, sans-serif";

  const currentBookmarks = bookmarks.filter(
    (b) => b.chapterNumber === chapter
  );

  return (
    <div className="min-h-screen">
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-0.5 bg-[var(--gold)] transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <ReaderToolbar
        bookTitle={bookTitle}
        currentChapter={chapter}
        totalChapters={totalChapters}
        fontSize={fontSize}
        fontFamily={fontFamily}
        readingTime={readingTime}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onChapterChange={handleChapterChange}
        onBack={handleBack}
        onToggleToc={() => setTocOpen((prev) => !prev)}
        onAddBookmark={handleAddBookmark}
        onShowShortcuts={() => setShowShortcuts(true)}
        bookmarkCount={currentBookmarks.length}
      />

      <ChapterDrawer
        chapters={chapters}
        bookmarks={bookmarks}
        currentChapter={chapter}
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        onSelect={handleChapterChange}
        onGoToBookmark={handleGoToBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      {/* Keyboard shortcut overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display mb-6 text-lg font-semibold italic">
              Keyboard shortcuts
            </h3>
            <div className="space-y-3 text-sm">
              {[
                ["←", "Previous chapter"],
                ["→", "Next chapter"],
                ["T", "Toggle contents"],
                ["B", "Add bookmark"],
                ["?", "Show shortcuts"],
                ["Esc", "Close"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <kbd className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 font-mono text-xs font-semibold">
                    {key}
                  </kbd>
                  <span className="text-xs text-[var(--muted-foreground)]">{desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-[var(--muted-foreground)]/80">
              Swipe left/right on mobile for chapter navigation.
            </p>
          </div>
        </div>
      )}

      <main className="px-4 py-8">
        {loading ? (
          <div className="max-w-[65ch] mx-auto space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-[var(--muted)] animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        ) : (
          <>
            {chapterTitle && (
              <>
                <div className="mx-auto mb-3 h-px w-10 bg-[var(--gold)]" />
                <h2
                  className="font-display mx-auto mb-10 max-w-[65ch] text-center font-semibold leading-snug"
                  style={{
                    fontSize: `${Math.min(fontSize + 8, 34)}px`,
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                  }}
                >
                  {chapterTitle}
                </h2>
              </>
            )}

            {/* Bookmarks for current chapter */}
            {currentBookmarks.length > 0 && (
              <div className="mx-auto mb-6 max-w-[65ch]">
                <div className="flex flex-wrap gap-2">
                  {currentBookmarks.map((bm) => (
                    <span
                      key={bm.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-[11px] font-medium text-[var(--gold)]"
                    >
                      <button
                        onClick={() => handleGoToBookmark(bm)}
                        className="transition-opacity hover:opacity-70"
                      >
                        Bookmark
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bm.id)}
                        className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              ref={contentRef}
              className="reader-content"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamilyValue,
              }}
              dangerouslySetInnerHTML={{ __html: contentHTML }}
            />

            <div className="mx-auto flex max-w-[65ch] items-center justify-between pt-10 mt-14 border-t border-[var(--border)]">
              {chapter > 1 ? (
                <button
                  onClick={() => handleChapterChange(chapter - 1)}
                  className="text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)]"
                >
                  ← Previous
                </button>
              ) : (
                <span />
              )}
              {chapter < totalChapters ? (
                <button
                  onClick={() => handleChapterChange(chapter + 1)}
                  className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:bg-[var(--accent-hover)]"
                >
                  Next chapter →
                </button>
              ) : (
                <span className="font-display text-sm italic text-[var(--muted-foreground)]">
                  The end.
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
