import Link from "next/link";

const SPINES = [
  { w: "w-14", h: "h-44", bg: "bg-[#1e5c46]", rotate: "-rotate-2", label: "Austen" },
  { w: "w-16", h: "h-52", bg: "bg-[#b08a3e]", rotate: "rotate-1 translate-y-3", label: "Shelley" },
  { w: "w-12", h: "h-40", bg: "bg-[#7a3b2e]", rotate: "-rotate-1", label: "Dickens" },
  { w: "w-16", h: "h-48", bg: "bg-[#2f4858]", rotate: "rotate-2 translate-y-2", label: "Carroll" },
  { w: "w-14", h: "h-56", bg: "bg-[#5b4a68]", rotate: "rotate-1", label: "Brontë" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-16 px-6 py-20 lg:flex-row lg:gap-12 lg:py-28">
        {/* Left: Editorial typography */}
        <div className="max-w-xl flex-1 text-center lg:text-left">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            A quiet home for public-domain books
          </p>
          <h1 className="font-display mb-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Read{" "}
            <em className="text-[var(--accent)]">freely</em>,
            <br />
            remember
            <br />
            everything.
          </h1>
          <p className="mx-auto mb-10 max-w-md leading-relaxed text-[var(--muted-foreground)] lg:mx-0">
            Thousands of classic novels, free forever. Readora saves your
            place automatically, keeps your bookmarks, and gets out of the
            way — just you and the words.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/signup"
              className="rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow-md)] transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[var(--shadow-lg)]"
            >
              Start reading
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[var(--border-strong)] px-8 py-4 text-sm font-semibold text-[var(--foreground)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Right: Bookshelf composition */}
        <div className="relative flex flex-1 items-end justify-center pb-8">
          <div className="absolute inset-x-8 bottom-0 h-px bg-[var(--border-strong)]" />
          <div className="relative bottom-0 flex items-end gap-2 rounded-b-none">
            {SPINES.map((s) => (
              <div
                key={s.label}
                className={`relative ${s.w} ${s.h} ${s.bg} ${s.rotate} overflow-hidden rounded-t-md shadow-[var(--shadow-lg)] transition-transform duration-300 hover:-translate-y-2`}
              >
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-widest text-white/85"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {s.label}
                </span>
                <div className="absolute inset-x-0 top-0 h-2 bg-black/15" />
                <div className="absolute inset-x-0 bottom-0 h-2.5 bg-black/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)]/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
          {[
            {
              title: "Never lose your place",
              body: "Progress is saved as you scroll — pick up exactly where you stopped, on any device.",
            },
            {
              title: "Mark what matters",
              body: "Bookmark any moment in any chapter and jump back to it with one tap.",
            },
            {
              title: "Yours to keep",
              body: "A personal bookshelf for the books you love, plus reading streaks to keep you going.",
            },
          ].map((f, i) => (
            <div key={i} className="text-center sm:text-left">
              <p className="font-display mb-2 text-2xl font-semibold italic text-[var(--gold)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mb-1.5 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-[var(--muted-foreground)] sm:flex-row">
          <span>Free · Open source · No ads</span>
          <span className="font-display italic">Readora © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
