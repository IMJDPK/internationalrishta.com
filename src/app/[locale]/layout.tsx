import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Noto_Nastaliq_Urdu, Poppins } from "next/font/google";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-nastaliq",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = locale === "ur" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${poppins.variable} ${nastaliq.variable}`}
    >
      <body className={locale === "ur" ? "font-nastaliq" : "font-poppins"}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
