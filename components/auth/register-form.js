"use client";

import Link from "next/link";

import AuthField from "@/components/auth/auth-field";
import useRegisterForm from "@/components/auth/use-register-form";

function FormError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {message}
    </div>
  );
}

function RegisterActions({ callbackUrl, isSubmitting }) {
  const loginHref =
    callbackUrl && callbackUrl !== "/dashboard"
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
      <Link
        href={loginHref}
        className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
      >
        Back to login
      </Link>
    </div>
  );
}

export default function RegisterForm({ callbackUrl = "/dashboard" }) {
  const { fieldErrors, formError, handleSubmit, isSubmitting } = useRegisterForm(callbackUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <AuthField
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Your name"
        error={fieldErrors.name?.[0]}
      />
      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="name@example.com"
        error={fieldErrors.email?.[0]}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Create a strong password"
        error={fieldErrors.password?.[0]}
      />
      <AuthField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Repeat your password"
        error={fieldErrors.confirmPassword?.[0]}
      />
      <FormError message={formError} />
      <RegisterActions callbackUrl={callbackUrl} isSubmitting={isSubmitting} />
    </form>
  );
}
