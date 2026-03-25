"use client";

const periodOptions = [
  { value: "", label: "All time" },
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
];

const typeOptions = [
  { value: "", label: "All types" },
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
];

const sortOptions = [
  { value: "date_desc", label: "Date: newest first" },
  { value: "date_asc", label: "Date: oldest first" },
  { value: "amount_desc", label: "Amount: highest first" },
  { value: "amount_asc", label: "Amount: lowest first" },
];

/**
 * Collection of transaction filter form fields used on the transactions page.
 *
 * @param {{
 *   filterCategories: Array<{ id: string, name: string }>,
 *   filters: Record<string, string>,
 *   onChange: (event: Event) => void
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function TransactionFilterFields({ filterCategories, filters, onChange }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <TransactionPrimaryFilters filters={filters} onChange={onChange} />
      {filters.period === "custom" ? (
        <TransactionRangeFilters filters={filters} onChange={onChange} />
      ) : null}
      <TransactionSecondaryFilters
        filterCategories={filterCategories}
        filters={filters}
        onChange={onChange}
      />
    </div>
  );
}

function TransactionPrimaryFilters({ filters, onChange }) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Period
        </span>
        <select
          name="period"
          value={filters.period}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          {periodOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Type
        </span>
        <select
          name="type"
          value={filters.type}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          {typeOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function TransactionRangeFilters({ filters, onChange }) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          From
        </span>
        <input
          name="from"
          type="date"
          value={filters.from}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          To
        </span>
        <input
          name="to"
          type="date"
          value={filters.to}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </label>
    </>
  );
}

function TransactionSecondaryFilters({ filterCategories, filters, onChange }) {
  return (
    <>
      <TransactionLookupFilters
        filterCategories={filterCategories}
        filters={filters}
        onChange={onChange}
      />
      <TransactionAmountAndSortFilters filters={filters} onChange={onChange} />
    </>
  );
}

function TransactionLookupFilters({ filterCategories, filters, onChange }) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Category
        </span>
        <select
          name="categoryId"
          value={filters.categoryId}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          <option value="">All categories</option>
          {filterCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Search
        </span>
        <input
          name="q"
          type="text"
          value={filters.q}
          onChange={onChange}
          placeholder="Comment or category"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </label>
    </>
  );
}

function TransactionAmountAndSortFilters({ filters, onChange }) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Min amount
        </span>
        <input
          name="min"
          type="number"
          min="0"
          step="0.01"
          value={filters.min}
          onChange={onChange}
          placeholder="0.00"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Max amount
        </span>
        <input
          name="max"
          type="number"
          min="0"
          step="0.01"
          value={filters.max}
          onChange={onChange}
          placeholder="0.00"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </label>

      <label className="block space-y-2 md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Sort
        </span>
        <select
          name="sort"
          value={filters.sort}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
