"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
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

import DayFirstDateInput from "@/components/common/day-first-date-input";
import { useLocale } from "@/components/common/locale-provider";
import { canShiftPeriodForward, shiftPeriodRange, toDateParam } from "@/lib/date";
import { getDateFnsLocale, interpolate } from "@/lib/i18n";

const incomeColor = "#0F766E";
const expenseColor = "#EA580C";

export default function AnalyticsOverview({ initialTrend, initialByCategory, initialCompare }) {
  const { locale, currency, formatMoney, messages, translateErrorMessage } = useLocale();
  const periodOptions = useMemo(
    () => [
      { value: "day", label: messages.periods.day },
      { value: "week", label: messages.periods.week },
      { value: "month", label: messages.periods.month },
      { value: "all", label: messages.periods.all },
      { value: "custom", label: messages.periods.custom },
    ],
    [messages]
  );
  const dateFnsLocale = getDateFnsLocale(locale);
  const [selectedPeriod, setSelectedPeriod] = useState(initialTrend.period.type || "month");
  const [customRange, setCustomRange] = useState({ from: toDateInputValue(initialTrend.period.from), to: toDateInputValue(initialTrend.period.to) });
  const [trend, setTrend] = useState(initialTrend);
  const [byCategory, setByCategory] = useState(initialByCategory);
  const [compare, setCompare] = useState(initialCompare);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const canMoveForward = canShiftPeriodForward(
    selectedPeriod,
    trend.period?.from,
    trend.period?.to
  );

  const trendData = trend.points.map((point) => ({
    ...point,
    income: Number(point.income),
    expense: Number(point.expense),
    balance: Number(point.balance),
    label: format(parseISO(point.date), "dd MMM", { locale: dateFnsLocale }),
  }));

  const categoryChartData = byCategory.categories.map((category) => ({ ...category, amount: Number(category.amount) }));
  const visibleCategoryItems = showAllCategories
    ? categoryChartData
    : categoryChartData.slice(0, 8);

  async function loadAnalytics({ period, from, to }) {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("period", period);

      if (from) params.set("from", from);
      if (to) params.set("to", to);

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
          translateErrorMessage(
            trendDataResponse.error ||
              byCategoryDataResponse.error ||
              compareDataResponse.error ||
              "Unable to load analytics right now."
          )
        );
        return;
      }

      setTrend(trendDataResponse);
      setByCategory(byCategoryDataResponse);
      setCompare(compareDataResponse);
      setShowAllCategories(false);
    } catch {
      setError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePeriodSelect(period) {
    setSelectedPeriod(period);
    if (period !== "custom") {
      setCustomRange({ from: "", to: "" });
      await loadAnalytics({ period });
    }
  }

  function handleRangeChange(event) {
    const { name, value } = event.target;
    setCustomRange((current) => ({ ...current, [name]: value }));
  }

  async function applyCustomRange() {
    await loadAnalytics({ period: "custom", from: customRange.from, to: customRange.to });
  }

  async function shiftSelectedPeriod(direction) {
    if (selectedPeriod === "custom" || selectedPeriod === "all") {
      return;
    }

    if (direction > 0 && !canMoveForward) {
      return;
    }

    const shiftedRange = shiftPeriodRange(
      selectedPeriod,
      trend.period?.from,
      trend.period?.to,
      direction
    );

    await loadAnalytics({
      period: selectedPeriod,
      from: toDateParam(shiftedRange.start),
      to: toDateParam(shiftedRange.end),
    });
  }

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.common.insights}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{messages.analytics.title}</h2>
            <p className="muted max-w-2xl text-sm leading-6">{messages.analytics.description}</p>
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <DayFirstDateInput name="from" value={customRange.from} onChange={handleRangeChange} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />
                <DayFirstDateInput name="to" value={customRange.to} onChange={handleRangeChange} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />
                <button type="button" onClick={applyCustomRange} disabled={isLoading} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70">
                  {isLoading ? messages.common.loading : messages.common.apply}
                </button>
              </div>
            ) : selectedPeriod === "all" ? (
              <p className="text-sm text-[var(--muted)]">
                {isLoading
                  ? messages.analytics.refreshing
                  : formatRangeLabel(trend.period, locale, dateFnsLocale, messages)}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <button
                  type="button"
                  onClick={() => shiftSelectedPeriod(-1)}
                  disabled={isLoading}
                  aria-label={messages.common.previous}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-base text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ←
                </button>
                <p className="min-w-[14rem] text-center text-sm text-[var(--muted)]">
                  {isLoading
                    ? messages.analytics.refreshing
                    : formatRangeLabel(trend.period, locale, dateFnsLocale, messages)}
                </p>
                <button
                  type="button"
                  onClick={() => shiftSelectedPeriod(1)}
                  disabled={isLoading || !canMoveForward}
                  aria-label={messages.common.next}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-base text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {error ? <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
      </section>

      <div
        className={
          "space-y-8 transition-all duration-300 " +
          (isLoading ? "translate-y-1 opacity-60" : "translate-y-0 opacity-100")
        }
      >
        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">{messages.analytics.expenseStructure}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{messages.analytics.expenseStructureDescription}</p>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-white/75 px-3 py-1 text-sm font-medium text-[var(--foreground)]">
              {interpolate(messages.analytics.totalExpenses, { amount: formatMoney(byCategory.totalExpense) })}
            </span>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-sm text-[var(--muted)]">{messages.analytics.noExpenseData}</div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryChartData} dataKey="amount" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={3}>
                      {categoryChartData.map((entry) => <Cell key={entry.categoryId} fill={entry.color || expenseColor} />)}
                    </Pie>
                    <Tooltip content={<CategoryTooltip locale={locale} currency={currency} shareTemplate={messages.analytics.shareOfExpenses} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {visibleCategoryItems.map((category) => (
                  <div key={category.categoryId} className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/5" style={{ backgroundColor: category.color || expenseColor }} />
                          <span className="truncate font-medium text-[var(--foreground)]">{category.name}</span>
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-[var(--muted)]">
                          {interpolate(messages.analytics.shareOfExpenses, {
                            percent: category.sharePercent,
                          })}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[var(--foreground)]">
                        {formatMoney(category.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {categoryChartData.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((current) => !current)}
                  className="mt-4 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  {showAllCategories
                    ? messages.analytics.showFewerCategories
                    : interpolate(messages.analytics.showAllCategories, {
                        count: categoryChartData.length - 8,
                      })}
                </button>
              ) : null}
            </div>
          )}

          {categoryChartData.length > 0 ? (
            <div className="mt-8 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
                  <CartesianGrid stroke="rgba(76, 58, 35, 0.08)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={100} tick={{ fill: "#6d655d", fontSize: 12 }} />
                  <Tooltip content={<CategoryTooltip locale={locale} currency={currency} shareTemplate={messages.analytics.shareOfExpenses} />} />
                  <Bar dataKey="amount" radius={[0, 10, 10, 0]}>
                    {categoryChartData.map((entry) => <Cell key={entry.categoryId} fill={entry.color || expenseColor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <p className="text-sm font-medium text-[var(--muted)]">{messages.analytics.compareTitle}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{messages.analytics.compareDescription}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <CompareSnapshotCard label={messages.common.thisPeriod} values={compare.current} period={compare.period.current} locale={locale} currency={currency} messages={messages} dateFnsLocale={dateFnsLocale} />
            <CompareSnapshotCard label={messages.common.previousPeriod} values={compare.previous} period={compare.period.previous} locale={locale} currency={currency} messages={messages} dateFnsLocale={dateFnsLocale} />
          </div>

          <div className="mt-6 space-y-3">
            <CompareDeltaRow label={messages.common.income} value={compare.change.income} accent="positive" locale={locale} currency={currency} messages={messages} />
            <CompareDeltaRow label={messages.common.expense} value={compare.change.expense} accent="expense" locale={locale} currency={currency} messages={messages} />
            <CompareDeltaRow label={messages.common.balance} value={compare.change.balance} accent="neutral" locale={locale} currency={currency} messages={messages} />
          </div>
        </div>
        </section>

        <section className="glass-panel rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">{messages.analytics.trendTitle}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{messages.analytics.trendDescription}</p>
          </div>
          <div className="flex gap-2 text-xs font-medium text-[var(--muted)]">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[var(--accent-strong)]">{messages.common.income}</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">{messages.common.expense}</span>
          </div>
        </div>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(76, 58, 35, 0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6d655d", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6d655d", fontSize: 12 }} tickFormatter={(value) => formatMoneyCompact(value, locale)} />
              <Tooltip content={<TrendTooltip locale={locale} currency={currency} incomeLabel={messages.common.income} expenseLabel={messages.common.expense} />} />
              <Legend />
              <Line type="monotone" dataKey="income" name={messages.common.income} stroke={incomeColor} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="expense" name={messages.common.expense} stroke={expenseColor} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </section>
      </div>
    </div>
  );
}

function CompareSnapshotCard({ label, values, period, locale, currency, messages, dateFnsLocale }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
      <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{formatRangeLabel(period, locale, dateFnsLocale, messages)}</p>
      <div className="mt-4 space-y-3 text-sm">
        <SnapshotRow label={messages.common.income} value={values.income} locale={locale} currency={currency} />
        <SnapshotRow label={messages.common.expense} value={values.expense} locale={locale} currency={currency} />
        <SnapshotRow label={messages.common.balance} value={values.balance} locale={locale} currency={currency} />
      </div>
    </div>
  );
}

function SnapshotRow({ label, value, locale, currency }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-[var(--muted)]">{label}</span><span className="font-semibold text-[var(--foreground)]">{formatMoneyStatic(value, locale, currency)}</span></div>;
}

function CompareDeltaRow({ label, value, accent, locale, currency, messages }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-[var(--foreground)]">{label}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{messages.analytics.differenceFromPrevious}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--foreground)]">{formatSignedMoney(value.amount, locale, currency)}</p>
          <span className={"mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold " + getDeltaBadgeClass(value, accent)}>{formatPercent(value.percent, messages)}</span>
        </div>
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload, label, locale, currency }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      <div className="mt-2 space-y-1 text-sm">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-medium text-[var(--foreground)]">{formatMoneyStatic(entry.value, locale, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryTooltip({ active, payload, locale, currency, shareTemplate }) {
  if (!active || !payload || payload.length === 0) return null;
  const category = payload[0].payload;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-[var(--foreground)]">{category.name}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{formatMoneyStatic(category.amount, locale, currency)}</p>
      <p className="mt-1 text-xs font-medium text-[var(--muted)]">{interpolate(shareTemplate, { percent: category.sharePercent })}</p>
    </div>
  );
}

function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatSignedMoney(value, locale, currency) {
  const amount = Number(value);
  if (amount > 0) return "+" + formatMoneyStatic(amount, locale, currency);
  if (amount < 0) return "-" + formatMoneyStatic(Math.abs(amount), locale, currency);
  return formatMoneyStatic(0, locale, currency);
}

function formatMoneyStatic(value, locale, currency) {
  return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatMoneyCompact(value, locale) {
  return new Intl.NumberFormat(locale === "uk" ? "uk" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value));
}

function formatPercent(value, messages) {
  if (value === null || Number.isNaN(value)) return messages.common.noBaseline;
  if (value > 0) return "+" + value + "%";
  return value + "%";
}

function formatRangeLabel(period, locale, dateFnsLocale, messages) {
  if (period.type === "all" && !period.from && !period.to) {
    return messages.common.allTime;
  }

  const from = period.from ? format(parseISO(period.from), "dd MMM yyyy", { locale: dateFnsLocale }) : messages.common.startBeginning;
  const to = period.to ? format(parseISO(period.to), "dd MMM yyyy", { locale: dateFnsLocale }) : messages.common.startNow;
  return from + " - " + to;
}

function getDeltaBadgeClass(value, accent) {
  if (value.percent === null) return "bg-stone-200 text-stone-700";
  if (accent === "expense") return Number(value.amount) > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700";
  if (Number(value.amount) > 0) return "bg-emerald-100 text-emerald-700";
  if (Number(value.amount) < 0) return "bg-rose-100 text-rose-700";
  return "bg-stone-200 text-stone-700";
}
