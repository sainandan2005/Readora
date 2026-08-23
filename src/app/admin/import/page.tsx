"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ImportForm from "@/components/admin/ImportForm";
import ImportStatus from "@/components/admin/ImportStatus";

function ImportPageContent() {
  const searchParams = useSearchParams();
  const resumedJobId = searchParams.get("jobId");
  const [activeJobs, setActiveJobs] = useState<string[]>([]);

  function handleJobCreated(jobId: string) {
    setActiveJobs((prev) => [jobId, ...prev]);
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display mb-1 text-3xl font-semibold tracking-tight">
          Import Books
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Enter Project Gutenberg IDs to import books into the library.
        </p>
      </div>

      {resumedJobId && (
        <div className="rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--gold)]">
          Resuming job <span className="font-mono">{resumedJobId}</span>
        </div>
      )}

      <ImportForm onJobCreated={handleJobCreated} />

      {(activeJobs.length > 0 || resumedJobId) && (
        <div className="space-y-4">
          <h3 className="font-display border-b border-[var(--border)] pb-3 text-xl font-semibold italic text-[var(--muted-foreground)]">
            Import jobs
          </h3>
          {resumedJobId && !activeJobs.includes(resumedJobId) && (
            <ImportStatus jobId={resumedJobId} />
          )}
          {activeJobs.map((jobId) => (
            <ImportStatus key={jobId} jobId={jobId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Loading…</p>}>
      <ImportPageContent />
    </Suspense>
  );
}
