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
        <h2 className="font-display mb-4 text-xl font-semibold italic text-[var(--muted-foreground)]">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total books" value={bookCount} />
          <StatCard label="Ready" value={readyCount} />
          <StatCard label="Processing" value={processingCount} />
          <StatCard label="Failed" value={failedCount} destructive={failedCount > 0} />
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="font-display text-xl font-semibold italic text-[var(--muted-foreground)]">
            Recent imports
          </h3>
          <Link
            href="/admin/import"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            New Import →
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border-strong)] py-12 text-center text-sm italic text-[var(--muted-foreground)]">
            No imports yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
            {recentJobs.map((job, i) => (
              <div
                key={job._id.toString()}
                className={`flex items-center justify-between px-5 py-4 ${
                  i > 0 ? "border-t border-[var(--border)]" : ""
                }`}
              >
                <div>
                  <span className="text-sm font-semibold">
                    {job.totalCount} book{job.totalCount !== 1 ? "s" : ""}
                  </span>
                  <span className="ml-3 text-xs text-[var(--muted-foreground)]">
                    {job.processedCount}/{job.totalCount} processed
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    job.status === "completed"
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : job.status === "failed"
                      ? "bg-[var(--destructive)]/10 text-[var(--destructive)]"
                      : "bg-[var(--gold)]/10 text-[var(--gold)]"
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

function StatCard({
  label,
  value,
  destructive = false,
}: {
  label: string;
  value: number;
  destructive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
      <p className={`font-display text-3xl font-semibold ${destructive && value > 0 ? "text-[var(--destructive)]" : ""}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </p>
    </div>
  );
}
