import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIMart | AI-Powered E-Commerce",
  description: "Experience the future of personalized shopping with AI-driven recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; 2026 AIMart.
          </div>
        </footer>
      </body>
    </html>
  );
}
