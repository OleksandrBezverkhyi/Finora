import { NextResponse } from "next/server";
import { z } from "zod";

import { buildSummaryDateRange, getDashboardSummary } from "@/lib/dashboard-summary";
import { getSessionUser } from "@/lib/session";

const summaryFiltersSchema = z.object({
  period: z.enum(["day", "week", "month", "custom"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Returns dashboard summary metrics for the authenticated user and selected period.
 *
 * @param {Request} request
 * @returns {Promise<import("next/server").NextResponse>}
 */
export async function GET(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const rawFilters = {
    period: url.searchParams.get("period") || "month",
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
  };

  const parsedFilters = summaryFiltersSchema.safeParse(rawFilters);

  if (!parsedFilters.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsedFilters.error.flatten(),
      },
      { status: 400 }
    );
  }

  const filters = parsedFilters.data;
  const dateRange = buildSummaryDateRange(filters);

  if (filters.period === "custom" && !dateRange.start && !dateRange.end) {
    return badRequest("Custom period requires from or to date");
  }

  if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
    return badRequest("From date cannot be later than to date");
  }

  const summary = await getDashboardSummary({
    userId: user.id,
    period: filters.period || "month",
    from: filters.from,
    to: filters.to,
  });

  return NextResponse.json(summary);
}
