import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
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

function buildDateRange(filters) {
  if (!filters.period || filters.period === "month") {
    return getPeriodRange("month");
  }

  if (filters.period !== "custom") {
    return getPeriodRange(filters.period);
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

function amountToNumber(value) {
  return Number(value || 0);
}

function serializeCurrency(value) {
  return amountToNumber(value).toFixed(2);
}

function serializeTransaction(transaction) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
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
  const dateRange = buildDateRange(filters);

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
      by: ["categoryId"],
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

  const topCategoryIds = topExpenseGroups.map((item) => item.categoryId);
  const categories = topCategoryIds.length
    ? await prisma.category.findMany({
        where: {
          id: {
            in: topCategoryIds,
          },
          userId: user.id,
        },
        select: {
          id: true,
          name: true,
          color: true,
        },
      })
    : [];

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
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
      categoryId: item.categoryId,
      name: categoriesById.get(item.categoryId)?.name || "Unknown category",
      color: categoriesById.get(item.categoryId)?.color || null,
      amount: serializeCurrency(item._sum.amount),
    })),
    recentTransactions: recentTransactions.map(serializeTransaction),
  });
}
