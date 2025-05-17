"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useAppDispatch } from "@/redux/hooks"
import { setCredentials } from "@/redux/slices/authSlice"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sử dụng state để theo dõi đã xử lý params hay chưa
  const [hasProcessedAuth, setHasProcessedAuth] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { login: contextLogin } = useAuth()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Nếu đã xử lý params thì không thực hiện lại
    if (hasProcessedAuth) return
    
    // Kiểm tra xem có thông tin đăng nhập từ Google OAuth không
    const authSuccess = searchParams.get("auth_success")
    
    if (authSuccess === "true") {
      setHasProcessedAuth(true) // Đánh dấu đã xử lý
      const token = searchParams.get("token")
      const email = searchParams.get("email")
      const fullName = searchParams.get("fullName") 
      const role = searchParams.get("role")
      
      if (token && email && fullName && role) {
        // Lưu vào local storage tạm thời để tránh lỗi hydration
        if (typeof window !== 'undefined') {
          const userData = { token, email, fullName, role }
          sessionStorage.setItem('googleAuthData', JSON.stringify(userData))
          
          // Xóa params khỏi URL
          window.history.replaceState({}, "", window.location.pathname)
          
          // Sử dụng setTimeout để tránh vòng lặp render
          setTimeout(() => {
            // Lưu thông tin đăng nhập vào Redux
            dispatch(
              setCredentials({
                token,
                user: {
                  id: email,
                  email,
                  fullName,
                  role,
                },
              })
            )
            
            // Cập nhật auth context cho phần cũ
            if (contextLogin) {
              contextLogin(
                fullName,
                email,
                role,
                0, // loyaltyPoints (có thể cập nhật sau)
                new Date().toISOString() // joinDate
              )
            }
            
            // Thông báo thành công
            toast({
              title: "Đăng nhập thành công",
              description: `Xin chào, ${fullName}!`,
            })
            
            // Chuyển hướng về dashboard hoặc trang chủ
            const redirect = localStorage.getItem("redirectAfterLogin") || "/dashboard"
            localStorage.removeItem("redirectAfterLogin")
            router.push(redirect)
          }, 0)
        }
      }
    }
    
    // Xử lý lỗi đăng nhập Google (nếu có)
    const error = searchParams.get("error")
    if (error === "google_auth_failed" || error === "missing_auth_info") {
      setHasProcessedAuth(true) // Đánh dấu đã xử lý
      if (typeof window !== 'undefined') {
        // Xóa tham số lỗi khỏi URL
        window.history.replaceState({}, "", window.location.pathname)
        
        setTimeout(() => {
          toast({
            title: "Lỗi đăng nhập",
            description: "Không thể đăng nhập bằng Google. Vui lòng thử lại sau.",
            variant: "destructive",
          })
        }, 0)
      }
    }
  }, [searchParams, hasProcessedAuth])
  
  // Khôi phục session nếu refresh trang
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('googleAuthData')
      if (savedAuth && !hasProcessedAuth) {
        try {
          const { token, email, fullName, role } = JSON.parse(savedAuth)
          dispatch(
            setCredentials({
              token,
              user: {
                id: email,
                email,
                fullName,
                role,
              },
            })
          )
          
          if (contextLogin) {
            contextLogin(fullName, email, role, 0, new Date().toISOString())
          }
          
          // Xóa dữ liệu sau khi đã sử dụng
          sessionStorage.removeItem('googleAuthData')
        } catch (error) {
          console.error('Failed to restore auth session:', error)
          sessionStorage.removeItem('googleAuthData')
        }
      }
    }
  }, [])

  return <>{children}</>
}
