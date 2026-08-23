"use client";

import { useEffect, useRef, useState } from "react";

interface ImportStatusProps {
  jobId: string;
}

interface JobStatus {
  status: string;
  processedCount: number;
  totalCount: number;
  errors: { gutenbergId: number; message: string }[];
}

export default function ImportStatus({ jobId }: ImportStatusProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [processing, setProcessing] = useState(true);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;

    async function processNext() {
      while (!abortRef.current) {
        try {
          const res = await fetch("/api/admin/import/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId }),
          });

          const data = await res.json();

          if (!res.ok) {
            setProcessing(false);
            return;
          }

          // Fetch latest status
          const statusRes = await fetch(`/api/admin/import/status?jobId=${jobId}`);
          const status = await statusRes.json();
          setJobStatus(status);

          if (data.done) {
            setProcessing(false);
            return;
          }
        } catch {
          setProcessing(false);
          return;
        }
      }
    }

    processNext();

    return () => {
      abortRef.current = true;
    };
  }, [jobId]);

  if (!jobStatus) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted-foreground)]">Starting import…</p>
      </div>
    );
  }

  const percentage = Math.round(
    (jobStatus.processedCount / jobStatus.totalCount) * 100
  );

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          {processing ? "Importing…" : "Import complete"}
        </span>
        <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
          {jobStatus.processedCount} / {jobStatus.totalCount}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${processing ? "bg-[var(--gold)]" : "bg-[var(--accent)]"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {jobStatus.errors.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--destructive)]">
            Errors ({jobStatus.errors.length})
          </p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
            {jobStatus.errors.map((err, i) => (
              <li key={i}>
                ID {err.gutenbergId}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
