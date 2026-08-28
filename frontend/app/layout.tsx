import type { Metadata } from "next";
import { Inter, Literata } from "next/font/google";
import "./globals.scss";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

export const literata = Literata({
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
    <html lang="en">
      <body className={`${inter.variable} ${literata.variable}`}>
        {children}
      </body>
    </html>
  );
}