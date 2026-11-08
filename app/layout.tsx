import type { Metadata } from "next";
import { Suspense } from "react";
import { Onest } from "next/font/google";
import Header from "@/components/Header";
import AuthGate from "@/components/AuthGate";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-onest" });
export const metadata: Metadata = { title: "4everr", description: "IT Career Navigator + TechTest" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={onest.variable}>
      <body>
        <I18nProvider>
          <AuthProvider>
            <Suspense fallback={<div className="h-14 border-b border-line bg-sf" />}>
              <Header />
            </Suspense>
            <main className="max-w-6xl mx-auto px-4 py-6">
              <AuthGate>{children}</AuthGate>
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
