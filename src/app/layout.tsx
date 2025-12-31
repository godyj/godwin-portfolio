import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
