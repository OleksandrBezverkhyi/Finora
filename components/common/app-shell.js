import Link from "next/link";

import Container from "@/components/common/container";
import { signOut } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    active: true,
  },
  {
    href: "/transactions",
    label: "Transactions",
    active: true,
  },
  {
    href: "/categories",
    label: "Categories",
    active: true,
  },
  {
    href: "/analytics",
    label: "Analytics",
    active: true,
  },
  {
    href: "/budgets",
    label: "Budgets",
    active: true,
  },
  {
    href: "/goals",
    label: "Goals",
    active: true,
  },
];

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
              <p className="muted mt-1 text-sm">
                Personal finance planner for everyday spending and savings
              </p>
              {user ? (
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]/75">
                  {user.name || user.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) =>
                  item.active ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      key={item.label}
                      className="rounded-full border border-[var(--border)] bg-white/55 px-4 py-2 text-sm font-medium text-[var(--muted)]"
                    >
                      {item.label}
                    </span>
                  )
                )}
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
