import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import ReadingProgress from "@/models/ReadingProgress";
import ReaderView from "@/components/reader/ReaderView";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ chapter?: string }>;
}

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { chapter: chapterParam } = await searchParams;

  await connectDB();

  const book = await Book.findOne({ slug, status: "ready" })
    .select("_id title chapterCount slug")
    .lean();

  if (!book) {
    notFound();
  }

  // Fetch chapter titles for TOC drawer
  const chapters = await Chapter.find({ bookId: book._id })
    .select("chapterNumber title")
    .sort({ chapterNumber: 1 })
    .lean();

  const chapterList = chapters.map((ch) => ({
    chapterNumber: ch.chapterNumber,
    title: ch.title || `Chapter ${ch.chapterNumber}`,
  }));

  const session = await auth();
  let initialChapter = chapterParam ? parseInt(chapterParam, 10) : 1;
  let initialScrollPosition = 0;

  if (session?.user) {
    const progress = await ReadingProgress.findOne({
      userId: session.user.id,
      bookId: book._id,
    }).lean();

    if (progress && !chapterParam) {
      initialChapter = progress.chapter;
      initialScrollPosition = progress.scrollPosition;
    }
  }

  if (isNaN(initialChapter) || initialChapter < 1) {
    initialChapter = 1;
  }
  if (initialChapter > book.chapterCount) {
    initialChapter = book.chapterCount;
  }

  return (
    <ReaderView
      bookId={book._id.toString()}
      bookSlug={book.slug}
      bookTitle={book.title}
      totalChapters={book.chapterCount}
      initialChapter={initialChapter}
      initialScrollPosition={initialScrollPosition}
      chapters={chapterList}
    />
  );
}
