"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DayFirstDateInput from "@/components/common/day-first-date-input";
import { useLocale } from "@/components/common/locale-provider";
import { canShiftPeriodForward, shiftPeriodRange, toDateParam } from "@/lib/date";
import {
  formatDateLocalized,
  formatPlural,
  localizeRecommendationAlert,
  localizeRecommendationSource,
} from "@/lib/i18n";

export default function DashboardOverview({ initialSummary, initialRecommendations }) {
  const { locale, currency, formatMoney, messages, translateErrorMessage } = useLocale();
  const periodOptions = useMemo(
    () => [
      { value: "day", label: messages.periods.day },
      { value: "week", label: messages.periods.week },
      { value: "month", label: messages.periods.month },
      { value: "custom", label: messages.periods.custom },
    ],
    [messages]
  );
  const [selectedPeriod, setSelectedPeriod] = useState(initialSummary.period.type || "month");
  const [customRange, setCustomRange] = useState({
    from: toDateInputValue(initialSummary.period.from),
    to: toDateInputValue(initialSummary.period.to),
  });
  const [summary, setSummary] = useState(initialSummary);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const canMoveForward = canShiftPeriodForward(
    selectedPeriod,
    summary.period?.from,
    summary.period?.to
  );

  async function loadDashboardData({ period, from, to }) {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("period", period);

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      const query = params.toString();
      const [summaryResponse, recommendationsResponse] = await Promise.all([
        fetch(`/api/analytics/summary?${query}`),
        fetch(`/api/recommendations?${query}`),
      ]);
      const [summaryData, recommendationsData] = await Promise.all([
        summaryResponse.json(),
        recommendationsResponse.json(),
      ]);

      if (!summaryResponse.ok || !recommendationsResponse.ok) {
        setError(
          translateErrorMessage(
            summaryData.error ||
              recommendationsData.error ||
              "Unable to load dashboard data right now."
          )
        );
        return;
      }

      setSummary(summaryData);
      setRecommendations(recommendationsData);
    } catch {
      setError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePeriodSelect(nextPeriod) {
    setSelectedPeriod(nextPeriod);

    if (nextPeriod !== "custom") {
      setCustomRange({ from: "", to: "" });
      await loadDashboardData({ period: nextPeriod });
    }
  }

  function handleRangeChange(event) {
    const { name, value } = event.target;
    setCustomRange((current) => ({ ...current, [name]: value }));
  }

  async function applyCustomRange() {
    await loadDashboardData({ period: "custom", from: customRange.from, to: customRange.to });
  }

  async function shiftSelectedPeriod(direction) {
    if (selectedPeriod === "custom") {
      return;
    }

    if (direction > 0 && !canMoveForward) {
      return;
    }

    const shiftedRange = shiftPeriodRange(
      selectedPeriod,
      summary.period?.from,
      summary.period?.to,
      direction
    );

    await loadDashboardData({
      period: selectedPeriod,
      from: toDateParam(shiftedRange.start),
      to: toDateParam(shiftedRange.end),
    });
  }

  const localizedSources = recommendations.sources.map((source) => localizeRecommendationSource(source, locale));

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.common.overview}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {messages.dashboard.title}
            </h2>
            <p className="muted max-w-2xl text-sm leading-6">{messages.dashboard.description}</p>
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
                <DayFirstDateInput
                  name="from"
                  value={customRange.from}
                  onChange={handleRangeChange}
                  className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                <DayFirstDateInput
                  name="to"
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
                  {isLoading ? messages.common.loading : messages.common.apply}
                </button>
              </div>
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
                    ? messages.dashboard.refreshing
                    : formatPeriodLabel(summary.period, locale, messages)}
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

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </section>

      <div
        className={
          "space-y-8 transition-all duration-300 " +
          (isLoading ? "translate-y-1 opacity-60" : "translate-y-0 opacity-100")
        }
      >
        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            <SummaryCard
              label={messages.common.income}
              value={formatMoney(summary.totals.income)}
              hint={messages.dashboard.incomeHint}
            />
            <SummaryCard
              label={messages.common.expense}
              value={formatMoney(summary.totals.expense)}
              hint={messages.dashboard.expenseHint}
            />
            <div className="glass-panel rounded-[1.75rem] p-6 sm:col-span-2">
              <p className="text-sm font-medium text-[var(--muted)]">{messages.common.balance}</p>
              <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                {formatMoney(summary.totals.balance)}
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">{messages.dashboard.balanceHint}</p>
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-sm font-medium text-[var(--muted)]">{messages.dashboard.topExpenseCategories}</p>
            <div className="mt-6 space-y-4">
              {summary.topExpenseCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
                  {messages.dashboard.noTopExpenseCategories}
                </div>
              ) : (
                summary.topExpenseCategories.map((category, index) => (
                  <div key={category.categoryId} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--muted)]">#{index + 1}</span>
                      <span className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: category.color || "#C2410C" }} />
                      <span className="font-medium text-[var(--foreground)]">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{formatMoney(category.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      <section className="glass-panel rounded-[1.75rem] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">{messages.dashboard.alertsTitle}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{messages.dashboard.alertsDescription}</p>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-sm font-medium text-[var(--foreground)]">
            {locale === "uk"
              ? `${recommendations.alerts.length} ${formatPlural(locale, recommendations.alerts.length, {
                  one: "попередження",
                  few: "попередження",
                  many: "попереджень",
                  other: "alerts",
                })}`
              : `${recommendations.alerts.length} ${messages.dashboard.alertsCount}`}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {recommendations.alerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              {messages.dashboard.noAlerts}
            </div>
          ) : (
            recommendations.alerts.map((alert) => {
              const localizedAlert = localizeRecommendationAlert(alert, locale, currency);
              return (
                <article key={alert.id} className={"rounded-2xl border px-4 py-4 " + getAlertCardClass(alert.severity)}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={getAlertBadgeClass(alert.severity)}>{formatAlertType(alert.type, messages)}</span>
                        <span className="text-xs font-medium text-[var(--muted)]">
                          {formatSourceNames(alert.sourceIds, localizedSources)}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[var(--foreground)]">{localizedAlert.title}</h3>
                      <p className="text-sm leading-6 text-[var(--muted)]">{localizedAlert.message}</p>
                    </div>

                    {alert.href ? (
                      <Link href={alert.href} className="inline-flex rounded-full border border-[var(--border)] bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">
                        {localizedAlert.actionLabel || messages.common.open}
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">{messages.dashboard.recentTransactions}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{messages.dashboard.recentTransactionsDescription}</p>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-sm font-medium text-[var(--foreground)]">
            {locale === "uk"
              ? `${summary.recentTransactions.length} ${formatPlural(locale, summary.recentTransactions.length, {
                  one: "елемент",
                  few: "елементи",
                  many: "елементів",
                  other: "items",
                })}`
              : `${summary.recentTransactions.length} items`}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {summary.recentTransactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              {messages.dashboard.noTransactions}
            </div>
          ) : (
            summary.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: transaction.category.color || "#0F766E" }} />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{transaction.category.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{transaction.comment || messages.common.noComment}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-[var(--foreground)]">{formatMoney(transaction.amount)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatDateLocalized(transaction.date, locale)} · {transaction.type === "INCOME" ? messages.common.income : messages.common.expense}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-3 text-sm text-[var(--muted)]">{hint}</p>
    </div>
  );
}

function formatPeriodLabel(period, locale, messages) {
  const from = period.from ? formatDateLocalized(period.from, locale) : messages.common.startBeginning;
  const to = period.to ? formatDateLocalized(period.to, locale) : messages.common.startNow;
  return `${from} - ${to}`;
}

function formatAlertType(type, messages) {
  if (type === "budget_exceeded") return messages.dashboard.budgetType;
  if (type === "spending_spike") return messages.dashboard.trendType;
  if (type === "goal_overdue") return messages.dashboard.goalOverdueType;
  return messages.dashboard.goalPaceType;
}

function formatSourceNames(sourceIds, sources) {
  const sourceNames = sourceIds.map((sourceId) => sources.find((source) => source.id === sourceId)?.name).filter(Boolean);
  return sourceNames.join(" · ");
}

function getAlertCardClass(severity) {
  if (severity === "high") return "border-rose-300 bg-rose-50/80";
  if (severity === "medium") return "border-amber-300 bg-amber-50/80";
  return "border-[var(--border)] bg-white/75";
}

function getAlertBadgeClass(severity) {
  if (severity === "high") return "rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700";
  if (severity === "medium") return "rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700";
  return "rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]";
}

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
