"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocale } from "@/components/common/locale-provider";

const initialFieldErrors = {
  name: [],
  email: [],
  password: [],
  confirmPassword: [],
};

export default function RegisterForm({ callbackUrl = "/dashboard" }) {
  const router = useRouter();
  const { messages, translateErrorMessage } = useLocale();
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialFieldErrors);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          const translatedFieldErrors = Object.fromEntries(
            Object.entries({ ...initialFieldErrors, ...data.issues.fieldErrors }).map(([key, value]) => [
              key,
              Array.isArray(value) ? value.map((item) => translateErrorMessage(item)) : value,
            ])
          );
          setFieldErrors(translatedFieldErrors);
          setFormError(translateErrorMessage(data.issues.formErrors?.[0] || ""));
          return;
        }

        setFormError(translateErrorMessage(data.error || "Unable to create account right now."));
        return;
      }

      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("registered", "1");
      loginUrl.searchParams.set("email", payload.email);
      loginUrl.searchParams.set("callbackUrl", callbackUrl);

      router.push(`${loginUrl.pathname}${loginUrl.search}`);
      router.refresh();
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderFieldError(name) {
    const error = fieldErrors[name]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {messages.register.name}
        </span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder={messages.register.yourName}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        {renderFieldError("name")}
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {messages.login.email}
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        {renderFieldError("email")}
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {messages.login.password}
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder={messages.register.createPassword}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        {renderFieldError("password")}
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {messages.register.confirmPassword}
        </span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder={messages.register.repeatPassword}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        {renderFieldError("confirmPassword")}
      </label>

      {formError ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? messages.register.creating : messages.register.createAccount}
        </button>
        <Link
          href={`/login${callbackUrl && callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
        >
          {messages.register.backToLogin}
        </Link>
      </div>
    </form>
  );
}
