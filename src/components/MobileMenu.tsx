"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
  isAdmin: boolean;
}

export default function MobileMenu({ isAdmin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-mobile-menu]")) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const links = [
    ["/library", "Library"],
    ["/bookshelf", "Bookshelf"],
    ["/stats", "Stats"],
    ...(isAdmin ? [["/admin", "Admin"]] : []),
  ];

  return (
    <div className="relative sm:hidden" data-mobile-menu>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
          <nav className="p-1.5">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)] hover:text-[var(--accent)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
