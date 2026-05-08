const UTF8_BOM = "\uFEFF";

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
