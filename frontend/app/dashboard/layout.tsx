"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
  Home,
  User,
  Calendar,
  ShoppingBag,
  Clock,
  Award,
  Users,
  Settings,
  MenuIcon,
  Truck,
  LogOut,
  BarChart2,
  CreditCard,
  LayoutList,
  ChevronDown,
} from "lucide-react"
import { getTranslation } from "@/utils/translations"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    // Get language from localStorage
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  console.log('Layout user data:', user)
  const isAdmin = user.role === "admin"
  const t = getTranslation(language)

  const userNavItems = [
    { href: "/dashboard", label: t.dashboard.dashboard, icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/profile", label: t.dashboard.profile, icon: <User className="h-5 w-5" /> },
    { href: "/dashboard/reservations", label: t.dashboard.myReservations, icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/orders", label: t.dashboard.myOrders, icon: <ShoppingBag className="h-5 w-5" /> },
    { href: "/dashboard/my-delivery", label: t.dashboard.myDelivery, icon: <Truck className="h-5 w-5" /> },
    { href: "/dashboard/history", label: t.dashboard.orderHistory, icon: <Clock className="h-5 w-5" /> },
    { href: "/dashboard/loyalty", label: t.dashboard.loyaltyProgram, icon: <Award className="h-5 w-5" /> },
  ]

  const adminNavItems = [
    { href: "/dashboard", label: t.dashboard.dashboard, icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/profile", label: t.dashboard.profile, icon: <User className="h-5 w-5" /> },
    { href: "/dashboard/customers", label: t.dashboard.customers, icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/categories", label: t.dashboard.categories, icon: <LayoutList className="h-5 w-5" /> },
    { href: "/dashboard/menu-management", label: t.dashboard.menu, icon: <MenuIcon className="h-5 w-5" /> },
    { href: "/dashboard/reservations", label: t.dashboard.reservations, icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/delivery", label: t.dashboard.delivery, icon: <Truck className="h-5 w-5" /> },
    { href: "/dashboard/table-management", label: t.dashboard.table, icon: <Settings className="h-5 w-5" /> },
    { href: "/dashboard/payment", label: t.dashboard.payment, icon: <CreditCard className="h-5 w-5" /> },
    { href: "/dashboard/settings", label: t.dashboard.settings, icon: <Settings className="h-5 w-5" /> },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Link href="/" className="text-xl font-light uppercase tracking-wider text-blue-900">
            GOLDEN CRUST
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-md px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="pt-4">
            <button
              onClick={() => {
                logout()
                router.push("/")
              }}
              className="flex w-full items-center rounded-md px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">{t.navigation.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-700">
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-1 justify-end">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">
                {user.fullName || user.name} ({isAdmin ? t.dashboard.adminRole : t.dashboard.userRole})
              </span>
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-blue-900 hover:bg-blue-200"
                >
                  <span className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-900 text-white">
                    {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={() => {
                        logout()
                        router.push("/")
                        setIsProfileOpen(false)
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.navigation.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}