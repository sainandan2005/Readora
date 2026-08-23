import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)]">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 ${
          error
            ? "border-[var(--destructive)]"
            : "border-[var(--border)] focus:border-[var(--accent)]"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
    </div>
  );
}
