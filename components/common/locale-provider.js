"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { getHtmlLang, getIntlLocale, getMessages, LOCALE_COOKIE_NAME, normalizeLocale, translateErrorMessage } from "@/lib/i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ initialLocale, children }) {
  const [locale, setLocaleState] = useState(normalizeLocale(initialLocale));

  const value = useMemo(() => {
    const normalized = normalizeLocale(locale);

    return {
      locale: normalized,
      intlLocale: getIntlLocale(normalized),
      messages: getMessages(normalized),
      setLocale(nextLocale) {
        const normalizedNext = normalizeLocale(nextLocale);
        document.cookie = `${LOCALE_COOKIE_NAME}=${normalizedNext}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = getHtmlLang(normalizedNext);
        setLocaleState(normalizedNext);
      },
      translateErrorMessage(message) {
        return translateErrorMessage(message, normalized);
      },
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
