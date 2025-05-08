"use client"

import type React from "react"

import { useEffect } from "react"
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
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

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

  const isAdmin = user.role === "admin"

  const userNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
    { href: "/dashboard/reservations", label: "My Reservations", icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/orders", label: "My Orders", icon: <ShoppingBag className="h-5 w-5" /> },
    { href: "/dashboard/history", label: "History", icon: <Clock className="h-5 w-5" /> },
    { href: "/dashboard/loyalty", label: "Loyalty Program", icon: <Award className="h-5 w-5" /> },
  ]

  const adminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/customers", label: "Customers", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/menu-management", label: "Menu", icon: <MenuIcon className="h-5 w-5" /> },
    { href: "/dashboard/reservations", label: "Reservations", icon: <Calendar className="h-5 w-5" /> },
    { href: "/dashboard/delivery", label: "Delivery", icon: <Truck className="h-5 w-5" /> },
    { href: "/dashboard/statistics", label: "Statistics", icon: <BarChart2 className="h-5 w-5" /> },
    { href: "/dashboard/table-management", label: "Table", icon: <Settings className="h-5 w-5" /> },
    { href: "/dashboard/payment", label: "Payment", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <Link href="/" className="text-xl font-light uppercase tracking-wider text-blue-900">
            PIZZA LIÊM KHIẾT&apos;S
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
              <span className="ml-3">Logout</span>
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
                {user.name} ({isAdmin ? "Admin" : "User"})
              </span>
              <div className="relative">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                  {user.name.charAt(0).toUpperCase()}
                </button>
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
