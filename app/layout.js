import { Geist, Geist_Mono } from "next/font/google";

import { LocaleProvider } from "@/components/common/locale-provider";
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
  description: "Personal finance tracker with analytics and budgeting",
};

export default async function RootLayout({ children }) {
  const locale = await getServerLocale();
  const htmlLang = await getServerHtmlLang();

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
