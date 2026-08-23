import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-8xl md:text-9xl font-black text-[var(--accent)] tracking-tighter mb-2">
        404
      </h1>
      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-8">
        Page not found
      </p>
      <Link
        href="/"
        className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wide text-sm hover:bg-[var(--accent)] transition-colors duration-200"
      >
        Go Home
      </Link>
    </main>
  );
}
