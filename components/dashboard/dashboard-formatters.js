/**
 * Formats a numeric value as Ukrainian hryvnia currency.
 *
 * @param {string | number} value
 * @returns {string}
 */
export function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

/**
 * Formats a date value for Ukrainian locale display.
 *
 * @param {string | number | Date} value
 * @returns {string}
 */
export function formatDate(value) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Formats a dashboard period object into a readable date range label.
 *
 * @param {{ from?: string | null, to?: string | null }} period
 * @returns {string}
 */
export function formatPeriodLabel(period) {
  const from = period.from ? formatDate(period.from) : "beginning";
  const to = period.to ? formatDate(period.to) : "now";
  return `${from} - ${to}`;
}

/**
 * Converts a date-like value into `YYYY-MM-DD` format for `<input type="date">`.
 *
 * @param {string | number | Date | null | undefined} value
 * @returns {string}
 */
export function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}
