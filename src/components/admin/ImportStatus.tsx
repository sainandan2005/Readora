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
      <div className="border-2 border-[var(--border)] p-6">
        <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
          Starting import...
        </p>
      </div>
    );
  }

  const percentage = Math.round(
    (jobStatus.processedCount / jobStatus.totalCount) * 100
  );

  return (
    <div className="border-2 border-[var(--border)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-bold uppercase tracking-wide text-sm">
          {processing ? "Importing..." : "Import Complete"}
        </span>
        <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
          {jobStatus.processedCount} / {jobStatus.totalCount}
        </span>
      </div>

      <div className="w-full bg-[var(--muted)] h-1">
        <div
          className="bg-[var(--accent)] h-1 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {jobStatus.errors.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            Errors ({jobStatus.errors.length}):
          </p>
          <ul className="text-xs text-[var(--muted-foreground)] mt-2 space-y-1">
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
