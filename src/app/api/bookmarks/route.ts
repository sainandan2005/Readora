import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import Bookmark from "@/models/Bookmark";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId) {
      return NextResponse.json({ error: "bookId required" }, { status: 400 });
    }

    await connectDB();

    const bookmarks = await Bookmark.find({
      userId: session.user.id,
      bookId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      bookmarks: bookmarks.map((b) => ({
        id: b._id.toString(),
        chapterNumber: b.chapterNumber,
        scrollPosition: b.scrollPosition,
        label: b.label,
        createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    logger.error("Failed to fetch bookmarks.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch bookmarks." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, chapterNumber, scrollPosition, label } = await req.json();

    if (!bookId || !chapterNumber) {
      return NextResponse.json(
        { error: "bookId and chapterNumber required" },
        { status: 400 }
      );
    }

    await connectDB();

    const bookmark = await Bookmark.create({
      userId: session.user.id,
      bookId,
      chapterNumber,
      scrollPosition: scrollPosition || 0,
      label: label || `Chapter ${chapterNumber}`,
    });

    return NextResponse.json({
      id: bookmark._id.toString(),
      chapterNumber: bookmark.chapterNumber,
      scrollPosition: bookmark.scrollPosition,
      label: bookmark.label,
      createdAt: bookmark.createdAt,
    });
  } catch (err) {
    logger.error("Failed to create bookmark.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to create bookmark." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookmarkId } = await req.json();

    if (!bookmarkId) {
      return NextResponse.json(
        { error: "bookmarkId required" },
        { status: 400 }
      );
    }

    await connectDB();

    await Bookmark.deleteOne({
      _id: bookmarkId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete bookmark.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to delete bookmark." },
      { status: 500 }
    );
  }
}
