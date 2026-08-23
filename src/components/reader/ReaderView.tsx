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
        className="fixed top-0 left-0 h-1 bg-[var(--accent)] z-50 transition-[width] duration-150"
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
        currentChapter={chapter}
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        onSelect={handleChapterChange}
      />

      {/* Keyboard shortcut overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-[var(--background)] border-2 border-[var(--border)] p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black uppercase tracking-tight text-sm mb-6">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3 text-sm">
              {[
                ["Left Arrow", "Previous chapter"],
                ["Right Arrow", "Next chapter"],
                ["T", "Toggle table of contents"],
                ["B", "Add bookmark"],
                ["?", "Show shortcuts"],
                ["Esc", "Close overlay"],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center">
                  <kbd className="px-3 py-1 bg-[var(--muted)] text-xs font-mono font-bold uppercase">
                    {key}
                  </kbd>
                  <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
                    {desc}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-6">
              Swipe left/right on mobile for chapter navigation
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
              <h2
                className="text-center font-black uppercase tracking-tighter mb-8 text-[var(--muted-foreground)]"
                style={{
                  fontSize: `${fontSize + 4}px`,
                  fontFamily: fontFamilyValue,
                }}
              >
                {chapterTitle}
              </h2>
            )}

            {/* Bookmarks for current chapter */}
            {currentBookmarks.length > 0 && (
              <div className="max-w-[65ch] mx-auto mb-6">
                <div className="flex flex-wrap gap-2">
                  {currentBookmarks.map((bm) => (
                    <span
                      key={bm.id}
                      className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wide bg-[var(--muted)] border-2 border-[var(--muted)]"
                    >
                      <button
                        onClick={() => handleGoToBookmark(bm)}
                        className="hover:text-[var(--accent)] transition-colors duration-200"
                      >
                        Bookmark
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bm.id)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--accent)] ml-1 transition-colors duration-200"
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

            <div className="max-w-[65ch] mx-auto flex justify-between mt-12 pt-8 border-t-4 border-[var(--border)]">
              {chapter > 1 ? (
                <button
                  onClick={() => handleChapterChange(chapter - 1)}
                  className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
                >
                  &larr; Previous Chapter
                </button>
              ) : (
                <span />
              )}
              {chapter < totalChapters ? (
                <button
                  onClick={() => handleChapterChange(chapter + 1)}
                  className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
                >
                  Next Chapter &rarr;
                </button>
              ) : (
                <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-bold">
                  End of Book
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
