import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import AuthGate from "@/components/AuthGate";
import VisitTracker from "@/components/VisitTracker";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = { title: BRAND, description: "IT Career Navigator + TechTest" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk">
      <body>
        <I18nProvider>
          <AuthProvider>
            <VisitTracker />
            <Suspense fallback={<div className="h-14 border-b border-line bg-sf" />}>
              <Header />
            </Suspense>
            <main className="max-w-6xl mx-auto px-4 py-6">
              <Suspense fallback={<div className="h-24" />}>
                <AuthGate>{children}</AuthGate>
              </Suspense>
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
