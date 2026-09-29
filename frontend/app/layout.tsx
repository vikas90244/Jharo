import type { Metadata } from "next";
import { Inter, Literata, Geist } from "next/font/google";
import "./globals.scss";
import "./global.css"
import { cn } from "@/lib/utils";
import QueryProvider from "./QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "./theme-script";

const geist = Geist({
  subsets:['latin'],
  variable:'--font-sans'
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-reading",
});

export const metadata: Metadata = {
  title: {
    default: "Jharo",
    template: "%s | Jharo",
  },
  description:
    "A reading workspace that helps readers understand books without leaving them.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} ${literata.variable}`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="bottom-right"
                richColors
                closeButton
               />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}