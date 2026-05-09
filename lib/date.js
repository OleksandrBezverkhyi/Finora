export function normalizeStart(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function normalizeEnd(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function buildPeriodRange(period, anchor = new Date()) {
  const start = new Date(anchor);
  const end = new Date(anchor);

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
    start: normalizeStart(new Date(start.getFullYear(), start.getMonth(), 1)),
    end: normalizeEnd(new Date(start.getFullYear(), start.getMonth() + 1, 0)),
  };
}

export function buildDateRange({ period = "month", from, to }) {
  if (period === "all") {
    return {
      start: null,
      end: null,
    };
  }

  if (period === "custom") {
    return {
      start: from ? normalizeStart(from) : null,
      end: to ? normalizeEnd(to) : null,
    };
  }

  if (from && to) {
    return {
      start: normalizeStart(from),
      end: normalizeEnd(to),
    };
  }

  if (from || to) {
    return buildPeriodRange(period, from || to);
  }

  return buildPeriodRange(period);
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

export function shiftPeriodRange(period, from, to, direction) {
  if (period === "all" || period === "custom") {
    return buildDateRange({ period, from, to });
  }

  const currentRange = buildDateRange({ period, from, to });

  if (!currentRange.start || !currentRange.end) {
    return currentRange;
  }

  if (period === "day") {
    return {
      start: normalizeStart(
        new Date(
          currentRange.start.getFullYear(),
          currentRange.start.getMonth(),
          currentRange.start.getDate() + direction
        )
      ),
      end: normalizeEnd(
        new Date(
          currentRange.end.getFullYear(),
          currentRange.end.getMonth(),
          currentRange.end.getDate() + direction
        )
      ),
    };
  }

  if (period === "week") {
    return {
      start: normalizeStart(
        new Date(
          currentRange.start.getFullYear(),
          currentRange.start.getMonth(),
          currentRange.start.getDate() + direction * 7
        )
      ),
      end: normalizeEnd(
        new Date(
          currentRange.end.getFullYear(),
          currentRange.end.getMonth(),
          currentRange.end.getDate() + direction * 7
        )
      ),
    };
  }

  const shiftedStart = new Date(
    currentRange.start.getFullYear(),
    currentRange.start.getMonth() + direction,
    1
  );

  return {
    start: normalizeStart(shiftedStart),
    end: normalizeEnd(new Date(shiftedStart.getFullYear(), shiftedStart.getMonth() + 1, 0)),
  };
}

export function canShiftPeriodForward(period, from, to) {
  if (period === "custom" || period === "all") {
    return false;
  }

  const currentRange = buildDateRange({ period, from, to });
  const latestAllowedRange = buildPeriodRange(period);

  if (!currentRange.end || !latestAllowedRange.end) {
    return false;
  }

  return currentRange.end.getTime() < latestAllowedRange.end.getTime();
}

export function toDateParam(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
