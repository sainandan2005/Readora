import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import User from "@/models/User";
import Book from "@/models/Book";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id)
      .populate({
        path: "bookshelf",
        select: "-rawContent",
        match: { status: "ready" },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const books = ((user.bookshelf || []) as any[])
      .filter((b) => b && b._id)
      .map((b) => ({
        id: b._id.toString(),
        gutenbergId: b.gutenbergId,
        title: b.title,
        author: b.author,
        slug: b.slug,
        coverImageUrl: b.coverImageUrl,
        chapterCount: b.chapterCount,
      }));

    return NextResponse.json({ books });
  } catch (err) {
    logger.error("Failed to fetch bookshelf.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch bookshelf." },
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
    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    await connectDB();

    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { bookshelf: bookId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Failed to add to bookshelf.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to add to bookshelf." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
      $pull: { bookshelf: bookId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Failed to remove from bookshelf.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to remove from bookshelf." },
      { status: 500 }
    );
  }
}
