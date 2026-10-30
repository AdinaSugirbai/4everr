import type { Metadata } from "next";
import { Onest } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-onest" });
export const metadata: Metadata = { title: "4everr", description: "IT Career Navigator + TechTest" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={onest.variable}>
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
