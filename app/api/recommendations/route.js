import { NextResponse } from "next/server";
import { z } from "zod";

import { getRecommendations } from "@/lib/recommendations";
import { getSessionUser } from "@/lib/session";

const recommendationFiltersSchema = z.object({
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

function normalizeStart(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeEnd(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
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

  const parsedFilters = recommendationFiltersSchema.safeParse(rawFilters);

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
  const from = filters.from ? normalizeStart(filters.from) : null;
  const to = filters.to ? normalizeEnd(filters.to) : null;

  if (filters.period === "custom" && !from && !to) {
    return badRequest("Custom period requires from or to date");
  }

  if (from && to && from > to) {
    return badRequest("From date cannot be later than to date");
  }

  const recommendations = await getRecommendations({
    userId: user.id,
    period: filters.period || "month",
    from,
    to,
    currency: user.currency || "UAH",
  });

  return NextResponse.json(recommendations);
}
