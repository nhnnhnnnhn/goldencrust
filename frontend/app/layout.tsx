import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "700"] })

export const metadata = {
  title: "Pizza Liêm Khiết - Michelin-Starred Pizza",
  description: "Experience the art of pizza making at our Michelin-starred restaurant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
