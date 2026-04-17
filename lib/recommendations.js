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
