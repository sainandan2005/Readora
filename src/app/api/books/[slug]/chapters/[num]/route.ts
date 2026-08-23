import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import { resolveRelativeUrls } from "@/lib/ingestion";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; num: string }> }
) {
  try {
    const { slug, num } = await params;
    const chapterNum = parseInt(num, 10);

    if (isNaN(chapterNum) || chapterNum < 1) {
      return NextResponse.json(
        { error: "Invalid chapter number" },
        { status: 400 }
      );
    }

    await connectDB();

    const book = await Book.findOne({ slug, status: "ready" })
      .select("_id chapterCount gutenbergId")
      .lean();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapter = await Chapter.findOne({
      bookId: book._id,
      chapterNumber: chapterNum,
    }).lean();

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Resolve any remaining relative image URLs for already-ingested books
    const baseUrl = `https://www.gutenberg.org/cache/epub/${book.gutenbergId}/`;
    const contentHTML = resolveRelativeUrls(chapter.contentHTML, baseUrl);

    // Calculate reading time (average 200 words per minute)
    const textContent = contentHTML.replace(/<[^>]+>/g, " ");
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const response = NextResponse.json({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      contentHTML,
      totalChapters: book.chapterCount,
      readingTime,
    });

    // Cache for 1 hour on CDN, 5 min in browser (book content doesn't change)
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, max-age=300, stale-while-revalidate=86400"
    );

    return response;
  } catch (err) {
    logger.error("Failed to fetch chapter.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch chapter." },
      { status: 500 }
    );
  }
}
