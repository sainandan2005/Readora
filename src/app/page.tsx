import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Typography */}
        <div className="flex-1 flex flex-col justify-center px-8 py-16 lg:px-16 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-6">
            01. Public Domain Reading
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Read
            <br />
            <span className="text-[var(--accent)]">Freely</span>
          </h1>
          <p className="text-sm uppercase tracking-widest text-[var(--muted-foreground)] max-w-md mb-12 leading-relaxed">
            Public-domain books online. Your progress saves automatically.
            No distractions. Just the words.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wide text-sm hover:bg-[var(--accent)] transition-colors duration-200 text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-[var(--border)] font-bold uppercase tracking-wide text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right: Geometric Composition */}
        <div className="flex-1 bg-[var(--muted)] swiss-grid-pattern flex items-center justify-center p-12 lg:p-16 relative overflow-hidden">
          {/* Abstract Bauhaus-inspired composition */}
          <div className="relative w-full max-w-sm aspect-square">
            {/* Large circle */}
            <div className="absolute top-0 right-0 w-3/4 aspect-square rounded-full border-4 border-[var(--foreground)]" />
            {/* Red rectangle */}
            <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-[var(--accent)]" />
            {/* Small black square */}
            <div className="absolute top-1/4 left-1/4 w-1/4 aspect-square bg-[var(--foreground)]" />
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[var(--foreground)]" />
            {/* Vertical line */}
            <div className="absolute top-0 left-1/3 w-[4px] h-full bg-[var(--foreground)]" />
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <footer className="border-t-4 border-[var(--border)] px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            Free &middot; Open Source &middot; No Ads
          </span>
          <span className="text-xs uppercase tracking-widest font-bold">
            Readora &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </main>
  );
}
