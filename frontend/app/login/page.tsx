"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ChevronLeft, Eye, EyeOff, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTranslation } from "@/utils/translations"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [language, setLanguage] = useState<"en" | "vi">("en")

  // Get language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would authenticate with a backend
    // For now, we'll just simulate a successful login
    login("John Doe", loginData.email, loginData.email.includes("admin") ? "admin" : "user", 150, "2023-01-15")
    router.push(redirect)
  }

  const handleTestAccountLogin = (type: "admin" | "employee" | "user") => {
    if (type === "admin") {
      login("Admin User", "admin@goldencrust.com", "admin", 500, "2022-05-10")
    } else if (type === "employee") {
      login("Employee User", "employee@goldencrust.com", "employee", 300, "2022-08-15")
    } else {
      login("Regular User", "user@goldencrust.com", "user", 150, "2023-01-15")
    }
    router.push(redirect)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-900 hover:text-blue-700">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-light uppercase tracking-wider text-blue-900">
              GOLDEN CRUST
            </Link>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          {/* Test Accounts Section */}
          <div className="mb-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-900" />
              <AlertDescription className="text-sm text-blue-900">
                <span className="font-medium">Test Accounts:</span>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-900 hover:bg-blue-100"
                    onClick={() => handleTestAccountLogin("admin")}
                  >
                    Login as Admin
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-900 hover:bg-blue-100"
                    onClick={() => handleTestAccountLogin("employee")}
                  >
                    Login as Employee
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-900 hover:bg-blue-100"
                    onClick={() => handleTestAccountLogin("user")}
                  >
                    Login as User
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <form onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-blue-900 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800">
                    Sign In
                  </Button>
                </div>
              </form>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-900 hover:underline">
                Register here
              </Link>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-blue-900 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-900 hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
