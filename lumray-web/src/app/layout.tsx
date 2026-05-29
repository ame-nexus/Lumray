import type { Metadata } from "next";
import { Outfit, Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin']
})

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '700']
})

export const metadata: Metadata = {
  title: "Lumray",
  description: "Discover your next obsession",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${roboto.variable}`}>
      <body className="min-h-screen bg-bg text-text" suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
