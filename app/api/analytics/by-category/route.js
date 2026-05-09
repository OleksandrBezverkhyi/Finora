import { NextResponse } from "next/server";
import { z } from "zod";

import { buildAnalyticsDateRange, getExpenseByCategoryAnalytics } from "@/lib/analytics";
import { getSessionUser } from "@/lib/session";

const analyticsFiltersSchema = z.object({
  period: z.enum(["day", "week", "month", "custom", "all"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message, issues) {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}

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

  const parsedFilters = analyticsFiltersSchema.safeParse(rawFilters);

  if (!parsedFilters.success) {
    return badRequest("Validation failed", parsedFilters.error.flatten());
  }

  const filters = parsedFilters.data;

  if (filters.period === "custom" && (!filters.from || !filters.to)) {
    return badRequest("Custom period requires both from and to dates.");
  }

  const dateRange = buildAnalyticsDateRange(filters);

  if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
    return badRequest("From date cannot be later than to date.");
  }

  const result = await getExpenseByCategoryAnalytics({
    userId: user.id,
    period: filters.period || "month",
    from: filters.from,
    to: filters.to,
  });

  return NextResponse.json(result);
}
