import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "px-6 py-3 rounded-none font-bold uppercase tracking-wide text-sm transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    secondary:
      "bg-[var(--background)] text-[var(--foreground)] border-2 border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)]",
    destructive:
      "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
