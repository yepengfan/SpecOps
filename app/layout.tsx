import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpecOps",
  description: "Specification-Driven Development Workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b">
            <nav
              aria-label="Main navigation"
              className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3"
            >
              <Link href="/" className="text-lg font-bold">
                SpecOps
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Projects
              </Link>
              <Link
                href="/settings"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
