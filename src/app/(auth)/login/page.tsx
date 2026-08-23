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
    <div className="w-full max-w-sm space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
          Welcome
          <br />
          <span className="text-[var(--accent)]">Back</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
          Sign in to continue reading
        </p>
      </div>

      {registered && (
        <div className="text-sm border-l-4 border-[var(--accent)] pl-4 py-2 bg-[var(--muted)]">
          <span className="font-bold uppercase tracking-wide text-xs">
            Account created
          </span>
          <span className="text-[var(--muted-foreground)] ml-2 text-xs">
            — Please sign in.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <p className="text-sm text-[var(--accent)] font-bold">{error}</p>
        )}

        <Button type="submit" isLoading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[var(--accent)] font-bold hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <Suspense
          fallback={
            <div className="text-xs uppercase tracking-widest">Loading...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
      {/* Right: Texture (hidden on mobile) */}
      <div className="hidden lg:block flex-1 bg-[var(--muted)] swiss-dots border-l-4 border-[var(--border)]" />
    </main>
  );
}
