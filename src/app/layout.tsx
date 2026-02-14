import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { NavigationProvider } from "@/context/NavigationContext";
import LayoutWrapper from "./components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lingua Formula",
  description: "A web application for viewing and exploring mathematical formulas with LaTeX rendering and English verbalizations",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-integral-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-integral-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-integral-32.png',
  },
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
          <AuthProvider>
            <AccessibilityProvider>
              <NavigationProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </NavigationProvider>
            </AccessibilityProvider>
          </AuthProvider>
          <Footer />
        </div>
      </body>
    </html>
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
