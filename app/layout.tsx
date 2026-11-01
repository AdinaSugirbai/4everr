import type { Metadata } from "next";
import "./globals.css";
import { MotionFrame } from "@/components/motion";
import { Navigation } from "@/components/navigation";
export const metadata: Metadata = {
  title: {
    default: "4everr — IT Career Navigator + TechTest",
    template: "%s · 4everr",
  },
  description:
    "Өзіңе сай IT бағытын тап, біліміңді тексер және мансабыңның келесі қадамын жаса.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk">
      <body>
        <Navigation />
        <main className="max-w-[1480px] mx-auto px-5 sm:px-8 lg:px-10 min-h-[75vh]">
          <MotionFrame>{children}</MotionFrame>
          <footer className="mt-14 py-7 border-t border-line flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted">
            <span>4everr ✳ &nbsp; IT-дағы өз жолыңды тап.</span>
            <span>UI демо · Вакансиялар мен нәтижелер — үлгі</span>
          </footer>
        </main>
      </body>
    </html>
  );
}
