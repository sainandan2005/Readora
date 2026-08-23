"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/library");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lg)] sm:p-10">
        <h1 className="font-display mb-1 text-3xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-[var(--muted-foreground)]">
          Sign in to continue reading
        </p>

        {registered && (
          <div className="mb-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
            Account created — please sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm font-medium text-[var(--destructive)]">{error}</p>
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[var(--accent)] hover:underline">
            Create one
          </Link>
        </p>
      </div>

      <p className="font-display mt-8 text-center text-sm italic text-[var(--muted-foreground)]">
        &ldquo;A reader lives a thousand lives before he dies.&rdquo;
        <span className="mt-1 block text-xs not-italic">— George R. R. Martin</span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-[var(--muted-foreground)]">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
