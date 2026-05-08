const UTF8_BOM = "\uFEFF";
const transactionHeaderAliases = {
  id: "id",
  type: "type",
  category: "category",
  amount: "amount",
  currency: "currency",
  date: "date",
  comment: "comment",
  createdat: "createdAt",
  updatedat: "updatedAt",
  тип: "type",
  категорія: "category",
  сума: "amount",
  валюта: "currency",
  дата: "date",
  коментар: "comment",
  створено: "createdAt",
  оновлено: "updatedAt",
};

function normalizeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export function escapeCsvValue(value) {
  const normalizedValue = normalizeCsvValue(value);

  if (/[",\r\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replaceAll('"', '""')}"`;
  }

  return normalizedValue;
}

export function buildCsv(headers, rows, options = {}) {
  const includeBom = options.includeBom ?? true;
  const lines = [
    headers.map((header) => escapeCsvValue(header)).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsvValue(cell)).join(",")),
  ];

  const csvBody = `${lines.join("\r\n")}\r\n`;

  return `${includeBom ? UTF8_BOM : ""}${csvBody}`;
}

export function stripUtf8Bom(value = "") {
  return value.startsWith(UTF8_BOM) ? value.slice(1) : value;
}

export function normalizeCsvHeader(value = "") {
  const normalized = stripUtf8Bom(String(value))
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, "")
    .replaceAll(/[_-]+/g, "");

  return transactionHeaderAliases[normalized] || normalized;
}

export function parseDayFirstOrIsoDate(rawValue) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value) || /^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [day, month, year] = value.split(/[/.]/).map(Number);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
