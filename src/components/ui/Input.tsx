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
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest"
      >
        {label}
      </label>
      <input
        id={id}
        className={`px-4 py-3 rounded-none border-2 border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 ${
          error ? "border-[var(--accent)]" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--accent)] font-medium">{error}</p>
      )}
    </div>
  );
}
