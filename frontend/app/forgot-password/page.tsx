"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Eye, EyeOff, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForgotPasswordMutation, useResetPasswordMutation, useVerifyOtpMutation } from "@/redux/api/authApi"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailParam)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [expiryTime, setExpiryTime] = useState<Date | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [successMessage, setSuccessMessage] = useState("") // Thông báo thành công

  // Set initial email from URL parameter if available
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])

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

  const [forgotPassword, { isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation()
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation()
  const [resetPassword, { isLoading: isResetPasswordLoading }] = useResetPasswordMutation()
  const [resetToken, setResetToken] = useState<string>("")

  const handleSendOtp = async () => {
    if (!email) {
      setOtpError("Vui lòng nhập địa chỉ email của bạn")
      return
    }

    setIsSendingOtp(true)
    setOtpError("")

    try {
      // Gọi API gửi OTP
      const response = await forgotPassword({ email }).unwrap()
      setIsSendingOtp(false)
      setOtpSent(true)

      // Đặt thời gian hết hạn cho OTP (5 phút kể từ bây giờ)
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 5)
      setExpiryTime(expiry)
      setIsExpired(false)

      // Hiển thị thông báo thành công trên giao diện
      setSuccessMessage(response.message || "Mã OTP đã được gửi đến email của bạn")
      setError("") // Xóa thông báo lỗi nếu có
    } catch (err: any) {
      setIsSendingOtp(false)
      setOtpError(err?.data?.message || "Không thể gửi OTP. Vui lòng thử lại sau.")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra form
    if (!email) {
      setError("Vui lòng nhập địa chỉ email của bạn")
      return
    }

    if (!otpSent) {
      setError("Vui lòng gửi và xác minh OTP trước")
      return
    }

    if (!otp) {
      setError("Vui lòng nhập mã OTP đã gửi đến email của bạn")
      return
    }

    if (isExpired) {
      setError("OTP đã hết hạn. Vui lòng yêu cầu mã mới.")
      return
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Bước 1: Gọi API xác thực OTP trước để lấy token JWT
      // Lưu ý: chúng ta không phụ thuộc vào state resetToken vì state không cập nhật ngay
      let tokenToUse = resetToken
      
      if (!tokenToUse) {
        console.log('Gọi API xác thực OTP để lấy token')
        const verifyResponse = await verifyOtp({
          email,
          code: otp,
          action: 'FORGOT_PASSWORD'
        }).unwrap()

        console.log('Verify OTP response:', verifyResponse)
        if (verifyResponse.token) {
          tokenToUse = verifyResponse.token
          setResetToken(verifyResponse.token) // Cập nhật state (chỉ cho lần sau)
        } else {
          throw new Error("Không nhận được token từ server")
        }
      }
      
      // Bước 2: Sử dụng token JWT để reset password
      console.log('Token sẽ được sử dụng để reset password:', tokenToUse)
      console.log('New password:', password)
      
      if (!tokenToUse) {
        throw new Error('Token không tồn tại, vui lòng thử lại')
      }
      
      const resetResponse = await resetPassword({
        token: tokenToUse,
        newPassword: password
      }).unwrap()

      setIsSubmitting(false)

      // Hiển thị thông báo thành công trên giao diện
      setSuccessMessage(resetResponse.message || "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.")
      setError("") // Xóa thông báo lỗi nếu có
      
      // Tự động chuyển hướng sau 3 giây
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setIsSubmitting(false)
      console.error('Reset password error:', err)
      setError(err?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.")
    }
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
                      placeholder="Nhập mã 6 chữ số"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-3/4"
                      disabled={isExpired}
                    />
                    <Button
                      type="button"
                      className="w-1/4"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || !email || (otpSent && !isExpired)}
                    >
                      {isSendingOtp ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                          <span className="ml-1">Gửi...</span>
                        </>
                      ) : otpSent && !isExpired ? (
                        "Đã gửi"
                      ) : (
                        "Lấy OTP"
                      )}
                    </Button>
                  </div>
                  {otpError && <p className="text-sm text-red-600">{otpError}</p>}
                  {otpSent && !otpError && !isExpired && (
                    <p className="text-sm text-green-600">OTP sent!</p>
                  )}
                </div>

                {/* Hiển thị thông báo thành công */}
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-600">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Hiển thị thông báo lỗi */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Thông báo OTP hết hạn */}
                {isExpired && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-600">
                      Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.
                    </AlertDescription>
                  </Alert>
                )}

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
                  className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                      Đang xử lý...
                    </>
                  ) : "Đặt lại mật khẩu"}
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
