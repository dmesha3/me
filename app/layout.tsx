import type { Metadata } from "next";
import { Space_Mono, Unbounded } from "next/font/google";
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/app/providers";
import { profile } from "@/data/profile";
import type { ReactNode } from "react";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap"
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.role}`,
  description: profile.headline,
  metadataBase: new URL("https://meshack.dev"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico"
  },
  openGraph: {
    title: `${profile.name} | Developer Portfolio`,
    description: profile.headline,
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${unbounded.variable}`}>
      <body className="min-h-screen bg-bg text-fg">
        <Providers>
          <a href="#content" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <main id="content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
