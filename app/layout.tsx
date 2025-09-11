import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/layout/SiteFooter";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "誰でもエンジニア",
  description: "動画・コース・AIプロンプトで学習を加速する教育プラットフォーム",
  openGraph: {
    title: "誰でもエンジニア",
    description: "動画・コース・AIプロンプトで学習を加速する教育プラットフォーム",
    url: "https://example.com",
    siteName: "誰でもエンジニア",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "誰でもエンジニア",
    description: "動画・コース・AIプロンプトで学習を加速する教育プラットフォーム",
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
        {/* Organization JSON-LD */}
        <Script id="ld-org" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: '誰でもエンジニア',
            url: 'https://example.com',
            sameAs: ['https://twitter.com', 'https://youtube.com', 'https://github.com'],
          })}
        </Script>

        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
