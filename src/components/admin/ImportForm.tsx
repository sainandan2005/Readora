"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ImportFormProps {
  onJobCreated: (jobId: string) => void;
}

export default function ImportForm({ onJobCreated }: ImportFormProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ids = input
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);

    if (ids.length === 0) {
      setError("Please enter valid Gutenberg IDs (one per line or comma-separated).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gutenbergIds: ids }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setInput("");
      onJobCreated(data.jobId);
    } catch {
      setError("Failed to create import job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="gutenberg-ids"
          className="mb-2 block text-xs font-semibold tracking-wide text-[var(--muted-foreground)]"
        >
          Gutenberg IDs
        </label>
        <textarea
          id="gutenberg-ids"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"1342\n84\n11\n1661"}
          rows={6}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-mono text-sm transition-all duration-200 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]/80">
          One ID per line or comma-separated
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>
      )}

      <Button type="submit" isLoading={loading}>
        Start Import
      </Button>
    </form>
  );
}
