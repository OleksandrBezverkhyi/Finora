import { z } from "zod";

const email = z.email("Enter a valid email address").transform((value) => value.trim().toLowerCase());
const currency = z.enum(["UAH", "USD", "EUR"], {
  error: "Currency must be UAH, USD, or EUR",
});
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

export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must be 50 characters or fewer")
      .optional()
      .or(z.literal("")),
    currency,
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
    confirmNewPassword: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasAnyPasswordField = Boolean(
      data.currentPassword || data.newPassword || data.confirmNewPassword
    );

    if (!hasAnyPasswordField) {
      return;
    }

    if (!data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Current password is required to change password.",
      });
    }

    if (!data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password is required.",
      });
    } else {
      const parsedPassword = password.safeParse(data.newPassword);

      if (!parsedPassword.success) {
        parsedPassword.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["newPassword"],
            message: issue.message,
          });
        });
      }
    }

    if (!data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Please confirm the new password.",
      });
    }

    if (
      data.newPassword &&
      data.confirmNewPassword &&
      data.newPassword !== data.confirmNewPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Passwords do not match",
      });
    }

    if (
      data.currentPassword &&
      data.newPassword &&
      data.currentPassword === data.newPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password must differ from current password.",
      });
    }
  })
  .transform((data) => ({
    name: data.name?.trim() ? data.name.trim() : null,
    currency: data.currency,
    currentPassword: data.currentPassword || null,
    newPassword: data.newPassword || null,
  }));

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


const optionalGoalDate = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce.date({
    error: "Target date must be valid",
  }).nullable()
);

function startOfToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

export const goalSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Goal name must be at least 2 characters long")
      .max(80, "Goal name must be 80 characters or fewer"),
    targetAmount: z.coerce
      .number({
        error: "Target amount must be a valid number",
      })
      .positive("Target amount must be greater than 0")
      .max(999999999.99, "Target amount is too large"),
    currentAmount: z.coerce
      .number({
        error: "Current amount must be a valid number",
      })
      .min(0, "Current amount cannot be negative")
      .max(999999999.99, "Current amount is too large"),
    targetDate: optionalGoalDate,
    note: z
      .string()
      .trim()
      .max(500, "Note must be 500 characters or fewer")
      .optional()
      .or(z.literal(""))
      .transform((value) => value || null),
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"], {
      error: "Status must be ACTIVE, COMPLETED, or ARCHIVED",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.status !== "ACTIVE" || !data.targetDate) {
      return;
    }

    const targetDate = new Date(data.targetDate);

    targetDate.setHours(0, 0, 0, 0);

    if (targetDate < startOfToday()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetDate"],
        message: "Active goals must use today or a future date.",
      });
    }
  });
