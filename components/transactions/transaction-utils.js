/**
 * Creates initial form values for the transaction creation form based on available categories.
 *
 * @param {Array<{ id: string, type: string }>} categories
 * @param {string} [preferredType="EXPENSE"]
 * @returns {{ type: string, categoryId: string, amount: string, date: string, comment: string }}
 */
export function createInitialFormState(categories, preferredType = "EXPENSE") {
  const nextType = categories.some((category) => category.type === preferredType)
    ? preferredType
    : "INCOME";
  const nextCategory = categories.find((category) => category.type === nextType) || categories[0];

  return {
    type: nextCategory?.type || "EXPENSE",
    categoryId: nextCategory?.id || "",
    amount: "",
    date: formatDateInput(new Date()),
    comment: "",
  };
}

/**
 * Formats a Date object as a local `YYYY-MM-DD` string for date inputs.
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatDateInput(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 10);
}

/**
 * Formats a transaction date for UI display.
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
 * Formats a transaction amount as hryvnia currency.
 *
 * @param {string | number} amount
 * @returns {string}
 */
export function formatMoney(amount) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Computes the small pagination window shown around the current page.
 *
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {number[]}
 */
export function getVisiblePages(currentPage, totalPages) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const pages = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return [...new Set(pages)];
}
