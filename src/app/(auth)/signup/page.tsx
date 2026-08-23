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
    <main className="min-h-screen flex">
      {/* Left: Texture (hidden on mobile) */}
      <div className="hidden lg:block flex-1 bg-[var(--muted)] swiss-diagonal border-r-4 border-[var(--border)]" />
      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Create
              <br />
              <span className="text-[var(--accent)]">Account</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
              Join Readora to start reading
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <p className="text-sm text-[var(--accent)] font-bold">{error}</p>
            )}

            <Button type="submit" isLoading={loading} className="w-full">
              Sign Up
            </Button>
          </form>

          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--accent)] font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
