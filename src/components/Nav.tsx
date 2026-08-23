import { auth } from "@/lib/auth";
import Link from "next/link";
import NavLogout from "./NavLogout";

export default async function Nav() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <nav className="border-b-4 border-[var(--border)] px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/library"
            className="font-black text-lg uppercase tracking-tight text-[var(--accent)]"
          >
            Readora
          </Link>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <Link
              href="/library"
              className="hover:text-[var(--accent)] transition-colors duration-200"
            >
              Library
            </Link>
            <Link
              href="/bookshelf"
              className="hover:text-[var(--accent)] transition-colors duration-200"
            >
              Bookshelf
            </Link>
            <Link
              href="/stats"
              className="hover:text-[var(--accent)] transition-colors duration-200"
            >
              Stats
            </Link>
            {session.user.role === "admin" && (
              <Link
                href="/admin"
                className="hover:text-[var(--accent)] transition-colors duration-200"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="uppercase tracking-widest text-[var(--muted-foreground)]">
            {session.user.name}
          </span>
          <NavLogout />
        </div>
      </div>
    </nav>
  );
}
