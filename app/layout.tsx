import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ryzor.cc",
  description: "Your cloud-based Discord arsenal. Always-on, always one step ahead, and always free",
  openGraph: {
    title: "Ryzor.cc",
    description: "Your cloud-based Discord arsenal. Always-on, always one step ahead, and always free.",
    url: "https://ryzor.cc", // Replace with your actual domain
    siteName: "Ryzor.cc",
    images: [
      {
        url: "/og-image.png", // Path to your image in the public folder
        width: 1920, // The actual width of your image
        height: 1080, // The actual height of your image
        alt: "Ryzor.cc hero section with glowing red text and a terminal display.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ryzor.cc",
    description: "Your cloud-based Discord arsenal. Always-on, always one step ahead, and always free.",
    images: ["/og-image.png"], // Path to your image in the public folder
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
