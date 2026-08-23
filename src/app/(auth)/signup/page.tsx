"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lg)] sm:p-10">
          <h1 className="font-display mb-1 text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mb-8 text-sm text-[var(--muted-foreground)]">
            Join Readora to start reading
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="name"
              name="name"
              label="Name"
              type="text"
              required
              autoComplete="name"
            />
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>
            )}

            <Button type="submit" isLoading={loading} className="w-full">
              Sign Up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="font-display mt-8 text-center text-sm italic text-[var(--muted-foreground)]">
          &ldquo;There is no friend as loyal as a book.&rdquo;
          <span className="mt-1 block text-xs not-italic">— Ernest Hemingway</span>
        </p>
      </div>
    </main>
  );
}
