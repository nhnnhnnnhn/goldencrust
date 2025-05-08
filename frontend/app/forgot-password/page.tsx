"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeOff, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [otpError, setOtpError] = useState("")

  const handleSendOtp = () => {
    if (!email) {
      setOtpError("Please enter your email address")
      return
    }

    setIsSendingOtp(true)
    setOtpError("")

    // Simulate sending OTP (in a real app, this would call an API)
    setTimeout(() => {
      setIsSendingOtp(false)
      setOtpSent(true)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!otpSent) {
      setError("Please send and verify OTP first")
      return
    }

    if (!otp) {
      setError("Please enter the OTP sent to your email")
      return
    }

    if (otp !== "123456") {
      // Demo OTP validation
      setError("Invalid OTP. Please try again")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    setError("")

    // Simulate password reset (in a real app, this would call an API)
    setTimeout(() => {
      setIsSubmitting(false)

      // Show success message and redirect to login
      alert("Password reset successful! Please login with your new password.")
      router.push("/login")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-blue-900 hover:text-blue-700">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>

        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-light uppercase tracking-wider text-blue-900">
              GOLDEN CRUST
            </Link>
            <p className="mt-2 text-gray-600">Reset your password</p>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-gray-600">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* OTP Field */}
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code (OTP)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-3/4"
                    />
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-1/4 bg-blue-900 text-white hover:bg-blue-800 text-xs px-2"
                    >
                      {isSendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                    </Button>
                  </div>
                  {otpError && <p className="text-sm text-red-600">{otpError}</p>}
                  {otpSent && !otpError && (
                    <p className="text-sm text-green-600">OTP sent! For demo purposes, use code: 123456</p>
                  )}
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-900 hover:underline">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
