import DashboardOverview from "@/components/dashboard/dashboard-overview";
import { getDashboardSummary } from "@/lib/dashboard-summary";
import { requireSession } from "@/lib/session";

function DashboardHero({ userName }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="eyebrow">Dashboard</p>
          <h1 className="page-title max-w-2xl text-[var(--foreground)]">{`Welcome back, ${userName}.`}</h1>
          <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
            Keep your finances under control with a clear overview of income, expenses, balance,
            and your latest transactions.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const userName = session.user.name || session.user.email || "User";
  const initialSummary = await getDashboardSummary({
    userId: session.user.id,
    period: "month",
  });

  return (
    <div className="space-y-8">
      <DashboardHero userName={userName} />
      <DashboardOverview initialSummary={initialSummary} />
    </div>
  );
}
