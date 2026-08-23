import Link from "next/link";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";
import ImportJob from "@/models/ImportJob";

export default async function AdminPage() {
  await connectDB();

  const [bookCount, readyCount, processingCount, failedCount, recentJobs] =
    await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ status: "ready" }),
      Book.countDocuments({ status: "processing" }),
      Book.countDocuments({ status: "failed" }),
      ImportJob.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4">
          <span className="text-[var(--accent)]">01.</span> Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Books" value={bookCount} />
          <StatCard label="Ready" value={readyCount} />
          <StatCard label="Processing" value={processingCount} />
          <StatCard label="Failed" value={failedCount} />
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-4 border-b-4 border-[var(--border)] pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest">
            <span className="text-[var(--accent)]">02.</span> Recent Imports
          </h3>
          <Link
            href="/admin/import"
            className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
          >
            New Import &rarr;
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            No imports yet.
          </p>
        ) : (
          <div className="space-y-0">
            {recentJobs.map((job) => (
              <div
                key={job._id.toString()}
                className="border-2 border-[var(--border)] p-4 flex items-center justify-between -mt-0.5"
              >
                <div>
                  <span className="text-sm font-bold">
                    {job.totalCount} book{job.totalCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] ml-3">
                    {job.processedCount}/{job.totalCount} processed
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-2 ${
                    job.status === "completed"
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : job.status === "failed"
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-[var(--border)] p-6 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200 group">
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--background)] transition-colors duration-200 mt-1">
        {label}
      </p>
    </div>
  );
}
