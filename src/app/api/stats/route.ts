import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import ReadingProgress from "@/models/ReadingProgress";
import Book from "@/models/Book";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;

    // Get all reading progress for this user
    const allProgress = await ReadingProgress.find({ userId }).lean();

    // Get unique book IDs the user has read
    const bookIds = allProgress.map((p) => p.bookId);
    const books = await Book.find({ _id: { $in: bookIds }, status: "ready" })
      .select("_id title chapterCount")
      .lean();

    const bookMap = new Map(books.map((b) => [b._id.toString(), b]));

    let booksCompleted = 0;
    let booksInProgress = 0;
    let totalChaptersRead = 0;

    for (const progress of allProgress) {
      const book = bookMap.get(progress.bookId.toString());
      if (!book) continue;

      totalChaptersRead += progress.chapter;

      if (progress.percentage >= 95) {
        booksCompleted++;
      } else {
        booksInProgress++;
      }
    }

    // Calculate reading streak (consecutive days with reading activity)
    const readDates = allProgress
      .map((p) => {
        const d = new Date(p.lastReadAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const dateStr of readDates) {
      const expectedDate = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      if (dateStr === expectedDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({
      booksCompleted,
      booksInProgress,
      totalChaptersRead,
      totalBooks: allProgress.length,
      currentStreak: streak,
    });
  } catch (err) {
    logger.error("Failed to fetch stats.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
