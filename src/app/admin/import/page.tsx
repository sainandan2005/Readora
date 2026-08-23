"use client";

import { useState } from "react";
import ImportForm from "@/components/admin/ImportForm";
import ImportStatus from "@/components/admin/ImportStatus";

export default function ImportPage() {
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

      <ImportForm onJobCreated={handleJobCreated} />

      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display border-b border-[var(--border)] pb-3 text-xl font-semibold italic text-[var(--muted-foreground)]">
            Import jobs
          </h3>
          {activeJobs.map((jobId) => (
            <ImportStatus key={jobId} jobId={jobId} />
          ))}
        </div>
      )}
    </div>
  );
}
