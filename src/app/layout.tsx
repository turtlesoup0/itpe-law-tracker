import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT 법령 트래커",
  description: "IT 관련 법령을 쉽게 분석하고 추적하는 서비스",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased bg-background text-foreground`}>
        <NavBar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-7">
          {children}
        </main>

        <footer className="border-t py-4">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-faint">
            IT 법령 트래커 &mdash; 법률 &rarr; 시행령 &rarr; 고시 위임구조 · 개정 추적
          </div>
        </footer>
      </body>
    </html>
  );
}
