import { Geist, Geist_Mono } from "next/font/google";

import { LocaleProvider } from "@/components/common/locale-provider";
import { getServerAuthSession } from "@/lib/session";
import { getServerHtmlLang, getServerLocale } from "@/lib/server-locale";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Finora",
  description: "Personal finance tracker for spending, budgets, goals, and analytics",
};

export default async function RootLayout({ children }) {
  const locale = await getServerLocale();
  const htmlLang = await getServerHtmlLang();
  const session = await getServerAuthSession();
  const currency = session?.user?.currency || "UAH";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <LocaleProvider initialLocale={locale} initialCurrency={currency}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
