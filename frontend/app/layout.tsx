import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const accent = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["600", "700", "800"],
  style: ["italic", "normal"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alibaba-lounge.vercel.app";

const SITE_NAME = "Alibaba Hookah Lounge";
const SITE_DESCRIPTION =
  "Dallas's premier hookah lounge & dining destination. Where luxury meets flavor.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Dallas's Premier Lounge`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Alibaba Hookah Lounge",
    "hookah lounge",
    "Dallas restaurant",
    "luxury dining",
    "catering",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Dallas's Premier Lounge`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Dallas's Premier Lounge`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// viewport-fit=cover is what makes env(safe-area-inset-*) resolve to real
// values on notched iPhones; without it they are always 0.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
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
        "dark min-h-screen",
        display.variable,
        body.variable,
        accent.variable
      )}
    >
      <body
        className={cn(
          "relative min-h-screen overflow-x-hidden bg-[#050505] font-[family-name:var(--font-body)] antialiased",
          body.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
