"use client";

import { useRouter } from "next/navigation";

import { useLocale } from "@/components/common/locale-provider";

export default function LocaleSwitcher({ inverted = false }) {
  const router = useRouter();
  const { locale, messages, setLocale } = useLocale();

  function handleChange(nextLocale) {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    router.refresh();
  }

  const shared = inverted
    ? "border-white/25 bg-white/10 text-white/78 hover:bg-white/20"
    : "border-[var(--border)] bg-white/75 text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent p-1">
      {["en", "uk"].map((value) => {
        const active = value === locale;
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleChange(value)}
            className={
              "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition " +
              (active
                ? inverted
                  ? "bg-white text-[#0f766e]"
                  : "bg-[var(--accent)] text-white"
                : shared)
            }
          >
            {value === "en" ? messages.common.english : messages.common.ukrainian}
          </button>
        );
      })}
    </div>
  );
}
