"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <p className="font-display mb-4 text-6xl italic text-[var(--gold)]">!</p>
      <h1 className="font-display mb-2 text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-md text-sm text-[var(--muted-foreground)]">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:bg-[var(--accent-hover)]"
      >
        Try again
      </button>
    </main>
  );
}
