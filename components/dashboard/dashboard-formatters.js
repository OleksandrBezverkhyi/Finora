export function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPeriodLabel(period) {
  const from = period.from ? formatDate(period.from) : "beginning";
  const to = period.to ? formatDate(period.to) : "now";
  return `${from} - ${to}`;
}

export function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}
