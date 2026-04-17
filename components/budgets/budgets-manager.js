"use client";

import { useMemo, useState } from "react";

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const initialErrors = {
  categoryId: [],
  amount: [],
  month: [],
  year: [],
};

export default function BudgetsManager({
  initialBudgetData,
  initialCategories,
  initialMonth,
  initialYear,
}) {
  const [budgetData, setBudgetData] = useState(initialBudgetData);
  const [categories] = useState(initialCategories);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [formData, setFormData] = useState({
    categoryId: initialCategories[0]?.id || "",
    amount: "",
  });
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [formError, setFormError] = useState("");
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }, []);

  function resetForm() {
    setEditingId(null);
    setFormData({
      categoryId: categories[0]?.id || "",
      amount: "",
    });
    setFieldErrors(initialErrors);
    setFormError("");
  }

  async function loadBudgets(month, year) {
    setIsLoadingBudgets(true);
    setFormError("");

    try {
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Unable to load budgets right now.");
        return;
      }

      setBudgetData({
        month: data.month,
        year: data.year,
        budgets: data.budgets,
        totals: data.totals,
      });
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsLoadingBudgets(false);
    }
  }

  async function handlePeriodChange(nextMonth, nextYear) {
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    resetForm();
    await loadBudgets(nextMonth, nextYear);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialErrors);

    const payload = {
      ...formData,
      month: selectedMonth,
      year: selectedYear,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/budgets/${editingId}` : "/api/budgets";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialErrors,
            ...data.issues.fieldErrors,
          });
          setFormError(data.issues.formErrors?.[0] || "");
          return;
        }

        setFormError(data.error || "Unable to save budget right now.");
        return;
      }

      setBudgetData((current) => ({
        ...current,
        budgets: sortBudgets(
          editingId
            ? current.budgets.map((budget) => (budget.id === data.budget.id ? data.budget : budget))
            : [...current.budgets, data.budget]
        ),
        totals: recalculateTotals(
          editingId
            ? current.budgets.map((budget) => (budget.id === data.budget.id ? data.budget : budget))
            : [...current.budgets, data.budget]
        ),
      }));

      resetForm();
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(budget) {
    setEditingId(budget.id);
    setFieldErrors(initialErrors);
    setFormError("");
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount,
    });
  }

  async function handleDelete(budgetId) {
    setDeletingId(budgetId);
    setFormError("");

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Unable to delete budget right now.");
        return;
      }

      setBudgetData((current) => {
        const nextBudgets = current.budgets.filter((budget) => budget.id !== budgetId);

        return {
          ...current,
          budgets: nextBudgets,
          totals: recalculateTotals(nextBudgets),
        };
      });

      if (editingId === budgetId) {
        resetForm();
      }
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-5">
        <div className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow">Budget period</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {monthOptions.find((item) => item.value === selectedMonth)?.label} {selectedYear}
              </h2>
              <p className="muted text-sm leading-6">
                Select a month to review category limits and current spending progress.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={selectedMonth}
                onChange={(event) => handlePeriodChange(Number(event.target.value), selectedYear)}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(event) => handlePeriodChange(selectedMonth, Number(event.target.value))}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Planned" value={formatMoney(budgetData.totals.planned)} />
          <SummaryCard label="Spent" value={formatMoney(budgetData.totals.spent)} />
          <SummaryCard
            label="Over limit"
            value={String(budgetData.totals.overLimitCount)}
            hint={budgetData.totals.overLimitCount ? formatMoney(budgetData.totals.overLimitAmount) : "No excess"}
          />
        </div>

        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">{editingId ? "Edit budget" : "Add budget"}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {editingId ? "Update category limit" : "Create spending limit"}
            </h2>
            <p className="muted text-sm leading-6">
              Budgets apply to expense categories for the selected month and update progress based
              on your recorded transactions.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              Add at least one expense category before creating budgets.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Category
                </span>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {renderFieldError("categoryId")}
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Monthly limit, ₴
                </span>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                {renderFieldError("amount")}
              </label>

              {formError ? (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting || categories.length === 0}
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? editingId
                      ? "Saving..."
                      : "Creating..."
                    : editingId
                      ? "Save changes"
                      : "Add budget"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>
          )}
        </section>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Progress</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Category limits and spending
            </h2>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-[var(--muted)]">
            {budgetData.budgets.length} budgets
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {isLoadingBudgets ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              Loading budgets...
            </div>
          ) : budgetData.budgets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              No budgets have been created for this month yet.
            </div>
          ) : (
            budgetData.budgets.map((budget) => (
              <article
                key={budget.id}
                className={
                  "rounded-2xl border px-4 py-4 transition " +
                  (budget.isOverLimit
                    ? "border-rose-300 bg-rose-50/80"
                    : budget.isNearLimit
                      ? "border-amber-200 bg-amber-50/70"
                      : "border-[var(--border)] bg-white/75")
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full border border-black/5"
                        style={{ backgroundColor: budget.category.color || "#0F766E" }}
                      />
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{budget.category.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          Limit {formatMoney(budget.amount)} · Spent {formatMoney(budget.spent)}
                        </p>
                      </div>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200/80">
                      <div
                        className={
                          "h-full rounded-full " +
                          (budget.isOverLimit
                            ? "bg-rose-500"
                            : budget.isNearLimit
                              ? "bg-amber-500"
                              : "bg-[var(--accent)]")
                        }
                        style={{ width: `${Math.max(budget.progressPercent, 6)}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                      <span>{budget.progressPercent}% used</span>
                      {budget.isOverLimit ? (
                        <span className="font-semibold text-rose-700">
                          Over by {formatMoney(budget.overLimitAmount)}
                        </span>
                      ) : (
                        <span>Remaining {formatMoney(budget.remaining)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span className={getStatusBadgeClass(budget.status)}>
                      {budget.isOverLimit
                        ? "Over limit"
                        : budget.isNearLimit
                          ? "Close to limit"
                          : "On track"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(budget)}
                        className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(budget.id)}
                        disabled={deletingId === budget.id}
                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === budget.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function sortBudgets(budgets) {
  return [...budgets].sort((left, right) => left.category.name.localeCompare(right.category.name));
}

function recalculateTotals(budgets) {
  const totals = budgets.reduce(
    (accumulator, budget) => ({
      planned: accumulator.planned + Number(budget.amount),
      spent: accumulator.spent + Number(budget.spent),
      overLimitCount: accumulator.overLimitCount + (budget.isOverLimit ? 1 : 0),
    }),
    {
      planned: 0,
      spent: 0,
      overLimitCount: 0,
    }
  );

  return {
    planned: totals.planned.toFixed(2),
    spent: totals.spent.toFixed(2),
    remaining: Math.max(totals.planned - totals.spent, 0).toFixed(2),
    overLimitAmount: Math.max(totals.spent - totals.planned, 0).toFixed(2),
    overLimitCount: totals.overLimitCount,
  };
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "UAH",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function getStatusBadgeClass(status) {
  if (status === "over") {
    return "rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700";
  }

  if (status === "warning") {
    return "rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700";
  }

  return "rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700";
}
