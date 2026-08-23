import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import ReadingProgress from "@/models/ReadingProgress";
import Book from "@/models/Book";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    await connectDB();

    const progressList = await ReadingProgress.find({ userId: session.user.id })
      .sort({ lastReadAt: -1 })
      .limit(10)
      .lean();

    if (progressList.length === 0) {
      return NextResponse.json([]);
    }

    const bookIds = progressList.map((p) => p.bookId);
    const books = await Book.find({ _id: { $in: bookIds }, status: "ready" })
      .select("-rawContent")
      .lean();

    const bookMap = new Map(books.map((b) => [b._id.toString(), b]));

    const result = progressList
      .map((p) => {
        const book = bookMap.get(p.bookId.toString());
        if (!book) return null;
        return {
          id: book._id.toString(),
          slug: book.slug,
          title: book.title,
          author: book.author,
          coverImageUrl: book.coverImageUrl,
          chapterCount: book.chapterCount,
          progress: p.percentage,
          lastReadAt: p.lastReadAt.toISOString(),
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err) {
    logger.error("Failed to fetch continue-reading.", { error: String(err) });
    return NextResponse.json([], { status: 200 });
  }
}
