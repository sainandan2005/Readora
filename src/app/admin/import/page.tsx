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
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
          Import Books
        </h2>
        <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
          Enter Project Gutenberg IDs to import books into the library.
        </p>
      </div>

      <ImportForm onJobCreated={handleJobCreated} />

      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b-4 border-[var(--border)] pb-3">
            <span className="text-[var(--accent)]">01.</span> Import Jobs
          </h3>
          {activeJobs.map((jobId) => (
            <ImportStatus key={jobId} jobId={jobId} />
          ))}
        </div>
      )}
    </div>
  );
}
