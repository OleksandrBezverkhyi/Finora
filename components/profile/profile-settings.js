"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocale } from "@/components/common/locale-provider";

const initialErrors = {
  name: [],
  currency: [],
  currentPassword: [],
  newPassword: [],
  confirmNewPassword: [],
};

export default function ProfileSettings({ initialProfile }) {
  const router = useRouter();
  const { messages, translateErrorMessage, setCurrency } = useLocale();
  const [formData, setFormData] = useState({
    name: initialProfile.name,
    email: initialProfile.email,
    currency: initialProfile.currency || "UAH",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors(initialErrors);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          currency: formData.currency,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialErrors,
            ...Object.fromEntries(
              Object.entries(data.issues.fieldErrors).map(([key, value]) => [
                key,
                value.map((item) => translateErrorMessage(item)),
              ])
            ),
          });
          setFormError(translateErrorMessage(data.issues.formErrors?.[0] || ""));
          return;
        }

        setFormError(translateErrorMessage(data.error || "Unable to save profile right now."));
        return;
      }

      setFormData((current) => ({
        ...current,
        name: data.user.name || "",
        currency: data.user.currency,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      setCurrency(data.user.currency);
      setSuccessMessage(translateErrorMessage(data.message || "Profile updated successfully."));
      router.refresh();
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <div className="space-y-3">
        <p className="eyebrow">{messages.profile.accountEyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          {messages.profile.accountTitle}
        </h2>
        <p className="muted max-w-2xl text-sm leading-6">
          {messages.profile.accountDescription}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {messages.profile.name}
            </span>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />
            {renderFieldError("name")}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {messages.profile.email}
            </span>
            <input
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="w-full cursor-not-allowed rounded-2xl border border-[var(--border)] bg-stone-100 px-4 py-3 text-base text-[var(--muted)] outline-none"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {messages.profile.currency}
          </span>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          >
            <option value="UAH">{messages.profile.currencies.UAH}</option>
            <option value="USD">{messages.profile.currencies.USD}</option>
            <option value="EUR">{messages.profile.currencies.EUR}</option>
          </select>
          {renderFieldError("currency")}
        </label>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {messages.profile.currentPassword}
            </p>
            <p className="text-sm text-[var(--muted)]">{messages.profile.passwordNote}</p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {messages.profile.currentPassword}
              </span>
              <div className="relative">
                <input
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  {showCurrentPassword ? messages.common.hide : messages.common.show}
                </button>
              </div>
              {renderFieldError("currentPassword")}
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {messages.profile.newPassword}
              </span>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  {showNewPassword ? messages.common.hide : messages.common.show}
                </button>
              </div>
              {renderFieldError("newPassword")}
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {messages.profile.confirmNewPassword}
              </span>
              <div className="relative">
                <input
                  name="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 pr-24 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  {showConfirmNewPassword ? messages.common.hide : messages.common.show}
                </button>
              </div>
              {renderFieldError("confirmNewPassword")}
            </label>
          </div>
        </div>

        {formError ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {formError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? messages.profile.saving : messages.profile.save}
        </button>
      </form>
    </section>
  );
}
