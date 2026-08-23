import { auth } from "@/lib/auth";
import Link from "next/link";
import NavLogout from "./NavLogout";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";

export default async function Nav() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link
            href="/library"
            className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)]"
          >
            Readora<span className="text-[var(--gold)]">.</span>
          </Link>
          <div className="hidden gap-1 sm:flex">
            {[
              ["/library", "Library"],
              ["/bookshelf", "Bookshelf"],
              ["/stats", "Stats"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {label}
              </Link>
            ))}
            {session.user.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--gold)] transition-colors duration-200 hover:bg-[var(--muted)]"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden text-sm text-[var(--muted-foreground)] md:inline">
            {session.user.name}
          </span>
          <NavLogout />
          <MobileMenu isAdmin={session.user.role === "admin"} />
        </div>
      </div>
    </nav>
  );
}
