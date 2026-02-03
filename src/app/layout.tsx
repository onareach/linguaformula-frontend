import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinguaFormula",
  description: "A web application for viewing and exploring mathematical formulas with LaTeX rendering and English verbalizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className}`}>
      <body className="antialiased tracking-tight">
        <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-8 dark:bg-zinc-950 bg-white text-gray-900 dark:text-zinc-200">
          <div className="flex flex-col md:flex-row justify-between relative max-w-6xl mx-auto w-full">
            <main className="w-full md:w-3/4 pr-0 md:pr-12 space-y-6">
              {children}
            </main>
            <Navigation />
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

function Navigation() {
  return (
    <nav className="mt-12 md:mt-0 w-full md:w-1/4">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="Lingua Formula Logo"
          width={180}
          height={180}
          className="inline-block max-w-full h-auto"
          priority
        />
      </div>
      <ul className="space-y-2 text-center">
        <li className="p-0">
          <Link className="text-copy" href="/">
            welcome
          </Link>
        </li>
        <li className="p-0">
          <Link className="text-nav hover:text-nav-hover" href="/formulas">
            formulas
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {/* Add footer links here if needed */}
      </div>
    </footer>
  );
}
