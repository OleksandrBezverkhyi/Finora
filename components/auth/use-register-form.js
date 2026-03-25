"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const initialFieldErrors = {
  name: [],
  email: [],
  password: [],
  confirmPassword: [],
};

function buildRegisterPayload(formElement) {
  const formData = new FormData(formElement);

  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
}

function buildLoginRedirectUrl(email, callbackUrl) {
  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("registered", "1");
  loginUrl.searchParams.set("email", email);
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return `${loginUrl.pathname}${loginUrl.search}`;
}

/**
 * Client hook that manages registration form submission, validation errors, and redirect on success.
 *
 * @param {string} callbackUrl
 * @returns {{
 *   fieldErrors: Record<string, string[]>,
 *   formError: string,
 *   handleSubmit: (event: SubmitEvent) => Promise<void>,
 *   isSubmitting: boolean
 * }}
 */
export default function useRegisterForm(callbackUrl) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialFieldErrors);

    const payload = buildRegisterPayload(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({ ...initialFieldErrors, ...data.issues.fieldErrors });
          setFormError(data.issues.formErrors?.[0] || "");
          return;
        }

        setFormError(data.error || "Unable to create account right now.");
        return;
      }

      router.push(buildLoginRedirectUrl(payload.email, callbackUrl));
      router.refresh();
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    fieldErrors,
    formError,
    handleSubmit,
    isSubmitting,
  };
}
