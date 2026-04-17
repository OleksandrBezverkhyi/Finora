"use client";

import { useRef, useState } from "react";
import { format, isValid, parse, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const periodOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
];

const incomeColor = "#0F766E";
const expenseColor = "#EA580C";

const emptyCustomRange = {
  fromDay: "",
  fromMonth: "",
  fromYear: "",
  toDay: "",
  toMonth: "",
  toYear: "",
};

export default function AnalyticsOverview({ initialTrend, initialByCategory, initialCompare }) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialTrend.period.type || "month");
  const [customRange, setCustomRange] = useState(emptyCustomRange);
  const [trend, setTrend] = useState(initialTrend);
  const [byCategory, setByCategory] = useState(initialByCategory);
  const [compare, setCompare] = useState(initialCompare);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fromDayRef = useRef(null);
  const fromMonthRef = useRef(null);
  const fromYearRef = useRef(null);
  const toDayRef = useRef(null);
  const toMonthRef = useRef(null);
  const toYearRef = useRef(null);

  const trendData = trend.points.map((point) => ({
    ...point,
    income: Number(point.income),
    expense: Number(point.expense),
    balance: Number(point.balance),
    label: format(parseISO(point.date), "dd MMM"),
  }));

  const categoryChartData = byCategory.categories.map((category) => ({
    ...category,
    amount: Number(category.amount),
  }));

  async function loadAnalytics({ period, from, to }) {
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

      const query = params.toString();
      const [trendResponse, byCategoryResponse, compareResponse] = await Promise.all([
        fetch("/api/analytics/trend?" + query),
        fetch("/api/analytics/by-category?" + query),
        fetch("/api/analytics/compare?" + query),
      ]);

      const [trendDataResponse, byCategoryDataResponse, compareDataResponse] = await Promise.all([
        trendResponse.json(),
        byCategoryResponse.json(),
        compareResponse.json(),
      ]);

      if (!trendResponse.ok || !byCategoryResponse.ok || !compareResponse.ok) {
        setError(
          trendDataResponse.error ||
            byCategoryDataResponse.error ||
            compareDataResponse.error ||
            "Unable to load analytics right now."
        );
        return;
      }

      setTrend(trendDataResponse);
      setByCategory(byCategoryDataResponse);
      setCompare(compareDataResponse);
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePeriodSelect(period) {
    setSelectedPeriod(period);

    if (period !== "custom") {
      setCustomRange(emptyCustomRange);
      await loadAnalytics({ period });
    }
  }

  function handleRangePartChange(event) {
    const { name, value } = event.target;
    const digitsOnly = value.replace(/\D/g, "");
    const isYearField = name.endsWith("Year");
    const maxLength = isYearField ? 4 : 2;
    const rawValue = digitsOnly.slice(0, maxLength);
    const nextValue = isYearField ? rawValue : normalizeDatePart(name, rawValue);

    setCustomRange((current) => ({
      ...current,
      [name]: nextValue,
    }));
    setError("");

    if (!isYearField && rawValue.length === 2) {
      getNextDatePartRef(name, {
        fromMonthRef,
        fromYearRef,
        toMonthRef,
        toYearRef,
      })?.current?.focus();
    }
  }

  function handleRangePartFocus(event) {
    event.target.select();
  }

  function handleRangePartBlur(event) {
    const { name, value } = event.target;

    if (name.endsWith("Day") || name.endsWith("Month")) {
      const normalizedValue = normalizeDatePart(name, value, { padSingleDigit: true });

      setCustomRange((current) => ({
        ...current,
        [name]: normalizedValue,
      }));
    }
  }

  async function applyCustomRange() {
    const hasCompleteFrom = Boolean(
      customRange.fromDay && customRange.fromMonth && customRange.fromYear
    );
    const hasCompleteTo = Boolean(customRange.toDay && customRange.toMonth && customRange.toYear);

    if (!hasCompleteFrom || !hasCompleteTo) {
      setError("Choose both from and to dates for a custom analytics range.");
      return;
    }

    const from = parseDateParts({
      day: customRange.fromDay,
      month: customRange.fromMonth,
      year: customRange.fromYear,
    });
    const to = parseDateParts({
      day: customRange.toDay,
      month: customRange.toMonth,
      year: customRange.toYear,
    });

    if (!from || !to) {
      setError("Please enter valid custom dates.");
      return;
    }

    if (from > to) {
      setError("The start date must be earlier than or equal to the end date.");
      return;
    }

    await loadAnalytics({
      period: "custom",
      from,
      to,
    });
  }

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Insights</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Trends, categories, and period comparison
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">
              Review your financial flow over time, see where most expenses go, and compare this
              period against the previous one.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePeriodSelect(option.value)}
                  className={
                    "rounded-full px-4 py-2 text-sm font-semibold transition " +
                    (selectedPeriod === option.value
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]")
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            {selectedPeriod === "custom" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <DateSegmentField
                  label="From"
                  partNames={{
                    day: "fromDay",
                    month: "fromMonth",
                    year: "fromYear",
                  }}
                  values={{
                    day: customRange.fromDay,
                    month: customRange.fromMonth,
                    year: customRange.fromYear,
                  }}
                  refs={{
                    day: fromDayRef,
                    month: fromMonthRef,
                    year: fromYearRef,
                  }}
                  onChange={handleRangePartChange}
                  onFocus={handleRangePartFocus}
                  onBlur={handleRangePartBlur}
                />
                <DateSegmentField
                  label="To"
                  partNames={{
                    day: "toDay",
                    month: "toMonth",
                    year: "toYear",
                  }}
                  values={{
                    day: customRange.toDay,
                    month: customRange.toMonth,
                    year: customRange.toYear,
                  }}
                  refs={{
                    day: toDayRef,
                    month: toMonthRef,
                    year: toYearRef,
                  }}
                  onChange={handleRangePartChange}
                  onFocus={handleRangePartFocus}
                  onBlur={handleRangePartBlur}
                />
                <button
                  type="button"
                  onClick={applyCustomRange}
                  disabled={isLoading}
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:self-end"
                >
                  {isLoading ? "Loading..." : "Apply"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                {isLoading ? "Refreshing analytics..." : formatRangeLabel(trend.period)}
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

      <section className="glass-panel rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">Income and expense trend</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Daily dynamics for the selected period.
            </p>
          </div>
          <div className="flex gap-2 text-xs font-medium text-[var(--muted)]">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[var(--accent-strong)]">
              Income
            </span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">Expense</span>
          </div>
        </div>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(76, 58, 35, 0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6d655d", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6d655d", fontSize: 12 }} tickFormatter={formatMoneyCompact} />
              <Tooltip content={<TrendTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="income" name="Income" stroke={incomeColor} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke={expenseColor} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Expense structure</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Categories that shape your spending in this period.
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-white/75 px-3 py-1 text-sm font-medium text-[var(--foreground)]">
              {formatMoney(byCategory.totalExpense)} total
            </span>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-sm text-[var(--muted)]">
              No expense data is available for this period yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={64}
                      outerRadius={96}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry) => (
                        <Cell key={entry.categoryId} fill={entry.color || expenseColor} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {categoryChartData.map((category) => (
                  <div
                    key={category.categoryId}
                    className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/5"
                          style={{ backgroundColor: category.color || expenseColor }}
                        />
                        <span className="font-medium text-[var(--foreground)]">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {formatMoney(category.amount)}
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-stone-200/80">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: String(Math.min(category.sharePercent, 100)) + "%",
                          backgroundColor: category.color || expenseColor,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-[var(--muted)]">
                      {category.sharePercent}% of total expenses
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categoryChartData.length > 0 ? (
            <div className="mt-8 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
                  <CartesianGrid stroke="rgba(76, 58, 35, 0.08)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={100} tick={{ fill: "#6d655d", fontSize: 12 }} />
                  <Tooltip content={<CategoryTooltip />} />
                  <Bar dataKey="amount" radius={[0, 10, 10, 0]}>
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color || expenseColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <p className="text-sm font-medium text-[var(--muted)]">Current vs previous period</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Compare how your income, expenses, and balance changed versus the previous period.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <CompareSnapshotCard label="Current period" values={compare.current} period={compare.period.current} />
            <CompareSnapshotCard label="Previous period" values={compare.previous} period={compare.period.previous} />
          </div>

          <div className="mt-6 space-y-3">
            <CompareDeltaRow label="Income" value={compare.change.income} accent="positive" />
            <CompareDeltaRow label="Expenses" value={compare.change.expense} accent="expense" />
            <CompareDeltaRow label="Balance" value={compare.change.balance} accent="neutral" />
          </div>
        </div>
      </section>
    </div>
  );
}

function CompareSnapshotCard({ label, values, period }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
      <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{formatRangeLabel(period)}</p>
      <div className="mt-4 space-y-3 text-sm">
        <SnapshotRow label="Income" value={values.income} />
        <SnapshotRow label="Expenses" value={values.expense} />
        <SnapshotRow label="Balance" value={values.balance} />
      </div>
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-semibold text-[var(--foreground)]">{formatMoney(value)}</span>
    </div>
  );
}

function CompareDeltaRow({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-[var(--foreground)]">{label}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Difference from the previous period</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--foreground)]">{formatSignedMoney(value.amount)}</p>
          <span className={"mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold " + getDeltaBadgeClass(value, accent)}>
            {formatPercent(value.percent)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      <div className="mt-2 space-y-1 text-sm">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-medium text-[var(--foreground)]">{formatMoney(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DateSegmentField({ label, partNames, values, refs, onChange, onFocus, onBlur }) {
  return (
    <div className="w-full space-y-2 sm:max-w-[15rem]">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      <div className="flex w-full items-center rounded-2xl border border-[var(--border)] bg-white px-4 py-3 transition focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--accent-soft)]">
        <input
          ref={refs.day}
          name={partNames.day}
          type="text"
          inputMode="numeric"
          maxLength="2"
          placeholder="dd"
          value={values.day}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-10 border-0 bg-transparent p-0 text-center text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/70"
        />
        <span className="px-2 text-base font-semibold text-[var(--muted)]">/</span>
        <input
          ref={refs.month}
          name={partNames.month}
          type="text"
          inputMode="numeric"
          maxLength="2"
          placeholder="mm"
          value={values.month}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-10 border-0 bg-transparent p-0 text-center text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/70"
        />
        <span className="px-2 text-base font-semibold text-[var(--muted)]">/</span>
        <input
          ref={refs.year}
          name={partNames.year}
          type="text"
          inputMode="numeric"
          maxLength="4"
          placeholder="yyyy"
          value={values.year}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-16 border-0 bg-transparent p-0 text-center text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/70"
        />
      </div>
    </div>
  );
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const category = payload[0].payload;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-[var(--foreground)]">{category.name}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{formatMoney(category.amount)}</p>
      <p className="mt-1 text-xs font-medium text-[var(--muted)]">{category.sharePercent}% of expenses</p>
    </div>
  );
}

function parseDateParts({ day, month, year }) {
  const normalizedDay = day.trim();
  const normalizedMonth = month.trim();
  const normalizedYear = year.trim();

  if (!normalizedDay || !normalizedMonth || !normalizedYear) {
    return null;
  }

  const paddedDay = normalizedDay.padStart(2, "0");
  const paddedMonth = normalizedMonth.padStart(2, "0");
  const parsed = parse(
    normalizedYear + "-" + paddedMonth + "-" + paddedDay,
    "yyyy-MM-dd",
    new Date()
  );

  if (!isValid(parsed)) {
    return null;
  }

  return format(parsed, "yyyy-MM-dd");
}

function normalizeDatePart(name, value, options = {}) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  const numericValue = Number(digitsOnly);
  const maxValue = name.endsWith("Month") ? 12 : 31;
  const clampedValue = Math.min(Math.max(numericValue, 1), maxValue);

  if (digitsOnly.length >= 2 || options.padSingleDigit) {
    return String(clampedValue).padStart(2, "0");
  }

  return digitsOnly;
}

function getNextDatePartRef(name, refs) {
  if (name === "fromDay") {
    return refs.fromMonthRef;
  }

  if (name === "fromMonth") {
    return refs.fromYearRef;
  }

  if (name === "toDay") {
    return refs.toMonthRef;
  }

  if (name === "toMonth") {
    return refs.toYearRef;
  }

  return null;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "UAH",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatSignedMoney(value) {
  const amount = Number(value);

  if (amount > 0) {
    return "+" + formatMoney(amount);
  }

  if (amount < 0) {
    return "-" + formatMoney(Math.abs(amount));
  }

  return formatMoney(0);
}

function formatMoneyCompact(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatPercent(value) {
  if (value === null || Number.isNaN(value)) {
    return "No baseline";
  }

  if (value > 0) {
    return "+" + value + "%";
  }

  return value + "%";
}

function formatRangeLabel(period) {
  const from = period.from ? format(parseISO(period.from), "dd MMM yyyy") : "beginning";
  const to = period.to ? format(parseISO(period.to), "dd MMM yyyy") : "now";

  return from + " - " + to;
}

function getDeltaBadgeClass(value, accent) {
  if (value.percent === null) {
    return "bg-stone-200 text-stone-700";
  }

  if (accent === "expense") {
    return Number(value.amount) > 0
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";
  }

  if (Number(value.amount) > 0) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (Number(value.amount) < 0) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-stone-200 text-stone-700";
}
