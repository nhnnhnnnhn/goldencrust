"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeOff, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getTranslation } from "@/utils/translations"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [registerErrors, setRegisterErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    phone?: string
  }>({})

  // Get language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)

  const validateRegisterForm = () => {
    const errors: {
      fullName?: string
      email?: string
      password?: string
      confirmPassword?: string
      phone?: string
    } = {}

    if (!registerData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!registerData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = "Email is invalid"
    }

    if (!registerData.password) {
      errors.password = "Password is required"
    } else if (registerData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (registerData.phone && !/^\d{10,11}$/.test(registerData.phone.replace(/[^0-9]/g, ""))) {
      errors.phone = "Phone number is invalid"
    }

    setRegisterErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateRegisterForm()) {
      return
    }

    // In a real app, this would register a new user with a backend
    // For now, we'll just simulate a successful registration and redirect to OTP verification
    // Store registration data in localStorage for demo purposes
    localStorage.setItem(
      "pendingRegistration",
      JSON.stringify({
        fullName: registerData.fullName,
        email: registerData.email,
        phone: registerData.phone,
        address: registerData.address,
        role: "user",
        isVerified: false,
        isActive: true,
        isSuspended: false,
        avatar: "",
        loyaltyPoints: 0,
        joinDate: new Date().toISOString().split("T")[0],
      }),
    )

    // Redirect to OTP verification page
    router.push("/verify-otp?action=register")
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
            <p className="mt-2 text-gray-600">Create a new account</p>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <form onSubmit={handleRegisterSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      placeholder="John Doe"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      required
                    />
                    {registerErrors.fullName && <p className="text-sm text-red-600">{registerErrors.fullName}</p>}
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
                    {registerErrors.email && <p className="text-sm text-red-600">{registerErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="pl-10"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {registerErrors.phone && <p className="text-sm text-red-600">{registerErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-address">Address (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="register-address"
                        placeholder="123 Main St, City, Country"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        className="pl-10"
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
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
                    {registerErrors.password && <p className="text-sm text-red-600">{registerErrors.password}</p>}
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
                    {registerErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{registerErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800">
                    Create Account
                  </Button>
                </div>
              </form>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-900 hover:underline">
                Sign in here
              </Link>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              By creating an account, you agree to our{" "}
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
