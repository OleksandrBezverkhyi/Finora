"use client";

import { formatMoney } from "@/components/dashboard/dashboard-formatters";

function SummaryCard({ hint, label, value }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">{hint}</p>
    </div>
  );
}

export default function DashboardSummaryCards({ totals }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SummaryCard
        label="Income"
        value={formatMoney(totals.income)}
        hint="Money received during the selected period"
      />
      <SummaryCard
        label="Expenses"
        value={formatMoney(totals.expense)}
        hint="Money spent during the selected period"
      />
      <div className="glass-panel rounded-[1.75rem] p-6 sm:col-span-2">
        <p className="text-sm font-medium text-[var(--muted)]">Balance</p>
        <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          {formatMoney(totals.balance)}
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Income minus expenses for the current selection
        </p>
      </div>
    </div>
  );
}
