import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ryzor.cc - Your Cloud-Based Discord Arsenal",
  description: "Your cloud-based Discord arsenal. Always-on, always one step ahead, and always free. Nitro sniper, account backups, token vault, and more - all 100% free.",
  keywords: "Discord, Nitro Sniper, Account Backup, Token Vault, Auto Joiner, Presence Spoofer, Cloud Control, Server Scraper, Server Cloner, Open Source, Free Discord Tools",
  authors: [{ name: "Ryzor.cc Team" }],
  creator: "Ryzor.cc",
  publisher: "Ryzor.cc",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ryzor.cc - Your Cloud-Based Discord Arsenal",
    description: "Your cloud-based Discord arsenal. Always-on, always one step ahead, and always free. Nitro sniper, account backups, token vault, and more - all 100% free.",
    siteName: "Ryzor.cc",
    images: [
      {
        url: "/og-image.png",
        width: 1920,
        height: 1080,
        alt: "Ryzor.cc - Cloud-based Discord arsenal with cyberpunk design featuring glowing red terminal interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ryzor.cc - Your Cloud-Based Discord Arsenal",
    description: "Your cloud-based Discord arsenal. Always-on, always one step ahead, and always free. Nitro sniper, account backups, token vault, and more - all 100% free.",
    images: ["/og-image.png"],
    creator: "@its3rr0rswrld",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#ff0033" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ryzor.cc" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen overflow-y-scroll">{/* Main content wrapper for always-visible scrollbar */}
          {children}
        </div>
      </body>
    </html>
  )
}
