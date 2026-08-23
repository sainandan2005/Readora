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
    <main className="max-w-3xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
      <Link
        href="/library"
        className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline mb-6 inline-block"
      >
        &larr; Back to Library
      </Link>

      <div className="flex flex-col sm:flex-row gap-8 mb-12">
        <div className="w-48 shrink-0">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full border-2 border-[var(--border)]"
            />
          ) : (
            <div className="aspect-[2/3] bg-[var(--muted)] swiss-grid-pattern border-2 border-[var(--border)] flex items-center justify-center p-4">
              <span className="text-center text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                {book.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-1">
            {book.title}
          </h1>
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-6">
            {book.author}
          </p>

          {progress && (
            <div className="mb-6">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
                <span className="font-bold">{Math.round(progress.percentage)}%</span>
                <span>&middot;</span>
                <span>Chapter {progress.chapter} of {book.chapterCount}</span>
              </div>
              <div className="w-full bg-[var(--muted)] h-1 mt-2">
                <div
                  className="bg-[var(--accent)] h-1"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href={readLink}
              className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wide text-sm hover:bg-[var(--accent)] transition-colors duration-200"
            >
              {progress ? "Continue Reading" : "Start Reading"}
            </Link>
            <BookshelfButton
              bookId={book._id.toString()}
              initialSaved={isBookshelfed}
            />
          </div>

          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mt-6">
            {book.chapterCount} chapter{book.chapterCount !== 1 ? "s" : ""}
            {book.language && ` · ${book.language.toUpperCase()}`}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 border-b-4 border-[var(--border)] pb-3">
          <span className="text-[var(--accent)]">01.</span> Chapters
        </h2>
        <div className="space-y-0">
          {chapters.map((ch) => (
            <Link
              key={ch.chapterNumber}
              href={`/book/${slug}/read?chapter=${ch.chapterNumber}`}
              className={`block px-4 py-3 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200 text-sm border-b border-[var(--muted)] ${
                progress && ch.chapterNumber === progress.chapter
                  ? "border-l-4 border-l-[var(--accent)] font-bold"
                  : ""
              }`}
            >
              <span className="text-[var(--muted-foreground)] mr-3 uppercase tracking-widest text-xs">
                {String(ch.chapterNumber).padStart(2, "0")}.
              </span>
              {ch.title || `Chapter ${ch.chapterNumber}`}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
