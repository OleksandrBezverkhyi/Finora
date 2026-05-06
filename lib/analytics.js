import prisma from "@/lib/prisma";

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

function buildPeriodRange(period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === "day") {
    return {
      start: normalizeStart(start),
      end: normalizeEnd(end),
    };
  }

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);

    return {
      start: normalizeStart(start),
      end: normalizeEnd(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)),
    };
  }

  return {
    start: normalizeStart(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: normalizeEnd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

function amountToNumber(value) {
  return Number(value || 0);
}

function serializeAmount(value) {
  return amountToNumber(value).toFixed(2);
}

function buildWhere(userId, dateRange, extra = {}) {
  const where = {
    userId,
    ...extra,
  };

  if (dateRange?.start || dateRange?.end) {
    where.date = {};

    if (dateRange.start) {
      where.date.gte = dateRange.start;
    }

    if (dateRange.end) {
      where.date.lte = dateRange.end;
    }
  }

  return where;
}

function buildPeriodPayload(type, dateRange) {
  return {
    type,
    from: dateRange.start ? dateRange.start.toISOString() : null,
    to: dateRange.end ? dateRange.end.toISOString() : null,
  };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKeysBetween(start, end) {
  const keys = [];
  const cursor = normalizeStart(start);
  const last = normalizeStart(end);

  while (cursor <= last) {
    keys.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function buildChange(currentValue, previousValue) {
  const amount = currentValue - previousValue;

  return {
    amount: amount.toFixed(2),
    percent: previousValue === 0 ? null : Number(((amount / previousValue) * 100).toFixed(2)),
  };
}

async function getTotals(userId, dateRange) {
  const where = buildWhere(userId, dateRange);

  const [incomeAggregate, expenseAggregate] = await Promise.all([
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
      where: {
        ...where,
        type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const income = amountToNumber(incomeAggregate._sum.amount);
  const expense = amountToNumber(expenseAggregate._sum.amount);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export function buildAnalyticsDateRange(filters) {
  if (!filters.period || filters.period === "month") {
    return buildPeriodRange("month");
  }

  if (filters.period === "custom") {
    return {
      start: filters.from ? normalizeStart(filters.from) : null,
      end: filters.to ? normalizeEnd(filters.to) : null,
    };
  }

  return buildPeriodRange(filters.period);
}

export function buildPreviousDateRange(dateRange) {
  if (!dateRange.start || !dateRange.end) {
    return {
      start: null,
      end: null,
    };
  }

  const duration = dateRange.end.getTime() - dateRange.start.getTime();
  const previousEnd = new Date(dateRange.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return {
    start: previousStart,
    end: previousEnd,
  };
}

export async function getTrendAnalytics({ userId, period = "month", from, to }) {
  const requestedDateRange = buildAnalyticsDateRange({ period, from, to });
  const dateRange =
    period === "day" && requestedDateRange.start && requestedDateRange.end
      ? {
          start: normalizeStart(
            new Date(
              requestedDateRange.start.getFullYear(),
              requestedDateRange.start.getMonth(),
              requestedDateRange.start.getDate() - 1
            )
          ),
          end: normalizeEnd(
            new Date(
              requestedDateRange.end.getFullYear(),
              requestedDateRange.end.getMonth(),
              requestedDateRange.end.getDate() + 1
            )
          ),
        }
      : requestedDateRange;
  const transactions = await prisma.transaction.findMany({
    where: buildWhere(userId, dateRange),
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: {
      type: true,
      amount: true,
      date: true,
    },
  });

  const buckets = new Map(
    getDateKeysBetween(dateRange.start, dateRange.end).map((key) => [
      key,
      {
        date: key,
        income: 0,
        expense: 0,
        balance: 0,
      },
    ])
  );

  for (const transaction of transactions) {
    const key = formatDateKey(new Date(transaction.date));
    const amount = amountToNumber(transaction.amount);
    const bucket = buckets.get(key);

    if (!bucket) {
      continue;
    }

    if (transaction.type === "INCOME") {
      bucket.income += amount;
    } else {
      bucket.expense += amount;
    }

    bucket.balance = bucket.income - bucket.expense;
  }

  const points = Array.from(buckets.values()).map((bucket) => ({
    date: bucket.date,
    income: serializeAmount(bucket.income),
    expense: serializeAmount(bucket.expense),
    balance: serializeAmount(bucket.balance),
  }));

  const totals = points.reduce(
    (accumulator, point) => ({
      income: accumulator.income + amountToNumber(point.income),
      expense: accumulator.expense + amountToNumber(point.expense),
      balance: accumulator.balance + amountToNumber(point.balance),
    }),
    { income: 0, expense: 0, balance: 0 }
  );

  return {
    ok: true,
    period: buildPeriodPayload(period, requestedDateRange),
    points,
    totals: {
      income: serializeAmount(totals.income),
      expense: serializeAmount(totals.expense),
      balance: serializeAmount(totals.balance),
    },
  };
}

export async function getExpenseByCategoryAnalytics({ userId, period = "month", from, to }) {
  const dateRange = buildAnalyticsDateRange({ period, from, to });
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: buildWhere(userId, dateRange, { type: "EXPENSE" }),
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  const categories = grouped.length
    ? await prisma.category.findMany({
        where: {
          id: {
            in: grouped.map((item) => item.categoryId),
          },
          userId,
        },
        select: {
          id: true,
          name: true,
          color: true,
        },
      })
    : [];

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const totalExpense = grouped.reduce((sum, item) => sum + amountToNumber(item._sum.amount), 0);

  const categoriesPayload = grouped.map((item) => {
    const amount = amountToNumber(item._sum.amount);
    const category = categoriesById.get(item.categoryId);

    return {
      categoryId: item.categoryId,
      name: category?.name || "Unknown category",
      color: category?.color || null,
      amount: serializeAmount(amount),
      sharePercent: totalExpense === 0 ? 0 : Number(((amount / totalExpense) * 100).toFixed(2)),
    };
  });

  return {
    ok: true,
    period: buildPeriodPayload(period, dateRange),
    totalExpense: serializeAmount(totalExpense),
    categories: categoriesPayload,
  };
}

export async function getCompareAnalytics({ userId, period = "month", from, to }) {
  const currentRange = buildAnalyticsDateRange({ period, from, to });
  const previousRange = buildPreviousDateRange(currentRange);
  const [currentTotals, previousTotals] = await Promise.all([
    getTotals(userId, currentRange),
    getTotals(userId, previousRange),
  ]);

  return {
    ok: true,
    period: {
      type: period,
      current: buildPeriodPayload(period, currentRange),
      previous: buildPeriodPayload(period, previousRange),
    },
    current: {
      income: serializeAmount(currentTotals.income),
      expense: serializeAmount(currentTotals.expense),
      balance: serializeAmount(currentTotals.balance),
    },
    previous: {
      income: serializeAmount(previousTotals.income),
      expense: serializeAmount(previousTotals.expense),
      balance: serializeAmount(previousTotals.balance),
    },
    change: {
      income: buildChange(currentTotals.income, previousTotals.income),
      expense: buildChange(currentTotals.expense, previousTotals.expense),
      balance: buildChange(currentTotals.balance, previousTotals.balance),
    },
  };
}
