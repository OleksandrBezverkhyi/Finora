"use client";

import { useState } from "react";

const periodOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
];

export default function DashboardOverview({ initialSummary }) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialSummary.period.type || "month");
  const [customRange, setCustomRange] = useState({
    from: toDateInputValue(initialSummary.period.from),
    to: toDateInputValue(initialSummary.period.to),
  });
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadSummary({ period, from, to }) {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("period", period);

      if (period === "custom") {
        if (from) {
          params.set("from", from);
        }

        if (to) {
          params.set("to", to);
        }
      }

      const response = await fetch(`/api/analytics/summary?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load dashboard summary right now.");
        return;
      }

      setSummary(data);
    } catch (requestError) {
      console.error("Load dashboard summary failed", requestError);
      setError("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePeriodSelect(nextPeriod) {
    setSelectedPeriod(nextPeriod);

    if (nextPeriod !== "custom") {
      setCustomRange({ from: "", to: "" });
      await loadSummary({ period: nextPeriod });
    }
  }

  function handleRangeChange(event) {
    const { name, value } = event.target;

    setCustomRange((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function applyCustomRange() {
    await loadSummary({
      period: "custom",
      from: customRange.from,
      to: customRange.to,
    });
  }

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Overview</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Summary for the selected period
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">
              Income, expenses, balance, top expense categories, and recent transactions update
              from the analytics summary endpoint.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePeriodSelect(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedPeriod === option.value
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {selectedPeriod === "custom" ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  name="from"
                  type="date"
                  value={customRange.from}
                  onChange={handleRangeChange}
                  className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                <input
                  name="to"
                  type="date"
                  value={customRange.to}
                  onChange={handleRangeChange}
                  className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                <button
                  type="button"
                  onClick={applyCustomRange}
                  disabled={isLoading}
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Loading..." : "Apply"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                {isLoading ? "Refreshing dashboard..." : formatPeriodLabel(summary.period)}
              </p>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          <SummaryCard
            label="Income"
            value={formatMoney(summary.totals.income)}
            hint="Total recorded income in the selected period"
          />
          <SummaryCard
            label="Expenses"
            value={formatMoney(summary.totals.expense)}
            hint="Total recorded expenses in the selected period"
          />
          <div className="glass-panel rounded-[1.75rem] p-6 sm:col-span-2">
            <p className="text-sm font-medium text-[var(--muted)]">Balance</p>
            <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              {formatMoney(summary.totals.balance)}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Income minus expenses for the current selection
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <p className="text-sm font-medium text-[var(--muted)]">Top expense categories</p>
          <div className="mt-6 space-y-4">
            {summary.topExpenseCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
                No expense activity in the selected period.
              </div>
            ) : (
              summary.topExpenseCategories.map((category, index) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[var(--muted)]">#{index + 1}</span>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/5"
                      style={{ backgroundColor: category.color || "#C2410C" }}
                    />
                    <span className="font-medium text-[var(--foreground)]">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {formatMoney(category.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">Recent transactions</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Latest entries inside the selected period.
            </p>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-sm font-medium text-[var(--foreground)]">
            {summary.recentTransactions.length} items
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {summary.recentTransactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              No transactions recorded in this period yet.
            </div>
          ) : (
            summary.recentTransactions.map((transaction) => (
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
    </div>
  );
}

function SummaryCard({ label, value, hint }) {
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

function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPeriodLabel(period) {
  const from = period.from ? formatDate(period.from) : "beginning";
  const to = period.to ? formatDate(period.to) : "now";

  return `${from} - ${to}`;
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}
