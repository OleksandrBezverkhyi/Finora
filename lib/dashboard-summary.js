import prisma from "@/lib/prisma";

export function getSummaryPeriodRange(period) {
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

export function buildSummaryDateRange(filters) {
  if (!filters.period || filters.period === "month") {
    return getSummaryPeriodRange("month");
  }

  if (filters.period !== "custom") {
    return getSummaryPeriodRange(filters.period);
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

function buildWhere(userId, dateRange) {
  const where = { userId };

  if (!dateRange.start && !dateRange.end) {
    return where;
  }

  where.date = {};

  if (dateRange.start) {
    where.date.gte = dateRange.start;
  }

  if (dateRange.end) {
    where.date.lte = dateRange.end;
  }

  return where;
}

async function getTopExpenseCategories(userId, topExpenseGroups) {
  const categoryIds = topExpenseGroups.map((item) => item.categoryId);

  if (!categoryIds.length) {
    return new Map();
  }

  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
      userId,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  return new Map(categories.map((category) => [category.id, category]));
}

export async function getDashboardSummary({ userId, period = "month", from, to }) {
  const dateRange = buildSummaryDateRange({ period, from, to });
  const where = buildWhere(userId, dateRange);
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
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: expenseWhere,
      _sum: { amount: true },
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

  const categoriesById = await getTopExpenseCategories(userId, topExpenseGroups);
  const income = amountToNumber(incomeAggregate._sum.amount);
  const expense = amountToNumber(expenseAggregate._sum.amount);

  return {
    ok: true,
    period: {
      type: period,
      from: dateRange.start ? dateRange.start.toISOString() : null,
      to: dateRange.end ? dateRange.end.toISOString() : null,
    },
    totals: {
      income: serializeCurrency(income),
      expense: serializeCurrency(expense),
      balance: serializeCurrency(income - expense),
    },
    topExpenseCategories: topExpenseGroups.map((item) => ({
      categoryId: item.categoryId,
      name: categoriesById.get(item.categoryId)?.name || "Unknown category",
      color: categoriesById.get(item.categoryId)?.color || null,
      amount: serializeCurrency(item._sum.amount),
    })),
    recentTransactions: recentTransactions.map(serializeTransaction),
  };
}
