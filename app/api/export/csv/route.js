import { NextResponse } from "next/server";
import { z } from "zod";

import { buildCsv } from "@/lib/csv";
import prisma from "@/lib/prisma";
import { getServerMessages } from "@/lib/server-locale";
import { getSessionUser } from "@/lib/session";

const exportFiltersSchema = z.object({
  period: z.enum(["day", "week", "month", "custom"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().trim().min(1).optional(),
  q: z.string().trim().max(100).optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function getPeriodRange(period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  return null;
}

function buildDateFilter(filters) {
  if (filters.period && filters.period !== "custom") {
    return getPeriodRange(filters.period);
  }

  if (!filters.from && !filters.to) {
    return null;
  }

  const start = filters.from ? new Date(filters.from) : null;
  const end = filters.to ? new Date(filters.to) : null;

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

function buildOrderBy(sort) {
  switch (sort) {
    case "date_asc":
      return [{ date: "asc" }, { createdAt: "asc" }];
    case "amount_desc":
      return [{ amount: "desc" }, { date: "desc" }];
    case "amount_asc":
      return [{ amount: "asc" }, { date: "desc" }];
    case "date_desc":
    default:
      return [{ date: "desc" }, { createdAt: "desc" }];
  }
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function getLocalizedTypeLabel(type, messages) {
  return type === "INCOME" ? messages.csvExport.typeIncome : messages.csvExport.typeExpense;
}

function getCsvHeaders(messages) {
  return [
    messages.csvExport.headers.id,
    messages.csvExport.headers.type,
    messages.csvExport.headers.category,
    messages.csvExport.headers.amount,
    messages.csvExport.headers.currency,
    messages.csvExport.headers.date,
    messages.csvExport.headers.comment,
    messages.csvExport.headers.createdAt,
    messages.csvExport.headers.updatedAt,
  ];
}

function getCsvFilename(messages) {
  return `${messages.csvExport.filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
}

export async function GET(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const messages = await getServerMessages();
  const url = new URL(request.url);
  const rawFilters = {
    period: url.searchParams.get("period") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    type: url.searchParams.get("type") || undefined,
    categoryId: url.searchParams.get("categoryId") || undefined,
    q: url.searchParams.get("q") || undefined,
    min: url.searchParams.get("min") || undefined,
    max: url.searchParams.get("max") || undefined,
    sort: url.searchParams.get("sort") || undefined,
  };

  const parsedFilters = exportFiltersSchema.safeParse(rawFilters);

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

  if (filters.min !== undefined && filters.max !== undefined && filters.min > filters.max) {
    return badRequest("Minimum amount cannot be greater than maximum amount");
  }

  const dateRange = buildDateFilter(filters);

  if (dateRange?.start && dateRange?.end && dateRange.start > dateRange.end) {
    return badRequest("From date cannot be later than to date");
  }

  const where = {
    userId: user.id,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.q) {
    where.OR = [
      {
        comment: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        category: {
          name: {
            contains: filters.q,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (filters.min !== undefined || filters.max !== undefined) {
    where.amount = {};

    if (filters.min !== undefined) {
      where.amount.gte = filters.min;
    }

    if (filters.max !== undefined) {
      where.amount.lte = filters.max;
    }
  }

  if (dateRange?.start || dateRange?.end) {
    where.date = {};

    if (dateRange.start) {
      where.date.gte = dateRange.start;
    }

    if (dateRange.end) {
      where.date.lte = dateRange.end;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: buildOrderBy(filters.sort),
    select: {
      id: true,
      type: true,
      amount: true,
      date: true,
      comment: true,
      categoryName: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const rows = transactions.map((transaction) => [
    transaction.id,
    getLocalizedTypeLabel(transaction.type, messages),
    transaction.category?.name ?? transaction.categoryName,
    transaction.amount.toString(),
    user.currency || "UAH",
    formatDateOnly(transaction.date),
    transaction.comment || "",
    transaction.createdAt.toISOString(),
    transaction.updatedAt.toISOString(),
  ]);

  const csvContent = buildCsv(getCsvHeaders(messages), rows);

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getCsvFilename(messages)}"`,
      "Cache-Control": "no-store",
    },
  });
}
