import type { Metadata } from "next";
import { Jost, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

// Jost is a free alternative to Futura PT (used in original Adobe Portfolio)
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Godwin Johnson | Product Designer",
  description: "Product Designer (UI+UX) with an insatiable need to ship exciting products that humans can't live without.",
  openGraph: {
    title: "Godwin Johnson | Product Designer",
    description: "Product Designer (UI+UX) with an insatiable need to ship exciting products that humans can't live without.",
    url: "https://designed.cloud",
    siteName: "Godwin Johnson Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
