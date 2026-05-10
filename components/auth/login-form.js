"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginForm({
  authenticate,
  callbackUrl,
  registered,
  registeredEmail,
  errorMessage,
  messages,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={authenticate} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {messages.login.email}
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={registeredEmail}
          placeholder="name@example.com"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {messages.login.password}
        </span>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder={messages.login.passwordPlaceholder}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            {showPassword ? messages.common.hide : messages.common.show}
          </button>
        </div>
      </label>

      {registered ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {messages.localeName === "Українська"
            ? "Акаунт успішно створено. Увійдіть з новими обліковими даними."
            : "Account created successfully. Sign in with your new credentials."}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {messages.localeName === "Українська"
            ? errorMessage === "Invalid email or password."
              ? "Неправильний email або пароль."
              : "Зараз не вдалося увійти. Спробуйте ще раз."
            : errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)]"
        >
          {messages.login.submit}
        </button>
        <Link
          href={`/register${callbackUrl && callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
        >
          {messages.login.createAccount}
        </Link>
      </div>
    </form>
  );
}
