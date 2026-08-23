"use client";

import { signOut } from "next-auth/react";

export default function NavLogout() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="font-bold uppercase tracking-wide text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-200"
    >
      Sign Out
    </button>
  );
}
