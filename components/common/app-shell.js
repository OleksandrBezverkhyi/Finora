import Link from "next/link";

import Container from "@/components/common/container";
import LocaleSwitcher from "@/components/common/locale-switcher";
import NavLinks from "@/components/common/nav-links";
import { getServerMessages } from "@/lib/server-locale";
import { getSessionUser } from "@/lib/session";

export default async function AppShell({ children }) {
  const user = await getSessionUser();
  const messages = await getServerMessages();
  const navItems = [
    { href: "/dashboard", label: messages.nav.dashboard },
    { href: "/transactions", label: messages.nav.transactions },
    { href: "/categories", label: messages.nav.categories },
    { href: "/analytics", label: messages.nav.analytics },
    { href: "/budgets", label: messages.nav.budgets },
    { href: "/goals", label: messages.nav.goals },
    { href: "/profile", label: messages.nav.profile },
  ];

  return (
    <div className="app-shell px-4 py-6 sm:px-6 lg:px-8">
      <Container className="space-y-6">
        <header className="glass-panel rounded-[1.75rem] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/dashboard" className="text-xl font-semibold tracking-tight">
                {messages.common.appName}
              </Link>
              <p className="muted mt-1 text-sm">{messages.appShell.tagline}</p>
              {user ? (
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]/75">
                  {user.name || user.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <LocaleSwitcher />
              <NavLinks items={navItems} />
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
