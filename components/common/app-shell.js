import Link from "next/link";

import Container from "@/components/common/container";

const upcomingItems = ["Transactions", "Categories", "Analytics"];

export default function AppShell({ children }) {
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
            </div>

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
          </div>
        </header>

        <main>
          <Container>{children}</Container>
        </main>
      </Container>
    </div>
  );
}
