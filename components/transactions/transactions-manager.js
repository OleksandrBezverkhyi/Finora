"use client";

import Link from "next/link";
import { useState } from "react";

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

const initialFilterState = {
  period: "",
  from: "",
  to: "",
  type: "",
  categoryId: "",
  q: "",
  min: "",
  max: "",
  sort: "date_desc",
};

const initialFieldErrors = {
  type: [],
  categoryId: [],
  amount: [],
  date: [],
  comment: [],
};

export default function TransactionsManager({
  categories,
  initialTransactions,
  initialPagination,
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilterState);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() =>
    createInitialFormState(categories, initialTransactions[0]?.type)
  );

  const formCategories = categories.filter((category) => category.type === formData.type);
  const filterCategories = filters.type
    ? categories.filter((category) => category.type === filters.type)
    : categories;

  async function fetchTransactions(nextPage = 1, nextFilters = filters) {
    setIsLoading(true);
    setListError("");

    try {
      const params = new URLSearchParams();

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (!value) {
          return;
        }

        if (key === "from" || key === "to") {
          if (nextFilters.period !== "custom") {
            return;
          }
        }

        params.set(key, value);
      });

      params.set("page", String(nextPage));

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        method: "GET",
      });
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error || "Unable to load transactions right now.");
        return;
      }

      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch {
      setListError("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTransaction(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialFieldErrors);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialFieldErrors,
            ...data.issues.fieldErrors,
          });
          setFormError(data.issues.formErrors?.[0] || "");
          return;
        }

        setFormError(data.error || "Unable to save transaction right now.");
        return;
      }

      const nextFormState = createInitialFormState(categories, formData.type);
      setFormData(nextFormState);
      await fetchTransactions(1, filters);
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    if (name === "type") {
      const nextCategory = categories.find((category) => category.type === value);

      setFormData((current) => ({
        ...current,
        type: value,
        categoryId: nextCategory?.id || "",
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "period" && value !== "custom") {
        next.from = "";
        next.to = "";
      }

      if (name === "type") {
        const categoryStillValid = categories.some(
          (category) => category.id === current.categoryId && (!value || category.type === value)
        );

        if (!categoryStillValid) {
          next.categoryId = "";
        }
      }

      return next;
    });
  }

  async function applyFilters() {
    await fetchTransactions(1, filters);
  }

  async function resetFilters() {
    setFilters(initialFilterState);
    await fetchTransactions(1, initialFilterState);
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">Add transaction</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Create income and expense records
            </h2>
            <p className="muted text-sm leading-6">
              Add each operation as soon as it happens to keep your balance and reports accurate.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] px-4 py-5">
              <p className="font-medium text-[var(--foreground)]">
                Add categories before creating your first transaction.
              </p>
              <p className="muted mt-2 text-sm leading-6">
                Start with a few categories for income and expenses, then come back here to record
                your operations.
              </p>
              <Link
                href="/categories"
                className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Open categories
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCreateTransaction} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Type
                </span>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                >
                  {typeOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {renderFieldError("type")}
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Category
                </span>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleFormChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                >
                  {formCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {renderFieldError("categoryId")}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Amount, ₴
                  </span>
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                  {renderFieldError("amount")}
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Date
                  </span>
                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                  {renderFieldError("date")}
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Comment
                </span>
                <textarea
                  name="comment"
                  rows="4"
                  value={formData.comment}
                  onChange={handleFormChange}
                  placeholder="Optional note"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                {renderFieldError("comment")}
              </label>

              {formError ? (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || !formCategories.length}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Add transaction"}
              </button>
            </form>
          )}
        </section>

        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">Filters</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Search your history
            </h2>
            <p className="muted text-sm leading-6">
              Narrow the list by period, type, category, amount, or a quick keyword search.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Period
              </span>
              <select
                name="period"
                value={filters.period}
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              >
                {typeOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {filters.period === "custom" ? (
              <>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    From
                  </span>
                  <input
                    name="from"
                    type="date"
                    value={filters.from}
                    onChange={handleFilterChange}
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
                    onChange={handleFilterChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                </label>
              </>
            ) : null}

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Category
              </span>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
                placeholder="Comment or category"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              />
            </label>

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
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={applyFilters}
              disabled={isLoading}
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Loading..." : "Apply filters"}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              disabled={isLoading}
              className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Reset
            </button>
          </div>
        </section>
      </div>

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
                  <tr key={transaction.id} className="rounded-2xl bg-white/75 shadow-[0_8px_24px_rgba(68,53,31,0.06)]">
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
                        <span className="font-medium text-[var(--foreground)]">
                          {transaction.category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--muted)]">
                      {transaction.comment || "No comment"}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 text-sm font-semibold text-[var(--foreground)]">
                      {formatMoney(transaction.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
      </section>
    </div>
  );
}

function createInitialFormState(categories, preferredType = "EXPENSE") {
  const nextType =
    categories.some((category) => category.type === preferredType) ? preferredType : "INCOME";
  const nextCategory = categories.find((category) => category.type === nextType) || categories[0];

  return {
    type: nextCategory?.type || "EXPENSE",
    categoryId: nextCategory?.id || "",
    amount: "",
    date: formatDateInput(new Date()),
    comment: "",
  };
}

function formatDateInput(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(amount) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

function getVisiblePages(currentPage, totalPages) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const pages = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return [...new Set(pages)];
}
