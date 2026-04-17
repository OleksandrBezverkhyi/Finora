import { z } from "zod";

const email = z.email("Enter a valid email address").transform((value) => value.trim().toLowerCase());
const categoryColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX value")
  .transform((value) => value.toUpperCase());

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must be 72 characters or fewer");

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string(),
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must be 50 characters or fewer")
      .optional()
      .or(z.literal("")),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  })
  .transform((data) => ({
    email: data.email,
    password: data.password,
    name: data.name?.trim() ? data.name.trim() : null,
    currency: "UAH",
  }));

export const loginSchema = z.object({
  email,
  password,
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(40, "Name must be 40 characters or fewer"),
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Type must be either INCOME or EXPENSE",
  }),
  color: categoryColor.optional().or(z.literal("")).transform((value) => value || null),
});

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Type must be either INCOME or EXPENSE",
  }),
  categoryId: z.string().trim().min(1, "Category is required"),
  amount: z.coerce
    .number({
      error: "Amount must be a valid number",
    })
    .positive("Amount must be greater than 0")
    .max(999999999.99, "Amount is too large"),
  date: z.coerce.date({
    error: "Date must be valid",
  }),
  comment: z
    .string()
    .trim()
    .max(255, "Comment must be 255 characters or fewer")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || null),
});


export const budgetSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required"),
  amount: z.coerce
    .number({
      error: "Amount must be a valid number",
    })
    .positive("Budget amount must be greater than 0")
    .max(999999999.99, "Budget amount is too large"),
  month: z.coerce
    .number({
      error: "Month must be a valid number",
    })
    .int("Month must be a whole number")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z.coerce
    .number({
      error: "Year must be a valid number",
    })
    .int("Year must be a whole number")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
});
