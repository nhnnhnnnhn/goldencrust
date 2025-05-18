"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ChevronLeft, Eye, EyeOff, Info } from "lucide-react"
import { GoogleLoginButton } from "@/components/auth/google-login-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTranslation } from "@/utils/translations"
import { useLoginMutation } from "@/redux/api/authApi"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { clearError } from "@/redux/slices/authSlice"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const { login: contextLogin } = useAuth() // Keep auth context for now as we transition
  const [login, { isLoading }] = useLoginMutation()
  const { error } = useAppSelector((state: any) => state.auth || {})
  const dispatch = useAppDispatch()
  
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Get language from localStorage and clear any previous auth errors on page load
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])
  
  // Clear any errors on component mount
  useEffect(() => {
    // Reset any previous auth errors from Redux store when the page loads
    setLoginError(null)
    if (error) {
      dispatch(clearError())
    }
  }, [dispatch])

  const t = getTranslation(language)

const handleGoogleLogin = () => {
  try {
    setIsGoogleLoading(true);
    // Lưu URL redirect sau khi đăng nhập thành công (nếu có)
    const redirect = searchParams.get("redirect") || "/";
    localStorage.setItem("redirectAfterLogin", redirect);
    
    // Chuyển hướng đến endpoint backend xử lý OAuth Google
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${backendUrl}/auth/google`;
  } catch (error) {
    setIsGoogleLoading(false);
    console.error('Failed to redirect to Google login:', error);
    setLoginError(t.auth.googleLoginError);
  }
};

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    
    try {
      // Kiểm tra các trường nhập liệu
      if (!loginData.email || !loginData.password) {
        setLoginError(t.auth.loginError)
        return
      }

      // Gọi API login qua Redux
      const result = await login({
        email: loginData.email,
        password: loginData.password
      }).unwrap()
      
      // Store the token in localStorage
      if (result.token) {
        localStorage.setItem('token', result.token)
      }
      
      // Cập nhật login qua context cho các phần cũ
      if (contextLogin) {
        contextLogin(
          result.user.fullName,
          result.user.email,
          result.user.role,
          result.user.loyaltyPoints || 0,
          result.user.joinDate || new Date().toISOString()
        )
      }
      
      // Tự động chuyển hướng người dùng sau khi đăng nhập
      router.push(redirect)
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Handle different types of errors
      if (err.status === 'FETCH_ERROR') {
        setLoginError('Cannot connect to server. Please check your internet connection.')
      } else if (err.data?.message) {
        // If we have a specific error message from the server
        setLoginError(err.data.message)
      } else if (err.status === 401) {
        // Unauthorized - wrong credentials
        setLoginError('Invalid email or password. Please try again.')
      } else if (err.status === 403) {
        // Forbidden - account issues
        setLoginError('Your account is suspended or not activated. Please contact support.')
      } else if (err.status >= 500) {
        // Server errors
        setLoginError('Server error. Please try again later.')
      } else {
        // Fallback error message
        setLoginError('Login failed. Please check your credentials and try again.')
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
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              {/* Hiển thị lỗi đăng nhập nếu có */}
              {(loginError || error) && (
                <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
                  <AlertDescription>
                    {loginError || error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.auth.email}</Label>
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
                      <Label htmlFor="password">{t.auth.password}</Label>
                      <Link href="/forgot-password" className="text-xs text-blue-900 hover:underline">
                        {t.auth.forgotPassword}
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

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-900 text-white rounded-md py-2 hover:bg-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                        {t.auth.loggingIn}
                      </>
                    ) : t.auth.login}
                  </Button>
                  
                  <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
                    <p className="mx-4 mb-0 text-center text-sm text-gray-500">{t.auth.or}</p>
                  </div>
                  
                  <GoogleLoginButton 
                    onClick={handleGoogleLogin} 
                    isLoading={isGoogleLoading} 
                    className="mt-1"
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              {t.auth.dontHaveAccount}{" "}
              <Link href="/register" className="text-blue-900 hover:underline">
                {t.auth.registerHere}
              </Link>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              {t.auth.bySigningIn}{" "}
              <Link href="#" className="text-blue-900 hover:underline">
                {t.auth.termsOfService}
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-900 hover:underline">
                {t.auth.privacyPolicy}
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
