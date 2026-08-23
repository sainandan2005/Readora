"use client";

import { useCallback, useEffect, useState } from "react";

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/books/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 transition-colors duration-200 ${
          !selected
            ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--border)]"
            : "border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? "" : cat)}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 transition-colors duration-200 ${
            cat === selected
              ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--border)]"
              : "border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
