import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppleSplash } from "@/components/pwa/AppleSplash";

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

// Micro-labels (eyebrows, stat captions, button text) render at 8-10px
// uppercase with wide tracking. Playfair is a high-contrast display serif —
// its hairlines break up at that size, especially light-on-dark. Manrope
// holds its weight down there, so accent is a sans and display stays serif.
const accent = Manrope({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alibaba-lounge.vercel.app";

const SITE_NAME = "Alibaba Hookah Lounge";
const SITE_DESCRIPTION =
  "Dallas hookah lounge with six tobacco brands, house mixes, fresh fruit heads and a full drinks list. Open late, every night.";

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
    "hookah Dallas",
    "shisha Dallas",
    "hookah bar near me",
    "late night Dallas",
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Alibaba",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
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
      <head>
        <AppleSplash />
      </head>
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
