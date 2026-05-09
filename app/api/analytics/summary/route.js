import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveAnalyticsDateRange } from "@/lib/analytics";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeTransactionRecord } from "@/lib/transactions";

const summaryFiltersSchema = z.object({
  period: z.enum(["day", "week", "month", "custom", "all"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function amountToNumber(value) {
  return Number(value || 0);
}

function serializeCurrency(value) {
  return amountToNumber(value).toFixed(2);
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
  const dateRange = await resolveAnalyticsDateRange({
    userId: user.id,
    period: filters.period || "month",
    from: filters.from,
    to: filters.to,
  });

  if (filters.period === "custom" && !dateRange.start && !dateRange.end) {
    return badRequest("Custom period requires from or to date");
  }

  if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
    return badRequest("From date cannot be later than to date");
  }

  const where = {
    userId: user.id,
  };

  if (dateRange.start || dateRange.end) {
    where.date = {};

    if (dateRange.start) {
      where.date.gte = dateRange.start;
    }

    if (dateRange.end) {
      where.date.lte = dateRange.end;
    }
  }

  const expenseWhere = {
    ...where,
    type: "EXPENSE",
  };

  const [incomeAggregate, expenseAggregate, topExpenseGroups, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...where,
        type: "INCOME",
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: expenseWhere,
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId", "categoryName", "categoryColor"],
      where: expenseWhere,
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: 5,
    }),
    prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        comment: true,
        categoryName: true,
        categoryColor: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true,
          },
        },
      },
    }),
  ]);

  const income = amountToNumber(incomeAggregate._sum.amount);
  const expense = amountToNumber(expenseAggregate._sum.amount);
  const balance = income - expense;

  return NextResponse.json({
    ok: true,
    period: {
      type: filters.period || "month",
      from: dateRange.start ? dateRange.start.toISOString() : null,
      to: dateRange.end ? dateRange.end.toISOString() : null,
    },
    totals: {
      income: serializeCurrency(income),
      expense: serializeCurrency(expense),
      balance: serializeCurrency(balance),
    },
    topExpenseCategories: topExpenseGroups.map((item) => ({
      categoryId: item.categoryId || `deleted-${item.categoryName}`,
      name: item.categoryName || "Unknown category",
      color: item.categoryColor || null,
      amount: serializeCurrency(item._sum.amount),
    })),
    recentTransactions: recentTransactions.map(serializeTransactionRecord),
  });
}
