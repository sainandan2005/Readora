import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";
import Bookmark from "@/models/Bookmark";
import ReadingProgress from "@/models/ReadingProgress";
import User from "@/models/User";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectDB();

    const book = await Book.findById(id).select("_id title");
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Cascade-delete everything that references the book
    const [chapters, bookmarks, progress, bookshelf] = await Promise.all([
      Chapter.deleteMany({ bookId: book._id }),
      Bookmark.deleteMany({ bookId: book._id }),
      ReadingProgress.deleteMany({ bookId: book._id }),
      User.updateMany({}, { $pull: { bookshelf: book._id } }),
    ]);

    await Book.deleteOne({ _id: book._id });

    logger.info(`Deleted book ${book.title}`, {
      chapters: chapters.deletedCount,
      bookmarks: bookmarks.deletedCount,
      progress: progress.deletedCount,
      bookshelfRefs: bookshelf.modifiedCount,
    });

    return NextResponse.json({
      ok: true,
      deleted: {
        chapters: chapters.deletedCount,
        bookmarks: bookmarks.deletedCount,
        progressRecords: progress.deletedCount,
        bookshelfRefs: bookshelf.modifiedCount,
      },
    });
  } catch (err) {
    logger.error("Failed to delete book.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to delete book." },
      { status: 500 }
    );
  }
}
