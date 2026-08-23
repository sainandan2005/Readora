import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const book = await Book.findOne({ slug, status: "ready" })
      .select("-rawContent")
      .lean();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = await Chapter.find({ bookId: book._id })
      .select("chapterNumber title")
      .sort({ chapterNumber: 1 })
      .lean();

    return NextResponse.json({
      id: book._id.toString(),
      gutenbergId: book.gutenbergId,
      title: book.title,
      author: book.author,
      slug: book.slug,
      coverImageUrl: book.coverImageUrl,
      chapterCount: book.chapterCount,
      categories: book.categories,
      language: book.language,
      chapters: chapters.map((ch) => ({
        number: ch.chapterNumber,
        title: ch.title,
      })),
    });
  } catch (err) {
    logger.error("Failed to fetch book.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch book." },
      { status: 500 }
    );
  }
}
