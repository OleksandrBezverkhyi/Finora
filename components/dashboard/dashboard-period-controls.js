"use client";

import { formatPeriodLabel } from "@/components/dashboard/dashboard-formatters";

/**
 * Period selector and custom range controls for the dashboard summary.
 *
 * @param {{
 *   customRange: { from: string, to: string },
 *   isLoading: boolean,
 *   onApply: () => void,
 *   onPeriodSelect: (period: string) => void,
 *   onRangeChange: (event: Event) => void,
 *   periodOptions: Array<{ value: string, label: string }>,
 *   selectedPeriod: string,
 *   summaryPeriod: { from?: string | null, to?: string | null }
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function DashboardPeriodControls({
  customRange,
  isLoading,
  onApply,
  onPeriodSelect,
  onRangeChange,
  periodOptions,
  selectedPeriod,
  summaryPeriod,
}) {
  return (
    <div className="flex flex-col gap-3 lg:items-end">
      <div className="flex flex-wrap gap-2">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPeriodSelect(option.value)}
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
            onChange={onRangeChange}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <input
            name="to"
            type="date"
            value={customRange.to}
            onChange={onRangeChange}
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Loading..." : "Apply"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          {isLoading ? "Refreshing dashboard..." : formatPeriodLabel(summaryPeriod)}
        </p>
      )}
    </div>
  );
}
