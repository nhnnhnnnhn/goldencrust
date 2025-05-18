"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Eye, EyeOff, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTranslation } from "@/utils/translations"
import { useRegisterMutation } from "@/redux/api/authApi"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [register, { isLoading }] = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  
  // Kiểm tra xem có phải đang đăng ký từ Google OAuth không
  const isGoogleSignup = searchParams.get('google_signup') === 'true'
  const googleEmail = searchParams.get('email') || ''
  const googleFullName = searchParams.get('fullName') || ''
  const googleToken = searchParams.get('token') || ''
  const googleId = searchParams.get('googleId') || ''
  
  const [registerData, setRegisterData] = useState({
    fullName: isGoogleSignup ? googleFullName : "",
    email: isGoogleSignup ? googleEmail : "",
    password: isGoogleSignup ? Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) : "", // Random password if Google signup
    confirmPassword: isGoogleSignup ? Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) : "",
    phone: "",
    address: "",
    googleId: isGoogleSignup ? googleId : "",
    googleToken: isGoogleSignup ? googleToken : "",
  })
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [registerErrors, setRegisterErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    phone?: string
    address?: string
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
      address?: string
    } = {}

    // Validate email
    if (!registerData.email.trim()) {
      errors.email = "Email là bắt buộc"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = "Email không hợp lệ"
    }

    // Validate fullName
    if (!registerData.fullName.trim()) {
      errors.fullName = "Họ tên là bắt buộc"
    } else if (registerData.fullName.length < 3 || registerData.fullName.length > 50) {
      errors.fullName = "Họ tên phải từ 3-50 ký tự"
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/u.test(registerData.fullName)) {
      errors.fullName = "Họ tên chỉ được chứa chữ cái và khoảng trắng"
    }

    // Validate address
    if (!registerData.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc"
    } else if (registerData.address.length < 3 || registerData.address.length > 100) {
      errors.address = "Địa chỉ phải từ 3-100 ký tự"
    }

    // Validate phone
    if (!registerData.phone) {
      errors.phone = "Số điện thoại là bắt buộc"
    } else if (!/^[0-9]+$/.test(registerData.phone)) {
      errors.phone = "Số điện thoại chỉ được chứa chữ số"
    } else if (registerData.phone.length !== 10) {
      errors.phone = "Số điện thoại phải có đúng 10 chữ số"
    }

    // Bỏ qua kiểm tra mật khẩu nếu đăng ký từ Google
    if (!isGoogleSignup) {
      if (!registerData.password) {
        errors.password = "Mật khẩu là bắt buộc"
      } else if (registerData.password.length < 8) {
        errors.password = "Mật khẩu phải có ít nhất 8 ký tự"
      }

      if (!registerData.confirmPassword) {
        errors.confirmPassword = "Vui lòng xác nhận mật khẩu"
      } else if (registerData.password !== registerData.confirmPassword) {
        errors.confirmPassword = "Mật khẩu không khớp"
      }
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
      console.log('Sending registration data:', {
        email: registerData.email,
        fullName: registerData.fullName,
        phone: registerData.phone,
        address: registerData.address,
        isGoogleSignup,
      })

      // Gọi API đăng ký từ backend thông qua Redux Toolkit
      const response = await register({
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName,
        phone: registerData.phone,
        address: registerData.address,
        googleId: registerData.googleId || undefined,
        googleToken: registerData.googleToken || undefined,
        isGoogleSignup: isGoogleSignup,
      }).unwrap()

      console.log('Registration response:', response)

      // Nếu đăng ký từ Google, chuyển thẳng về trang chủ vì email đã được xác minh
      if (isGoogleSignup) {
        // Lấy token trả về từ API (nếu có)
        const token = localStorage.getItem('googleToken') || registerData.googleToken
        
        if (token) {
          // Lưu token vào localStorage để duy trì đăng nhập
          localStorage.setItem('accessToken', token)
        }
        
        // Chuyển về trang chủ
        router.push('/')
      } else {
        // Đối với đăng ký thông thường, lưu email để sử dụng trong trang xác thực OTP
        localStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            email: registerData.email,
            fullName: registerData.fullName,
          }),
        )

        // Chuyển hướng đến trang xác thực OTP
        router.push("/verify-otp?action=register")
      }
    } catch (err: any) {
      console.error('Registration error details:', {
        error: err,
        status: err?.status,
        data: err?.data,
        message: err?.message,
        stack: err?.stack
      })
      
      // Xử lý các loại lỗi cụ thể
      if (!err) {
        setRegisterError('Đã xảy ra lỗi không xác định')
        return
      }

      if (err.status === 'FETCH_ERROR') {
        setRegisterError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối của bạn.')
      } else if (typeof err.data?.message === 'string') {
        // Hiển thị thông báo lỗi từ server
        setRegisterError(err.data.message)
      } else if (typeof err.error === 'string') {
        // Hiển thị lỗi từ RTK Query
        setRegisterError(err.error)
      } else if (err.message) {
        // Hiển thị message từ Error object
        setRegisterError(err.message)
      } else {
        setRegisterError('Đăng ký thất bại. Vui lòng thử lại sau.')
      }
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
                    <Label htmlFor="register-fullname">Full Name</Label>
                    <Input
                      id="register-fullname"
                      placeholder="John Doe"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      disabled={isGoogleSignup} // Vô hiệu hóa nếu là đăng ký từ Google
                      required
                    />
                    {registerErrors.fullName && <p className="text-sm text-red-600">{registerErrors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      disabled={isGoogleSignup} // Vô hiệu hóa nếu là đăng ký từ Google
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
                    <Label htmlFor="register-address">Address</Label>
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

                  {!isGoogleSignup && (
                    <>
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
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {registerErrors.confirmPassword && (
                          <p className="text-sm text-red-600">{registerErrors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {isGoogleSignup && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        Bạn đang đăng ký tài khoản với Google. Email và họ tên đã được điền sẵn từ tài khoản Google của bạn.
                        Vui lòng cung cấp thêm số điện thoại và địa chỉ để hoàn tất đăng ký.
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                        Đang xử lý...
                      </>
                    ) : 'Tạo tài khoản'}
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
