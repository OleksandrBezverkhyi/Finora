import prisma from "@/lib/prisma";
import { getGoalSavingsRecommendation } from "@/lib/recommendations";

function amountToNumber(value) {
  return Number(value || 0);
}

function serializeAmount(value) {
  return amountToNumber(value).toFixed(2);
}

function sortGoals(goals) {
  const statusWeight = {
    ACTIVE: 0,
    COMPLETED: 1,
    ARCHIVED: 2,
  };

  return [...goals].sort((left, right) => {
    const statusDiff = statusWeight[left.status] - statusWeight[right.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const leftDate = left.targetDate ? new Date(left.targetDate).getTime() : Number.POSITIVE_INFINITY;
    const rightDate = right.targetDate ? new Date(right.targetDate).getTime() : Number.POSITIVE_INFINITY;

    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function buildGoalPayload(goal) {
  const targetAmount = amountToNumber(goal.targetAmount);
  const currentAmount = amountToNumber(goal.currentAmount);
  const remainingAmount = Math.max(targetAmount - currentAmount, 0);
  const progressPercent = targetAmount === 0 ? 0 : Math.min((currentAmount / targetAmount) * 100, 100);
  const recommendation = getGoalSavingsRecommendation({
    targetAmount,
    currentAmount,
    targetDate: goal.targetDate,
    status: goal.status,
  });
  const derivedCompleted = remainingAmount === 0;
  const displayStatus = goal.status === "ARCHIVED"
    ? "ARCHIVED"
    : derivedCompleted || goal.status === "COMPLETED"
      ? "COMPLETED"
      : "ACTIVE";

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: serializeAmount(targetAmount),
    currentAmount: serializeAmount(currentAmount),
    remainingAmount: serializeAmount(remainingAmount),
    progressPercent: Number(progressPercent.toFixed(2)),
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    note: goal.note,
    status: goal.status,
    displayStatus,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    recommendation,
  };
}

export async function listGoalsWithProgress({ userId, status }) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    select: {
      id: true,
      name: true,
      targetAmount: true,
      currentAmount: true,
      targetDate: true,
      note: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const items = sortGoals(goals.map(buildGoalPayload));
  const totals = items.reduce(
    (accumulator, goal) => ({
      target: accumulator.target + amountToNumber(goal.targetAmount),
      saved: accumulator.saved + amountToNumber(goal.currentAmount),
      activeCount: accumulator.activeCount + (goal.displayStatus === "ACTIVE" ? 1 : 0),
      completedCount: accumulator.completedCount + (goal.displayStatus === "COMPLETED" ? 1 : 0),
    }),
    {
      target: 0,
      saved: 0,
      activeCount: 0,
      completedCount: 0,
    }
  );

  return {
    ok: true,
    goals: items,
    totals: {
      target: serializeAmount(totals.target),
      saved: serializeAmount(totals.saved),
      remaining: serializeAmount(Math.max(totals.target - totals.saved, 0)),
      activeCount: totals.activeCount,
      completedCount: totals.completedCount,
    },
  };
}

export async function getGoalWithProgress({ userId, goalId }) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    select: {
      id: true,
      name: true,
      targetAmount: true,
      currentAmount: true,
      targetDate: true,
      note: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!goal) {
    return null;
  }

  return buildGoalPayload(goal);
}
