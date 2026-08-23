"use client";

import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="SEARCH BY TITLE OR AUTHOR..."
      autoComplete="off"
      className="w-full px-4 py-3 rounded-none border-2 border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 text-sm uppercase tracking-wide placeholder:text-[var(--muted-foreground)]"
    />
  );
}
