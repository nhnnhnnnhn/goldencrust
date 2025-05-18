"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  user: {
    name: string
    fullName: string
    email: string
    role: string
    loyaltyPoints: number
    joinDate: string
  } | null
  isLoading: boolean
  login: (name: string, email: string, role: string, loyaltyPoints: number, joinDate: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{
    name: string
    fullName: string
    email: string
    role: string
    loyaltyPoints: number
    joinDate: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Simulate loading and authentication check
      setTimeout(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          // Ensure both name and fullName are set
          setUser({
            ...parsedUser,
            name: parsedUser.name || parsedUser.fullName,
            fullName: parsedUser.fullName || parsedUser.name
          })
        }
        setIsLoading(false)
      }, 500)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (name: string, email: string, role: string, loyaltyPoints: number, joinDate: string) => {
    console.log('Login called with name:', name) // Debug log
    const newUser = { 
      name: name,
      fullName: name,
      email, 
      role, 
      loyaltyPoints, 
      joinDate 
    }
    console.log('Setting new user:', newUser) // Debug log
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const value: AuthContextType = { user, isLoading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
