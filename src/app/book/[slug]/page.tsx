import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";
import User from "@/models/User";
import BookshelfButton from "@/components/library/BookshelfButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();

  const book = await Book.findOne({ slug, status: "ready" })
    .select("title author coverImageUrl chapterCount")
    .lean();

  if (!book) {
    return { title: "Book Not Found" };
  }

  return {
    title: `${book.title} by ${book.author} — Readora`,
    description: `Read "${book.title}" by ${book.author} — ${book.chapterCount} chapters available for free on Readora.`,
    openGraph: {
      title: book.title,
      description: `Read "${book.title}" by ${book.author} on Readora.`,
      ...(book.coverImageUrl ? { images: [{ url: book.coverImageUrl }] } : {}),
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();

  const book = await Book.findOne({ slug, status: "ready" })
    .select("-rawContent")
    .lean();

  if (!book) {
    notFound();
  }

  const chapters = await Chapter.find({ bookId: book._id })
    .select("chapterNumber title")
    .sort({ chapterNumber: 1 })
    .lean();

  const session = await auth();
  let progress = null;
  let isBookshelfed = false;
  if (session?.user) {
    progress = await ReadingProgress.findOne({
      userId: session.user.id,
      bookId: book._id,
    }).lean();

    const user = await User.findById(session.user.id).select("bookshelf").lean();
    isBookshelfed = user?.bookshelf?.some(
      (id) => id.toString() === book._id.toString()
    ) ?? false;
  }

  const readLink = progress
    ? `/book/${slug}/read?chapter=${progress.chapter}`
    : `/book/${slug}/read?chapter=1`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8 lg:py-14">
      <Link
        href="/library"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--accent)]"
      >
        ← Back to Library
      </Link>

      <div className="mb-14 flex flex-col gap-10 sm:flex-row">
        <div className="w-48 shrink-0 mx-auto sm:mx-0">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full rounded-xl border border-[var(--border)] shadow-[var(--shadow-lg)]"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] p-6 shadow-[var(--shadow-lg)]">
              <span className="font-display text-center text-base font-semibold italic leading-snug text-[var(--accent-foreground)]">
                {book.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display mb-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {book.title}
          </h1>
          <p className="mb-6 text-[var(--muted-foreground)]">
            by {book.author}
          </p>

          {progress && (
            <div className="mb-7">
              <div className="flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] sm:justify-start">
                <span>{Math.round(progress.percentage)}% read</span>
                <span>·</span>
                <span>
                  Chapter {progress.chapter} of {book.chapterCount}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full bg-[var(--gold)] transition-[width]"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link
              href={readLink}
              className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[var(--shadow-md)]"
            >
              {progress ? "Continue Reading" : "Start Reading"}
            </Link>
            <BookshelfButton
              bookId={book._id.toString()}
              initialSaved={isBookshelfed}
            />
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]/80">
            {book.chapterCount} chapter{book.chapterCount !== 1 ? "s" : ""}
            {book.language && ` · ${book.language.toUpperCase()}`}
          </p>
        </div>
      </div>

      <section>
        <h2 className="font-display mb-5 border-b border-[var(--border)] pb-3 text-xl font-semibold italic text-[var(--muted-foreground)]">
          Chapters
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          {chapters.map((ch, i) => (
            <Link
              key={ch.chapterNumber}
              href={`/book/${slug}/read?chapter=${ch.chapterNumber}`}
              className={`group flex items-center px-5 py-3.5 transition-colors duration-150 hover:bg-[var(--accent-soft)] ${
                i > 0 ? "border-t border-[var(--border)]" : ""
              } ${progress && ch.chapterNumber === progress.chapter ? "bg-[var(--accent-soft)]" : ""}`}
            >
              <span
                className={`mr-4 w-7 shrink-0 font-display text-sm italic ${
                  progress && ch.chapterNumber === progress.chapter
                    ? "font-bold text-[var(--gold)]"
                    : "text-[var(--muted-foreground)]/70"
                }`}
              >
                {String(ch.chapterNumber).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate text-sm group-hover:text-[var(--accent)]">
                {ch.title || `Chapter ${ch.chapterNumber}`}
              </span>
              {progress && ch.chapterNumber === progress.chapter && (
                <span className="ml-3 rounded-full bg-[var(--gold)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Here
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
