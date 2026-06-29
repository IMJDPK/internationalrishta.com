import ErrorBoundary from "@/components/ErrorBoundary";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { Poppins } from "next/font/google";
import enMessages from "../../../locales/en/common.json";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Admin — International Rishta",
  description: "Admin dashboard for International Rishta",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="font-poppins" suppressHydrationWarning>
        <NextIntlClientProvider
          locale="en"
          messages={enMessages as unknown as AbstractIntlMessages}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
