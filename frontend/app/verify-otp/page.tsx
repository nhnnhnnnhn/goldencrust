"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVerifyOtpMutation, useForgotPasswordMutation } from "@/redux/api/authApi"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get("action") || "register"
  const email = searchParams.get("email") || ""

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation()
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [userEmail, setUserEmail] = useState("")
  const [expiryTime, setExpiryTime] = useState<Date | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  const { login } = useAuth()

  // Get user email from localStorage if action is register
  useEffect(() => {
    if (action === "register") {
      const pendingRegistration = localStorage.getItem("pendingRegistration")
      if (pendingRegistration) {
        const userData = JSON.parse(pendingRegistration)
        setUserEmail(userData.email)
      }
    } else if (action === "reset" && email) {
      setUserEmail(email)
    }

    // Set expiry time for OTP (5 minutes from now)
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 5)
    setExpiryTime(expiry)
  }, [action, email])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Check if OTP is expired
  useEffect(() => {
    if (!expiryTime) return

    const checkExpiry = () => {
      if (new Date() > expiryTime) {
        setIsExpired(true)
      }
    }

    const timer = setInterval(checkExpiry, 1000)
    checkExpiry() // Check immediately

    return () => clearInterval(timer)
  }, [expiryTime])

  // Handle input change for OTP fields
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  // Handle key down for OTP fields (backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  // Handle paste for OTP fields
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtp = [...otp]

      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOtp[i] = pastedData[i]
      }

      setOtp(newOtp)

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((val) => !val)
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
      const nextInput = document.getElementById(`otp-${focusIndex}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    if (isExpired) {
      setError("OTP has expired. Please request a new one.")
      return
    }
    setIsVerifying(true)
    setError("")

    try {
      // Gọi API xác thực OTP thông qua Redux Toolkit
      const pendingRegistration = localStorage.getItem("pendingRegistration")
      let emailToVerify = userEmail
      
      if (!emailToVerify && pendingRegistration) {
        try {
          const userData = JSON.parse(pendingRegistration)
          emailToVerify = userData.email
        } catch (error) {
          console.error("Error parsing pending registration:", error)
          setError("An error occurred. Please try again.")
          setIsVerifying(false)
          return
        }
      }
      
      if (!emailToVerify) {
        setError("Missing email information")
        setIsVerifying(false)
        return
      }
      
      await verifyOtp({
        email: emailToVerify,
        code: otpValue,
        action: action.toUpperCase() // API expects action in uppercase - REGISTER, FORGOT_PASSWORD etc.
      }).unwrap()
      
      // Verification successful
      localStorage.removeItem("pendingRegistration")
      setIsVerified(true)
      
      // Redirect after a delay
      setTimeout(() => {
        if (action === "register") {
          router.push("/login")
        } else if (action === "reset") {
          router.push("/reset-password")
        }
      }, 3000)
      
    } catch (err: any) {
      console.error('OTP verification error:', err)
      setError(err?.data?.message || 'Xác thực OTP thất bại')
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      // Gọi API gửi lại OTP (sẽ mở rộng API với endpoint resend-otp)
      // Hoặc trong trường hợp này, ta có thể gọi lại API gửi OTP ban đầu
      let emailToVerify = userEmail;
      
      const pendingRegistration = localStorage.getItem("pendingRegistration")
      if (!emailToVerify && pendingRegistration) {
        try {
          const userData = JSON.parse(pendingRegistration)
          emailToVerify = userData.email
        } catch (error) {
          console.error("Error parsing pending registration:", error)
          setError("An error occurred. Please try again.")
          return
        }
      }
      
      if (!emailToVerify) {
        setError("Missing email information")
        return
      }
      
      // Gọi API forgotPassword để gửi lại OTP
      await forgotPassword({ email: emailToVerify }).unwrap()
      
      // Reset đồng hồ và thời gian hết hạn
      setCountdown(60)
      setIsExpired(false)
      
      // Đặt lại thời gian hết hạn (5 phút kể từ bây giờ)
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 5)
      setExpiryTime(expiry)
      
      setError("")
      alert("OTP has been resent to your email! (Simulated - will implement actual API call)")
    } catch (err: any) {
      console.error('Resend OTP error:', err)
      setError(err?.data?.message || 'Gửi lại OTP thất bại')
    }
  }

  // Format remaining time until expiry
  const formatExpiryTime = () => {
    if (!expiryTime) return ""

    const now = new Date()
    const diff = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / 1000))

    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={action === "register" ? "/login" : "/forgot-password"}
            className="inline-flex items-center text-blue-900 hover:text-blue-700"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-light uppercase tracking-wider text-blue-900">
              GOLDEN CRUST
            </Link>
            <p className="mt-2 text-gray-600">
              {action === "register"
                ? "Verify your email to complete registration"
                : "Verify your email to reset password"}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow p-6">
            {isVerified ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verification Successful</h2>
                <p className="text-gray-600 mb-6">
                  {action === "register"
                    ? "Your email has been verified. Redirecting to login page..."
                    : "Your identity has been verified. Redirecting to reset password page..."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Verification Code</h2>
                  <p className="text-gray-600">
                    We've sent a 6-digit verification code to <span className="font-medium">{userEmail}</span>
                  </p>
                  {expiryTime && (
                    <p className="text-sm text-gray-500 mt-2">
                      Code expires in:{" "}
                      <span className={isExpired ? "text-red-500 font-medium" : "font-medium"}>
                        {formatExpiryTime()}
                      </span>
                    </p>
                  )}
                </div>

                {isExpired && (
                  <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-600">
                      This verification code has expired. Please request a new one.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-6">
                  <Label htmlFor="otp-0" className="sr-only">
                    OTP
                  </Label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-xl font-semibold"
                        disabled={isExpired}
                      />
                    ))}
                  </div>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || isLoading || otp.join("").length !== 6 || isExpired}
                  className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800"
                >
                  {isVerifying || isLoading ? "Verifying..." : "Verify"}
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">Resend code in {countdown} seconds</p>
                  ) : (
                    <button 
                      onClick={handleResendOtp} 
                      disabled={isResending}
                      className="text-sm text-blue-900 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {isResending ? "Sending..." : "Resend Code"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              For demo purposes, use OTP: <span className="font-semibold">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
