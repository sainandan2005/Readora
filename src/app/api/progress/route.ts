import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import ReadingProgress from "@/models/ReadingProgress";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookId = req.nextUrl.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const progress = await ReadingProgress.findOne({
      userId: session.user.id,
      bookId,
    }).lean();

    if (!progress) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      chapter: progress.chapter,
      scrollPosition: progress.scrollPosition,
      percentage: progress.percentage,
      lastReadAt: progress.lastReadAt,
    });
  } catch (err) {
    logger.error("Failed to fetch progress.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch progress." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookId, chapter, scrollPosition, percentage } = await req.json();

    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    await connectDB();

    await ReadingProgress.findOneAndUpdate(
      { userId: session.user.id, bookId },
      {
        chapter: chapter ?? 1,
        scrollPosition: scrollPosition ?? 0,
        percentage: percentage ?? 0,
        lastReadAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Failed to save progress.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to save progress." },
      { status: 500 }
    );
  }
}
