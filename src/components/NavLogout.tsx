"use client";

import { signOut } from "next-auth/react";

export default function NavLogout() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
    >
      Sign Out
    </button>
  );
}
