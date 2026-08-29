import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Inter for all UI; Source Serif 4 only for sparing editorial moments (DESIGN.md).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "QuotePilot",
  description:
    "Describe the job, send a professional quote in minutes, and let your customer approve it from their phone.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
