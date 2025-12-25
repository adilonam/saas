import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "styles/globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Managepdf.site - PDF Encryption & File Management",
  description:
    "Secure PDF encryption, signing, and file management tools. Sign PDFs manually, encrypt documents, and manage your files with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${interTight.variable} font-sans bg-white dark:bg-black min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
