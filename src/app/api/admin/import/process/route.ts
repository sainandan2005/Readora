import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logger } from "@/lib/logger";
import ImportJob from "@/models/ImportJob";
import { processBook } from "@/lib/ingestion";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    await connectDB();

    const job = await ImportJob.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "completed" || job.status === "failed") {
      return NextResponse.json({
        done: true,
        status: job.status,
        processedCount: job.processedCount,
        totalCount: job.totalCount,
      });
    }

    // Find next unprocessed ID
    const nextId = job.gutenbergIds.find(
      (id: number) => !job.processedIds.includes(id)
    );

    if (!nextId) {
      job.status = "completed";
      await job.save();
      return NextResponse.json({
        done: true,
        status: "completed",
        processedCount: job.processedCount,
        totalCount: job.totalCount,
      });
    }

    // Mark job as processing
    if (job.status === "pending") {
      job.status = "processing";
    }

    try {
      await processBook(nextId);
      job.processedIds.push(nextId);
      job.processedCount = job.processedIds.length;
    } catch (error) {
      logger.error(`Failed to import book ${nextId}.`, {
        error: error instanceof Error ? error.message : String(error),
      });
      job.errors.push({
        gutenbergId: nextId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      job.processedIds.push(nextId);
      job.processedCount = job.processedIds.length;
    }

    // Check if all done
    if (job.processedCount >= job.totalCount) {
      job.status = "completed";
    }

    await job.save();

    return NextResponse.json({
      done: job.processedCount >= job.totalCount,
      status: job.status,
      processedCount: job.processedCount,
      totalCount: job.totalCount,
      lastProcessed: nextId,
    });
  } catch (err) {
    logger.error("Failed to process import job.", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to process book." },
      { status: 500 }
    );
  }
}
