import { cookies } from "next/headers";

import { getHtmlLang, getMessages, LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n";

export async function getServerLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getServerMessages() {
  return getMessages(await getServerLocale());
}

export async function getServerHtmlLang() {
  return getHtmlLang(await getServerLocale());
}
