"use client";

import { createContext, useContext, useMemo, useState } from "react";

import {
  formatMoneyLocalized,
  getCurrencySymbol,
  getHtmlLang,
  getIntlLocale,
  getMessages,
  LOCALE_COOKIE_NAME,
  normalizeCurrency,
  normalizeLocale,
  translateErrorMessage,
} from "@/lib/i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ initialLocale, initialCurrency = "UAH", children }) {
  const [locale, setLocaleState] = useState(normalizeLocale(initialLocale));
  const [currency, setCurrencyState] = useState(normalizeCurrency(initialCurrency));

  const value = useMemo(() => {
    const normalized = normalizeLocale(locale);
    const normalizedCurrency = normalizeCurrency(currency);

    return {
      locale: normalized,
      currency: normalizedCurrency,
      currencySymbol: getCurrencySymbol(normalizedCurrency, normalized),
      intlLocale: getIntlLocale(normalized),
      messages: getMessages(normalized),
      setLocale(nextLocale) {
        const normalizedNext = normalizeLocale(nextLocale);
        document.cookie = `${LOCALE_COOKIE_NAME}=${normalizedNext}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = getHtmlLang(normalizedNext);
        setLocaleState(normalizedNext);
      },
      setCurrency(nextCurrency) {
        setCurrencyState(normalizeCurrency(nextCurrency));
      },
      formatMoney(value) {
        return formatMoneyLocalized(value, normalized, normalizedCurrency);
      },
      translateErrorMessage(message) {
        return translateErrorMessage(message, normalized);
      },
    };
  }, [locale, currency]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
