import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import ImportJob from "@/models/ImportJob";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const job = await ImportJob.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: job._id.toString(),
      status: job.status,
      totalCount: job.totalCount,
      processedCount: job.processedCount,
      errors: job.errors,
      gutenbergIds: job.gutenbergIds,
      processedIds: job.processedIds,
    });
  } catch (err) {
    logger.error("Failed to fetch job status.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to fetch job status." },
      { status: 500 }
    );
  }
}
