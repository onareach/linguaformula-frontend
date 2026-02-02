import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <ul className="space-y-2 md:text-right">
        <li className="p-0">
          <a className="text-copy" href="/">
            about
          </a>
        </li>
        <li className="p-0">
          <a className="text-nav hover:text-nav-hover" href="/tables">
            tables
          </a>
        </li>
        <li className="p-0">
          <a className="text-nav hover:text-nav-hover" href="/applications">
            applications
          </a>
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
