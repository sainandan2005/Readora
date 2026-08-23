"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
        Something Went Wrong
      </h1>
      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-8 max-w-md text-center">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wide text-sm hover:bg-[var(--accent)] transition-colors duration-200"
      >
        Try Again
      </button>
    </main>
  );
}
