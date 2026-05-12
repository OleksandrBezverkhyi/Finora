import Papa from "papaparse";
import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeCsvHeader, parseDayFirstOrIsoDate, stripUtf8Bom } from "@/lib/csv";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { buildTransactionCategorySnapshot } from "@/lib/transactions";
import { transactionSchema } from "@/lib/validators";

const importModeSchema = z.enum(["preview", "import"]);
const RESERVED_CATEGORY_NAME = "__FINORA_OVERALL_EXPENSES__";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(error, extra = {}) {
  return NextResponse.json({ error, ...extra }, { status: 400 });
}

function normalizeTypeValue(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (["income", "дохід", "in", "inc"].includes(normalized)) {
    return "INCOME";
  }

  if (["expense", "витрати", "витрата", "exp"].includes(normalized)) {
    return "EXPENSE";
  }

  return null;
}

function normalizeComment(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function buildCategoryKey(type, name) {
  return `${type}:${name.trim().toLowerCase()}`;
}

function randomHexChannel() {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function generateUniqueCategoryColor(usedColors) {
  let nextColor = null;

  do {
    nextColor = `#${randomHexChannel()}${randomHexChannel()}${randomHexChannel()}`;
  } while (usedColors.has(nextColor));

  usedColors.add(nextColor);

  return nextColor;
}

async function extractCsvText(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const mode = importModeSchema.safeParse(formData.get("mode") || "preview");
    const file = formData.get("file");
    const csvTextField = formData.get("csvText");

    if (file && typeof file !== "string") {
      return {
        mode: mode.success ? mode.data : "preview",
        text: stripUtf8Bom(await file.text()),
      };
    }

    if (typeof csvTextField === "string" && csvTextField.trim()) {
      return {
        mode: mode.success ? mode.data : "preview",
        text: stripUtf8Bom(csvTextField),
      };
    }

    return null;
  }

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const mode = importModeSchema.safeParse(body.mode || "preview");

    if (typeof body.csvText === "string" && body.csvText.trim()) {
      return {
        mode: mode.success ? mode.data : "preview",
        text: stripUtf8Bom(body.csvText),
      };
    }
  }

  const text = stripUtf8Bom(await request.text());

  if (!text.trim()) {
    return null;
  }

  return {
    mode: "preview",
    text,
  };
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const csvPayload = await extractCsvText(request);

  if (!csvPayload?.text?.trim()) {
    return badRequest("CSV file is required.");
  }

  const parsedCsv = Papa.parse(csvPayload.text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeCsvHeader,
  });

  if (parsedCsv.errors.length) {
    return badRequest("CSV file could not be parsed.", {
      errors: parsedCsv.errors.map((error) => ({
        rowNumber:
          error.row === undefined || error.row === null ? null : error.row + 1,
        messages: [error.message],
      })),
    });
  }

  if (!parsedCsv.data.length) {
    return badRequest("CSV file has no transaction rows.");
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    },
  });

  const categoriesByKey = new Map(
    categories.map((category) => [buildCategoryKey(category.type, category.name), category])
  );
  const usedCategoryColors = new Set(
    categories.map((category) => category.color).filter(Boolean)
  );

  const preview = [];
  const errors = [];
  const validRows = [];
  const categoriesToCreate = new Map();
  let skippedEmptyRows = 0;

  for (let index = 0; index < parsedCsv.data.length; index += 1) {
    const rawRow = parsedCsv.data[index] || {};
    const rowNumber = index + 2;
    const values = Object.values(rawRow).map((value) => String(value || "").trim());

    if (!values.some(Boolean)) {
      skippedEmptyRows += 1;
      continue;
    }

    const normalizedType = normalizeTypeValue(rawRow.type);
    const normalizedDate = parseDayFirstOrIsoDate(rawRow.date);
    const normalizedAmount = Number(String(rawRow.amount || "").replace(",", "."));
    const categoryName = String(rawRow.category || "").trim();
    const comment = normalizeComment(rawRow.comment);
    const categoryKey =
      normalizedType && categoryName ? buildCategoryKey(normalizedType, categoryName) : null;
    const rowIssues = [];
    const rowMessages = [];

    if (!normalizedType) {
      rowIssues.push("Transaction type is invalid.");
    }

    if (!categoryName) {
      rowIssues.push("Category is required.");
    }

    if (
      normalizedType === "EXPENSE" &&
      categoryName &&
      categoryName === RESERVED_CATEGORY_NAME
    ) {
      rowIssues.push("Category name is reserved.");
    }

    if (!normalizedDate || Number.isNaN(normalizedDate.getTime())) {
      rowIssues.push("Transaction date is invalid.");
    }

    if (!Number.isFinite(normalizedAmount)) {
      rowIssues.push("Transaction amount is invalid.");
    }

    const matchedCategory =
      categoryKey ? categoriesByKey.get(categoryKey) : null;

    if (rowIssues.length) {
      errors.push({ rowNumber, messages: rowIssues });
      preview.push({
        previewNumber: preview.length + 1,
        rowNumber,
        type: rawRow.type || "",
        category: categoryName,
        amount: rawRow.amount || "",
        date: rawRow.date || "",
        comment: comment || "",
        status: "invalid",
        messages: rowIssues,
      });
      continue;
    }

    const parsedRow = transactionSchema.safeParse({
      type: normalizedType,
      categoryId: matchedCategory?.id || "__import__",
      amount: normalizedAmount,
      date: normalizedDate,
      comment: comment ?? "",
    });

    if (!parsedRow.success) {
      const messages = parsedRow.error.issues.map((issue) => issue.message);
      errors.push({ rowNumber, messages });
      preview.push({
        previewNumber: preview.length + 1,
        rowNumber,
        type: normalizedType,
        category: categoryName,
        amount: normalizedAmount,
        date: rawRow.date || "",
        comment: comment || "",
        status: "invalid",
        messages,
      });
      continue;
    }

    if (!matchedCategory) {
      if (!categoriesToCreate.has(categoryKey)) {
        categoriesToCreate.set(categoryKey, {
          name: categoryName,
          type: normalizedType,
          color: generateUniqueCategoryColor(usedCategoryColors),
        });
      }

      rowMessages.push("Category will be created automatically during import.");
    }

    validRows.push({
      rowNumber,
      type: parsedRow.data.type,
      amount: parsedRow.data.amount,
      date: parsedRow.data.date,
      comment: parsedRow.data.comment,
      categoryName,
      categoryType: normalizedType,
      categoryId: matchedCategory?.id ?? null,
      categoryColor:
        matchedCategory?.color ?? categoriesToCreate.get(categoryKey)?.color ?? null,
    });

    preview.push({
      previewNumber: preview.length + 1,
      rowNumber,
      type: normalizedType,
      category: categoryName,
      amount: parsedRow.data.amount.toFixed(2),
      date: parsedRow.data.date.toISOString().slice(0, 10),
      comment: comment || "",
      status: "ready",
      messages: rowMessages,
    });
  }

  const summary = {
    totalRows: parsedCsv.data.length,
    previewRows: preview.length,
    skippedEmptyRows,
    validRows: validRows.length,
    invalidRows: errors.length,
    categoriesToCreate: categoriesToCreate.size,
    importedRows: 0,
  };

  if (csvPayload.mode === "import" && errors.length) {
    return badRequest("Resolve CSV validation issues before importing.", {
      summary,
      preview: preview.slice(0, 20),
      errors,
    });
  }

  if (csvPayload.mode === "import") {
    await prisma.$transaction(async (tx) => {
      const resolvedCategoriesByKey = new Map(categoriesByKey);

      for (const [key, missingCategory] of categoriesToCreate.entries()) {
        const createdCategory = await tx.category.create({
          data: {
            userId: user.id,
            name: missingCategory.name,
            type: missingCategory.type,
            color: missingCategory.color,
          },
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        });

        resolvedCategoriesByKey.set(key, createdCategory);
      }

      await tx.transaction.deleteMany({
        where: {
          userId: user.id,
        },
      });

      for (const row of validRows) {
        const category = resolvedCategoriesByKey.get(
          buildCategoryKey(row.categoryType, row.categoryName)
        );

        await tx.transaction.create({
          data: {
            userId: user.id,
            type: row.type,
            categoryId: category?.id ?? null,
            amount: row.amount,
            date: row.date,
            comment: row.comment,
            ...buildTransactionCategorySnapshot(
              category || {
                name: row.categoryName,
                color: row.categoryColor,
              }
            ),
          },
        });
      }
    });

    summary.importedRows = validRows.length;
  }

  return NextResponse.json({
    ok: true,
    mode: csvPayload.mode,
    message:
      csvPayload.mode === "import"
        ? "Transactions imported successfully."
        : "",
    summary,
    preview: preview.slice(0, 20),
    errors,
  });
}
