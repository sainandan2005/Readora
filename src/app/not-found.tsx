import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="font-display mb-2 text-8xl font-semibold italic text-[var(--gold)] md:text-9xl">
        404
      </h1>
      <p className="font-display mb-8 text-lg italic text-[var(--muted-foreground)]">
        This page seems to be missing from the shelves.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] transition-all duration-200 hover:bg-[var(--accent-hover)]"
      >
        Back to the library
      </Link>
    </main>
  );
}
