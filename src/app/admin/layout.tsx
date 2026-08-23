import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/library");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/70 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="font-display text-lg font-semibold italic">
            Admin Dashboard
          </h1>
          <span className="text-xs text-[var(--muted-foreground)]">
            {session.user.email}
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-6 lg:p-8">{children}</div>
    </div>
  );
}
