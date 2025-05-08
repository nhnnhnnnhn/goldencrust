"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ChevronLeft, Eye, EyeOff, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [language, setLanguage] = useState<"en" | "vi">("en")

  // Get language from localStorage
  useState(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  })

  const t = getTranslation(language)

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would authenticate with a backend
    // For now, we'll just simulate a successful login
    login("John Doe", loginData.email, loginData.email.includes("admin") ? "admin" : "user", 150, "2023-01-15")
    router.push(redirect)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would register a new user with a backend
    // For now, we'll just simulate a successful registration and redirect to OTP verification
    // Store registration data in localStorage for demo purposes
    localStorage.setItem(
      "pendingRegistration",
      JSON.stringify({
        name: registerData.name,
        email: registerData.email,
        role: "user",
        loyaltyPoints: 0,
        joinDate: new Date().toISOString().split("T")[0],
      }),
    )

    // Redirect to OTP verification page
    router.push("/verify-otp?action=register")
  }

  const handleTestAccountLogin = (type: "admin" | "user") => {
    if (type === "admin") {
      login("Admin User", "admin@goldencrust.com", "admin", 500, "2022-05-10")
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
            <p className="mt-2 text-gray-600">Sign in to your account or create a new one</p>
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
                    onClick={() => handleTestAccountLogin("user")}
                  >
                    Login as User
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-6">
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
              </TabsContent>

              <TabsContent value="register" className="p-6">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800">
                      Create Account
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              By signing in or creating an account, you agree to our{" "}
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
