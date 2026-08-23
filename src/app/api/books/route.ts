import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const q = req.nextUrl.searchParams.get("q") || "";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: "ready" };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
      ];
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .select("-rawContent")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter),
    ]);

    return NextResponse.json({
      books: books.map((b) => ({
        id: b._id.toString(),
        gutenbergId: b.gutenbergId,
        title: b.title,
        author: b.author,
        slug: b.slug,
        coverImageUrl: b.coverImageUrl,
        chapterCount: b.chapterCount,
        categories: b.categories,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[/api/books] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch books.", books: [], totalPages: 1 },
      { status: 500 }
    );
  }
}
