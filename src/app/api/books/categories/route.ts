import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import Book from "@/models/Book";

export async function GET() {
  try {
    await connectDB();

    const categories = await Book.distinct("categories", { status: "ready" });

    // Sort alphabetically and filter out empty strings
    const sorted = categories.filter(Boolean).sort();

    return NextResponse.json({ categories: sorted });
  } catch (err) {
    logger.error("Failed to fetch categories.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
