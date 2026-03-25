"use client";

import DashboardPeriodControls from "@/components/dashboard/dashboard-period-controls";
import DashboardRecentTransactions from "@/components/dashboard/dashboard-recent-transactions";
import DashboardSummaryCards from "@/components/dashboard/dashboard-summary-cards";
import DashboardTopCategories from "@/components/dashboard/dashboard-top-categories";
import useDashboardSummary from "@/components/dashboard/use-dashboard-summary";

const periodOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
];

export default function DashboardOverview({ initialSummary }) {
  const {
    applyCustomRange,
    customRange,
    error,
    handlePeriodSelect,
    handleRangeChange,
    isLoading,
    selectedPeriod,
    summary,
  } = useDashboardSummary(initialSummary);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Overview</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Your financial picture at a glance
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">
              Review income, expenses, balance, spending categories, and your latest activity for
              any period you choose.
            </p>
          </div>
          <DashboardPeriodControls
            customRange={customRange}
            isLoading={isLoading}
            onApply={applyCustomRange}
            onPeriodSelect={handlePeriodSelect}
            onRangeChange={handleRangeChange}
            periodOptions={periodOptions}
            selectedPeriod={selectedPeriod}
            summaryPeriod={summary.period}
          />
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardSummaryCards totals={summary.totals} />
        <DashboardTopCategories categories={summary.topExpenseCategories} />
      </section>

      <DashboardRecentTransactions transactions={summary.recentTransactions} />
    </div>
  );
}
