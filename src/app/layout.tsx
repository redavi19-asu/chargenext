import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import "./motion-polish.css";
import "./orbital-mark.css";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { HeroMotionPolish } from "@/components/hero-motion-polish";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ChargeNext - Mobile EV Emergency Charging",
  description:
    "ChargeNext brings mobile EV charging to you across DC, Maryland, and Virginia with real-time dispatch and secure service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} bg-white text-slate-900 antialiased`}
      >
        <HeroMotionPolish />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
