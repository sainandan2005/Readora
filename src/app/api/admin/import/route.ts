import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import ImportJob from "@/models/ImportJob";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { gutenbergIds } = await req.json();

    if (!Array.isArray(gutenbergIds) || gutenbergIds.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of Gutenberg IDs." },
        { status: 400 }
      );
    }

    const ids = gutenbergIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No valid Gutenberg IDs provided." },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await ImportJob.create({
      gutenbergIds: ids,
      processedIds: [],
      totalCount: ids.length,
      status: "pending",
    });

    return NextResponse.json({ jobId: job._id.toString() }, { status: 201 });
  } catch (err) {
    logger.error("Failed to create import job.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to create import job." },
      { status: 500 }
    );
  }
}
