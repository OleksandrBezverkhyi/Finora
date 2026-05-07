import prisma from "@/lib/prisma";

export const OVERALL_EXPENSES_CATEGORY_NAME = "__FINORA_OVERALL_EXPENSES__";
export const OVERALL_EXPENSES_CATEGORY_COLOR = "#475569";

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

export function isOverallExpensesCategory(category) {
  return category?.name === OVERALL_EXPENSES_CATEGORY_NAME;
}

async function ensureOverallExpensesCategory(userId) {
  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      type: "EXPENSE",
      name: OVERALL_EXPENSES_CATEGORY_NAME,
    },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    },
  });

  if (existingCategory) {
    return existingCategory;
  }

  return prisma.category.create({
    data: {
      userId,
      type: "EXPENSE",
      name: OVERALL_EXPENSES_CATEGORY_NAME,
      color: OVERALL_EXPENSES_CATEGORY_COLOR,
    },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    },
  });
}

export async function getExpenseCategories(userId) {
  const overallExpensesCategory = await ensureOverallExpensesCategory(userId);
  const categories = await prisma.category.findMany({
    where: {
      userId,
      type: "EXPENSE",
      name: {
        not: OVERALL_EXPENSES_CATEGORY_NAME,
      },
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    },
  });

  return [
    {
      ...overallExpensesCategory,
      isOverallCategory: true,
    },
    ...categories.map((category) => ({
      ...category,
      isOverallCategory: false,
    })),
  ];
}

export async function getOwnedExpenseCategory(userId, categoryId) {
  await ensureOverallExpensesCategory(userId);

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

  const byCategory = new Map(
    groupedTransactions.map((item) => [item.categoryId, amountToNumber(item._sum.amount)])
  );

  const totalExpense = groupedTransactions.reduce(
    (sum, item) => sum + amountToNumber(item._sum.amount),
    0
  );

  return {
    byCategory,
    totalExpense,
  };
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
    isOverallCategory: isOverallExpensesCategory(budget.category),
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
  const overallExpensesCategory = await ensureOverallExpensesCategory(userId);
  const [budgets, spentAmounts] = await Promise.all([
    prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      orderBy: [{ createdAt: "asc" }],
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
    buildBudgetProgressPayload(
      budget,
      isOverallExpensesCategory(budget.category)
        ? spentAmounts.totalExpense
        : spentAmounts.byCategory.get(budget.categoryId) || 0
    )
  );

  const totals = items
    .filter((budget) => !budget.isOverallCategory)
    .reduce(
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
    budgets: sortBudgetsForProgress(items, overallExpensesCategory.id),
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
  await ensureOverallExpensesCategory(userId);
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

  const spentAmounts = await getSpentAmountMap(userId, budget.month, budget.year);

  return buildBudgetProgressPayload(
    budget,
    isOverallExpensesCategory(budget.category)
      ? spentAmounts.totalExpense
      : spentAmounts.byCategory.get(budget.categoryId) || 0
  );
}

function sortBudgetsForProgress(budgets, overallCategoryId) {
  return [...budgets].sort((left, right) => {
    if (left.categoryId === overallCategoryId && right.categoryId !== overallCategoryId) {
      return -1;
    }

    if (right.categoryId === overallCategoryId && left.categoryId !== overallCategoryId) {
      return 1;
    }

    return left.category.name.localeCompare(right.category.name);
  });
}
