import { z } from "zod";

const email = z.email("Enter a valid email address").transform((value) => value.trim().toLowerCase());

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
