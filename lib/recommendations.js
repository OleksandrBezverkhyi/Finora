import prisma from "@/lib/prisma";

import { resolveAnalyticsDateRange } from "@/lib/analytics";
import { listBudgetsWithProgress } from "@/lib/budgets";
import { buildPreviousDateRange } from "@/lib/date";

const ECB_SPENDING_SPIKE_BENCHMARK_PERCENT = 2;

const recommendationSources = [
  {
    id: "ecb-price-stability",
    name: "European Central Bank",
    url: "https://www.ecb.europa.eu/mopo/strategy/pricestab/html/index.en.html",
    rationale:
      "The spending-spike rule uses the ECB's 2% medium-term inflation target as a price-stability benchmark.",
  },
  {
    id: "ec-financial-literacy",
    name: "European Commission",
    url: "https://finance.ec.europa.eu/consumer-finance-and-payments/financial-literacy_en",
    rationale:
      "The budgeting and savings alerts follow the Commission's financial literacy priorities: managing budgets, saving efficiently, avoiding over-indebtedness, and planning future goals.",
  },
];

function amountToNumber(value) {
  return Number(value || 0);
}

function serializeAmount(value) {
  return amountToNumber(value).toFixed(2);
}

function getStartOfToday(now) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getEndOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

function buildPeriodPayload(type, range) {
  return {
    type,
    from: range.start ? range.start.toISOString() : null,
    to: range.end ? range.end.toISOString() : null,
  };
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildSeverityRank(severity) {
  if (severity === "high") {
    return 0;
  }

  if (severity === "medium") {
    return 1;
  }

  return 2;
}

function sortAlerts(alerts) {
  return [...alerts].sort((left, right) => {
    const severityDiff = buildSeverityRank(left.severity) - buildSeverityRank(right.severity);

    if (severityDiff !== 0) {
      return severityDiff;
    }

    return left.title.localeCompare(right.title);
  });
}

function calculatePercentChange(currentValue, previousValue) {
  if (previousValue <= 0) {
    return null;
  }

  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(2));
}

async function getExpenseTotal(userId, dateRange) {
  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      ...(dateRange.start || dateRange.end
        ? {
            date: {
              ...(dateRange.start ? { gte: dateRange.start } : {}),
              ...(dateRange.end ? { lte: dateRange.end } : {}),
            },
          }
        : {}),
    },
    _sum: {
      amount: true,
    },
  });

  return amountToNumber(aggregate._sum.amount);
}

async function buildBudgetExceededAlerts({ userId, referenceDate, currency = "UAH" }) {
  const month = referenceDate.getMonth() + 1;
  const year = referenceDate.getFullYear();
  const budgetData = await listBudgetsWithProgress({ userId, month, year });

  return budgetData.budgets
    .filter((budget) => budget.isOverLimit)
    .map((budget) => ({
      id: `budget-exceeded:${budget.id}`,
      type: "budget_exceeded",
      severity: "high",
      title: `${budget.category.name} budget exceeded`,
      message:
        `You spent ${formatMoney(budget.spent, currency)} against a limit of ${formatMoney(budget.amount, currency)} in ` +
        `${formatMonthYear(new Date(year, month - 1, 1))}.`,
      actionLabel: "Review budgets",
      href: "/budgets",
      sourceIds: ["ec-financial-literacy"],
      meta: {
        categoryId: budget.categoryId,
        categoryName: budget.isOverallCategory ? "Overall expenses" : budget.category.name,
        isOverallCategory: budget.isOverallCategory,
        budgetAmount: budget.amount,
        spentAmount: budget.spent,
        overLimitAmount: budget.overLimitAmount,
        month,
        year,
      },
    }));
}

async function buildSpendingSpikeAlerts({ userId, period, from, to }) {
  const currentRange = await resolveAnalyticsDateRange({ userId, period, from, to });
  const previousRange = buildPreviousDateRange(currentRange);
  const [currentExpense, previousExpense] = await Promise.all([
    getExpenseTotal(userId, currentRange),
    getExpenseTotal(userId, previousRange),
  ]);

  const percentChange = calculatePercentChange(currentExpense, previousExpense);

  if (percentChange === null || percentChange <= ECB_SPENDING_SPIKE_BENCHMARK_PERCENT) {
    return [];
  }

  return [
    {
      id: `spending-spike:${period}:${currentRange.start?.toISOString() || "open"}:${currentRange.end?.toISOString() || "open"}`,
      type: "spending_spike",
      severity: percentChange >= 10 ? "high" : "medium",
      title: "Spending spike detected",
      message:
        `Your expenses are up ${percentChange}% versus the previous period, which is above the ECB's ` +
        `${ECB_SPENDING_SPIKE_BENCHMARK_PERCENT}% medium-term price-stability benchmark.`,
      actionLabel: "Open analytics",
      href: "/analytics",
      sourceIds: ["ecb-price-stability"],
      meta: {
        currentExpense: serializeAmount(currentExpense),
        previousExpense: serializeAmount(previousExpense),
        percentChange,
        benchmarkPercent: ECB_SPENDING_SPIKE_BENCHMARK_PERCENT,
        currentPeriod: buildPeriodPayload(period, currentRange),
        previousPeriod: buildPeriodPayload(period, previousRange),
      },
    },
  ];
}

export function getGoalSavingsRecommendation({
  targetAmount,
  currentAmount,
  targetDate,
  status,
  now = new Date(),
}) {
  const target = amountToNumber(targetAmount);
  const current = amountToNumber(currentAmount);
  const remaining = Math.max(target - current, 0);
  const isCompleted = remaining === 0 || status === "COMPLETED";

  if (!targetDate) {
    return {
      hasTargetDate: false,
      isCompleted,
      isOverdue: false,
      remainingAmount: serializeAmount(remaining),
      weeklyAmount: null,
      monthlyAmount: null,
      weeksLeft: null,
      monthsLeft: null,
    };
  }

  const today = getStartOfToday(now);
  const goalDate = getEndOfDay(targetDate);
  const daysLeft = Math.ceil((goalDate.getTime() - today.getTime()) / 86_400_000);
  const isOverdue = daysLeft < 0 && !isCompleted;

  if (isCompleted) {
    return {
      hasTargetDate: true,
      isCompleted: true,
      isOverdue: false,
      remainingAmount: "0.00",
      weeklyAmount: "0.00",
      monthlyAmount: "0.00",
      weeksLeft: 0,
      monthsLeft: 0,
    };
  }

  const weeksLeft = isOverdue ? 1 : Math.max(1, Math.ceil(daysLeft / 7));
  const monthsLeft = isOverdue ? 1 : Math.max(1, Math.ceil(daysLeft / 30));

  return {
    hasTargetDate: true,
    isCompleted: false,
    isOverdue,
    remainingAmount: serializeAmount(remaining),
    weeklyAmount: serializeAmount(remaining / weeksLeft),
    monthlyAmount: serializeAmount(remaining / monthsLeft),
    weeksLeft: isOverdue ? 0 : weeksLeft,
    monthsLeft: isOverdue ? 0 : monthsLeft,
  };
}

async function buildSavingPaceAlerts({ userId, now = new Date(), currency = "UAH" }) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "COMPLETED"],
      },
    },
    select: {
      id: true,
      name: true,
      targetAmount: true,
      currentAmount: true,
      targetDate: true,
      status: true,
    },
  });

  return goals
    .map((goal) => {
      const recommendation = getGoalSavingsRecommendation({
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        status: goal.status,
        now,
      });

      if (!recommendation.hasTargetDate || recommendation.isCompleted) {
        return null;
      }

      const severity = recommendation.isOverdue || recommendation.weeksLeft <= 4 ? "high" : "medium";
      const message = recommendation.isOverdue
        ? `This goal is overdue. To catch up, set aside ${formatMoney(recommendation.weeklyAmount, currency)} per week or ${formatMoney(recommendation.monthlyAmount, currency)} per month.`
        : `To stay on track, set aside ${formatMoney(recommendation.weeklyAmount, currency)} per week or ${formatMoney(recommendation.monthlyAmount, currency)} per month.`;

      return {
        id: `saving-pace:${goal.id}`,
        type: recommendation.isOverdue ? "goal_overdue" : "saving_pace",
        severity,
        title: `Savings pace for ${goal.name}`,
        message,
        actionLabel: "Open goals",
        href: "/goals",
        sourceIds: ["ec-financial-literacy"],
        meta: {
          goalId: goal.id,
          goalName: goal.name,
          targetAmount: serializeAmount(goal.targetAmount),
          currentAmount: serializeAmount(goal.currentAmount),
          remainingAmount: recommendation.remainingAmount,
          weeklyAmount: recommendation.weeklyAmount,
          monthlyAmount: recommendation.monthlyAmount,
          weeksLeft: recommendation.weeksLeft,
          monthsLeft: recommendation.monthsLeft,
          isOverdue: recommendation.isOverdue,
        },
      };
    })
    .filter(Boolean);
}

export async function getRecommendations({
  userId,
  period = "month",
  from,
  to,
  now = new Date(),
  currency = "UAH",
}) {
  const currentRange = await resolveAnalyticsDateRange({ userId, period, from, to });
  const referenceDate = currentRange.end || currentRange.start || now;
  const [budgetAlerts, spendingSpikeAlerts, goalAlerts] = await Promise.all([
    buildBudgetExceededAlerts({ userId, referenceDate, currency }),
    buildSpendingSpikeAlerts({ userId, period, from, to }),
    buildSavingPaceAlerts({ userId, now, currency }),
  ]);

  const alerts = sortAlerts([...budgetAlerts, ...spendingSpikeAlerts, ...goalAlerts]);

  return {
    ok: true,
    period: buildPeriodPayload(period, currentRange),
    benchmarks: {
      spendingSpikePercent: ECB_SPENDING_SPIKE_BENCHMARK_PERCENT,
    },
    alerts,
    sources: recommendationSources,
  };
}

function formatMoney(value, currency = "UAH") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number(value));
}
