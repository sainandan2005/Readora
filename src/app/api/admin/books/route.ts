import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import Book from "@/models/Book";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectDB();

    const books = await Book.find()
      .select("gutenbergId title author slug status chapterCount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      books: books.map((b) => ({
        id: b._id.toString(),
        gutenbergId: b.gutenbergId,
        title: b.title,
        author: b.author,
        slug: b.slug,
        status: b.status,
        chapterCount: b.chapterCount,
      })),
    });
  } catch (err) {
    logger.error("Failed to list books for admin.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch books." },
      { status: 500 }
    );
  }
}
