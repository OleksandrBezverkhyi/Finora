"use client";

import {
  formatDate,
  formatMoney,
  getVisiblePages,
} from "@/components/transactions/transaction-utils";

function TransactionRow({ transaction }) {
  return (
    <tr className="rounded-2xl bg-white/75 shadow-[0_8px_24px_rgba(68,53,31,0.06)]">
      <td className="rounded-l-2xl px-4 py-4 text-sm text-[var(--foreground)]">
        {formatDate(transaction.date)}
      </td>
      <td className="px-4 py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            transaction.type === "INCOME"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {transaction.type === "INCOME" ? "Income" : "Expense"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className="h-3.5 w-3.5 rounded-full border border-black/5"
            style={{ backgroundColor: transaction.category.color || "#0F766E" }}
          />
          <span className="font-medium text-[var(--foreground)]">{transaction.category.name}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-[var(--muted)]">
        {transaction.comment || "No comment"}
      </td>
      <td className="rounded-r-2xl px-4 py-4 text-sm font-semibold text-[var(--foreground)]">
        {formatMoney(transaction.amount)}
      </td>
    </tr>
  );
}

function TransactionPagination({ fetchTransactions, isLoading, pagination }) {
  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--muted)]">
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fetchTransactions(pagination.page - 1)}
          disabled={pagination.page <= 1 || isLoading}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {getVisiblePages(pagination.page, pagination.totalPages).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => fetchTransactions(pageNumber)}
            disabled={isLoading}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              pageNumber === pagination.page
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => fetchTransactions(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || isLoading}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Paginated transaction history table.
 *
 * @param {{
 *   fetchTransactions: (page?: number) => Promise<void>,
 *   isLoading: boolean,
 *   listError: string,
 *   pagination: { page: number, totalPages: number, total: number },
 *   transactions: Array<Record<string, any>>
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function TransactionHistory({
  fetchTransactions,
  isLoading,
  listError,
  pagination,
  transactions,
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="eyebrow">History</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Transactions list
          </h2>
          <p className="muted text-sm leading-6">
            Showing page {pagination.page} of {pagination.totalPages}. Total entries:{" "}
            {pagination.total}.
          </p>
        </div>

        <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
          {isLoading ? "Refreshing..." : `${transactions.length} visible`}
        </div>
      </div>

      {listError ? (
        <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {listError}
        </div>
      ) : null}

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Comment</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]"
                >
                  No transactions match the selected filters yet.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TransactionPagination
        fetchTransactions={fetchTransactions}
        isLoading={isLoading}
        pagination={pagination}
      />
    </section>
  );
}
