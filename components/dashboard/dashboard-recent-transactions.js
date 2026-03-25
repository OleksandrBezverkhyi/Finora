"use client";

import { formatDate, formatMoney } from "@/components/dashboard/dashboard-formatters";

/**
 * Displays the latest transactions for the selected dashboard period.
 *
 * @param {{ transactions: Array<Record<string, any>> }} props
 * @returns {import("react").JSX.Element}
 */
export default function DashboardRecentTransactions({ transactions }) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Recent transactions</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Your latest recorded income and expense operations.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-sm font-medium text-[var(--foreground)]">
          {transactions.length} items
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
            There are no transactions in this period yet.
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/5"
                  style={{ backgroundColor: transaction.category.color || "#0F766E" }}
                />
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {transaction.category.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {transaction.comment || "No comment"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-[var(--foreground)]">
                  {formatMoney(transaction.amount)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(transaction.date)} ·{" "}
                  {transaction.type === "INCOME" ? "Income" : "Expense"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
