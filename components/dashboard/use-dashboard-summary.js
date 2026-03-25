"use client";

import { useState } from "react";

import { toDateInputValue } from "@/components/dashboard/dashboard-formatters";

function createSummaryParams({ period, from, to }) {
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

  return params;
}

/**
 * Client hook that manages dashboard summary loading, period switching, and custom date ranges.
 *
 * @param {Record<string, any>} initialSummary
 * @returns {{
 *   applyCustomRange: () => Promise<void>,
 *   customRange: { from: string, to: string },
 *   error: string,
 *   handlePeriodSelect: (nextPeriod: string) => Promise<void>,
 *   handleRangeChange: (event: Event) => void,
 *   isLoading: boolean,
 *   selectedPeriod: string,
 *   summary: Record<string, any>
 * }}
 */
export default function useDashboardSummary(initialSummary) {
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
      const response = await fetch(
        `/api/analytics/summary?${createSummaryParams({ period, from, to }).toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load dashboard summary right now.");
        return;
      }

      setSummary(data);
    } catch {
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
    setCustomRange((current) => ({ ...current, [name]: value }));
  }

  async function applyCustomRange() {
    await loadSummary({ period: "custom", from: customRange.from, to: customRange.to });
  }

  return {
    applyCustomRange,
    customRange,
    error,
    handlePeriodSelect,
    handleRangeChange,
    isLoading,
    selectedPeriod,
    summary,
  };
}
