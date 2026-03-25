"use client";

import TransactionFilterFields from "@/components/transactions/transaction-filter-fields";

function TransactionFiltersHeader() {
  return (
    <div className="space-y-3">
      <p className="eyebrow">Filters</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        Search your history
      </h2>
      <p className="muted text-sm leading-6">
        Narrow the list by period, type, category, amount, or a quick keyword search.
      </p>
    </div>
  );
}

function TransactionFilterActions({ isLoading, onApply, onReset }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onApply}
        disabled={isLoading}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Loading..." : "Apply filters"}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={isLoading}
        className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        Reset
      </button>
    </div>
  );
}

export default function TransactionFilters({
  filterCategories,
  filters,
  isLoading,
  onApply,
  onChange,
  onReset,
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <TransactionFiltersHeader />
      <TransactionFilterFields
        filterCategories={filterCategories}
        filters={filters}
        onChange={onChange}
      />
      <TransactionFilterActions isLoading={isLoading} onApply={onApply} onReset={onReset} />
    </section>
  );
}
