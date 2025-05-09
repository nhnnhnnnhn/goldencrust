"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeOff, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTranslation } from "@/utils/translations"
import { useRegisterMutation } from "@/redux/api/authApi"

export default function RegisterPage() {
  const router = useRouter()
  const [register, { isLoading }] = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)

    if (!validateRegisterForm()) {
      return
    }

    try {
      // Gọi API đăng ký từ backend thông qua Redux Toolkit
      await register({
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName,
        phone: registerData.phone,
        address: registerData.address,
      }).unwrap()

      // Lưu email để sử dụng trong trang xác thực OTP
      localStorage.setItem(
        "pendingRegistration",
        JSON.stringify({
          email: registerData.email,
        }),
      )

      // Chuyển hướng đến trang xác thực OTP
      router.push("/verify-otp?action=register")
    } catch (err: any) {
      console.error('Registration error:', err)
      setRegisterError(err?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    }
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
              {/* Hiển thị lỗi đăng ký nếu có */}
              {registerError && (
                <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
                  <AlertDescription>
                    {registerError}
                  </AlertDescription>
                </Alert>
              )}
              
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

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang đăng ký...' : 'Create Account'}
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
