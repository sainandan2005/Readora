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
          className="block text-xs font-bold uppercase tracking-widest mb-2"
        >
          Gutenberg IDs
        </label>
        <textarea
          id="gutenberg-ids"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"1342\n84\n11\n1661"}
          rows={6}
          className="w-full px-4 py-3 border-2 border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 font-mono text-sm"
        />
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-2">
          Enter one ID per line or comma-separated
        </p>
      </div>

      {error && (
        <p className="text-sm text-[var(--accent)] font-bold">{error}</p>
      )}

      <Button type="submit" isLoading={loading}>
        Start Import
      </Button>
    </form>
  );
}
