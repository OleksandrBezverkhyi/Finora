import Link from "next/link";

import Container from "@/components/common/container";
import { getSessionUser } from "@/lib/session";
import { signOut } from "@/lib/auth";

const upcomingItems = ["Transactions", "Categories", "Analytics"];

async function handleSignOut() {
  "use server";

  await signOut({ redirectTo: "/login" });
}

export default async function AppShell({ children }) {
  const user = await getSessionUser();

  return (
    <div className="app-shell px-4 py-6 sm:px-6 lg:px-8">
      <Container className="space-y-6">
        <header className="glass-panel rounded-[1.75rem] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/dashboard" className="text-xl font-semibold tracking-tight">
                Finora
              </Link>
              <p className="muted mt-1 text-sm">Personal finance dashboard shell</p>
              {user ? (
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]/75">
                  {user.name || user.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <nav className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)]"
                >
                  Dashboard
                </Link>
                {upcomingItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--border)] bg-white/55 px-4 py-2 text-sm font-medium text-[var(--muted)]"
                  >
                    {item}
                  </span>
                ))}
              </nav>

              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main>
          <Container>{children}</Container>
        </main>
      </Container>
    </div>
  );
}
