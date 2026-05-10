"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function SignOutButton({
  action,
  buttonLabel,
  confirmTitle,
  confirmDescription,
  cancelLabel,
  confirmLabel,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          "rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] " +
          className
        }
      >
        {buttonLabel}
      </button>

      {isMounted && isOpen
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-7">
            <div className="space-y-3">
              <p className="eyebrow">{buttonLabel}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {confirmTitle}
              </h3>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {confirmDescription}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                {cancelLabel}
              </button>
              <form action={action}>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  {confirmLabel}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )
        : null}
    </>
  );
}
