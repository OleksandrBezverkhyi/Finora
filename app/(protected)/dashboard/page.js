export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Dashboard</p>
            <h1 className="page-title max-w-2xl text-[var(--foreground)]">
              Financial snapshot for the product shell.
            </h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
              This protected page is a placeholder for period filters, summary cards, recent
              transactions, and recommendation widgets.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            Period switcher coming next
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-sm font-medium text-[var(--muted)]">Income</p>
            <p className="mt-6 text-4xl font-semibold tracking-tight">$0.00</p>
            <p className="mt-3 text-sm text-[var(--muted)]">Summary card placeholder</p>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-sm font-medium text-[var(--muted)]">Expenses</p>
            <p className="mt-6 text-4xl font-semibold tracking-tight">$0.00</p>
            <p className="mt-3 text-sm text-[var(--muted)]">Summary card placeholder</p>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-6 sm:col-span-2">
            <p className="text-sm font-medium text-[var(--muted)]">Recent activity</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
                <span className="font-medium">No transactions yet</span>
                <span className="text-sm text-[var(--muted)]">waiting for CRUD</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
                <span className="font-medium">Budgets</span>
                <span className="text-sm text-[var(--muted)]">planning module later</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <p className="text-sm font-medium text-[var(--muted)]">Alerts</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-4">
              <p className="font-semibold text-[var(--foreground)]">No warnings yet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Recommendation rules will show budget overruns and spending spikes here.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-4">
              <p className="font-semibold text-[var(--foreground)]">Analytics widget placeholder</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Trend and top-category data will be added after the dashboard API.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
