import prisma from "@/lib/prisma";

function amountToNumber(value) {
  return Number(value || 0);
}

function serializeAmount(value) {
  return amountToNumber(value).toFixed(2);
}

export function getBudgetMonthRange(month, year) {
  const start = new Date(year, month - 1, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, month, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function getExpenseCategories(userId) {
  return prisma.category.findMany({
    where: {
      userId,
      type: "EXPENSE",
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    },
  });
}

export async function getOwnedExpenseCategory(userId, categoryId) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      type: "EXPENSE",
    },
    select: {
      id: true,
    },
  });
}

async function getSpentAmountMap(userId, month, year) {
  const { start, end } = getBudgetMonthRange(month, year);
  const groupedTransactions = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return new Map(
    groupedTransactions.map((item) => [item.categoryId, amountToNumber(item._sum.amount)])
  );
}

function buildBudgetProgressPayload(budget, spentAmount) {
  const limit = amountToNumber(budget.amount);
  const spent = amountToNumber(spentAmount);
  const remaining = limit - spent;
  const rawProgress = limit === 0 ? 0 : (spent / limit) * 100;
  const progressPercent = Math.min(Math.max(rawProgress, 0), 100);
  const overLimitAmount = spent > limit ? spent - limit : 0;
  const isOverLimit = spent > limit;
  const isNearLimit = !isOverLimit && progressPercent >= 80;

  return {
    id: budget.id,
    amount: serializeAmount(limit),
    month: budget.month,
    year: budget.year,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
    categoryId: budget.categoryId,
    category: budget.category,
    spent: serializeAmount(spent),
    remaining: serializeAmount(Math.max(remaining, 0)),
    overLimitAmount: serializeAmount(overLimitAmount),
    progressPercent: Number(progressPercent.toFixed(2)),
    isOverLimit,
    isNearLimit,
    status: isOverLimit ? "over" : isNearLimit ? "warning" : "ok",
  };
}

export async function listBudgetsWithProgress({ userId, month, year }) {
  const [budgets, spentAmountMap] = await Promise.all([
    prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      orderBy: [{ category: { name: "asc" } }],
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    }),
    getSpentAmountMap(userId, month, year),
  ]);

  const items = budgets.map((budget) =>
    buildBudgetProgressPayload(budget, spentAmountMap.get(budget.categoryId) || 0)
  );

  const totals = items.reduce(
    (accumulator, budget) => ({
      planned: accumulator.planned + amountToNumber(budget.amount),
      spent: accumulator.spent + amountToNumber(budget.spent),
      overLimitCount: accumulator.overLimitCount + (budget.isOverLimit ? 1 : 0),
    }),
    { planned: 0, spent: 0, overLimitCount: 0 }
  );

  return {
    ok: true,
    month,
    year,
    budgets: items,
    totals: {
      planned: serializeAmount(totals.planned),
      spent: serializeAmount(totals.spent),
      remaining: serializeAmount(Math.max(totals.planned - totals.spent, 0)),
      overLimitAmount: serializeAmount(Math.max(totals.spent - totals.planned, 0)),
      overLimitCount: totals.overLimitCount,
    },
  };
}

export async function getBudgetWithProgress({ userId, budgetId }) {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    select: {
      id: true,
      amount: true,
      month: true,
      year: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
        },
      },
    },
  });

  if (!budget) {
    return null;
  }

  const spentAmountMap = await getSpentAmountMap(userId, budget.month, budget.year);

  return buildBudgetProgressPayload(budget, spentAmountMap.get(budget.categoryId) || 0);
}
