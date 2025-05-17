import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider as AuthContextProvider } from "@/contexts/auth-context"
import { AuthProvider } from "./auth-provider"
import { Providers } from "./providers"
import TokenValidator from "./TokenValidator"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "700"] })

export const metadata = {
  title: "Golden Crust - Michelin-Starred Pizza",
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
        <Providers>
          <AuthContextProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <TokenValidator />
                {children}
              </ThemeProvider>
            </AuthProvider>
          </AuthContextProvider>
        </Providers>
      </body>
    </html>
  )
}
