import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Cinzel } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const accent = Cinzel({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sheesh Eatery & Lounge | Dallas's Premier Lounge",
  description:
    "Dallas's premier hookah lounge & dining destination. Where luxury meets flavor.",
  keywords: [
    "Sheesh",
    "hookah lounge",
    "Dallas restaurant",
    "luxury dining",
    "catering",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full",
        display.variable,
        body.variable,
        accent.variable
      )}
    >
      <body
        className={cn(
          "relative min-h-full overflow-x-hidden bg-[#050505] font-[family-name:var(--font-body)] antialiased",
          body.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
