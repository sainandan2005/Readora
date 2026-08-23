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
      <header className="border-b-4 border-[var(--border)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-black text-lg uppercase tracking-tight">
            Admin Dashboard
          </h1>
          <span className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
            {session.user.email}
          </span>
        </div>
      </header>
      <div className="max-w-5xl mx-auto p-6">{children}</div>
    </div>
  );
}
