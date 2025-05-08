"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ShoppingBag, Users, Award, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { getTranslation } from "@/utils/translations"

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [language, setLanguage] = useState<"en" | "vi">("en")

  useEffect(() => {
    // Get language from localStorage
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)

  // Mock data for demonstration
  const stats = isAdmin
    ? [
        {
          label: t.dashboard.totalCustomers,
          value: "1,248",
          icon: <Users className="h-5 w-5" />,
          color: "bg-blue-100 text-blue-800",
        },
        {
          label: t.dashboard.reservationsToday,
          value: "32",
          icon: <Calendar className="h-5 w-5" />,
          color: "bg-green-100 text-green-800",
        },
        {
          label: t.dashboard.ordersToday,
          value: "64",
          icon: <ShoppingBag className="h-5 w-5" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          label: t.dashboard.revenueToday,
          value: "$3,240",
          icon: <TrendingUp className="h-5 w-5" />,
          color: "bg-amber-100 text-amber-800",
        },
      ]
    : [
        {
          label: t.dashboard.loyaltyPoints,
          value: user?.loyaltyPoints || 0,
          icon: <Award className="h-5 w-5" />,
          color: "bg-blue-100 text-blue-800",
        },
        {
          label: t.dashboard.upcomingReservations,
          value: "2",
          icon: <Calendar className="h-5 w-5" />,
          color: "bg-green-100 text-green-800",
        },
        {
          label: t.dashboard.recentOrders,
          value: "3",
          icon: <ShoppingBag className="h-5 w-5" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          label: t.dashboard.memberSince,
          value: user?.joinDate || "-",
          icon: <Clock className="h-5 w-5" />,
          color: "bg-amber-100 text-amber-800",
        },
      ]

  // Mock recent activities
  const recentActivities = isAdmin
    ? [
        {
          type: "reservation",
          customer: "John Doe",
          time: "2 hours ago",
          action: "Made a reservation for 4 people on Friday at 7:00 PM",
        },
        { type: "order", customer: "Jane Smith", time: "3 hours ago", action: "Placed an order for delivery ($85.50)" },
        { type: "customer", customer: "Mike Johnson", time: "5 hours ago", action: "Created a new account" },
        { type: "menu", customer: "Admin", time: "Yesterday", action: "Updated the menu with 3 new items" },
      ]
    : [
        { type: "reservation", time: "Last week", action: "Reserved a table for 2 on Friday at 8:00 PM" },
        { type: "order", time: "2 weeks ago", action: "Ordered Margherita Elegante and Tiramisu for delivery" },
        { type: "loyalty", time: "3 weeks ago", action: "Earned 50 loyalty points from your order" },
      ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t.dashboard.dashboard}</h1>
        <p className="text-gray-500">
          {t.dashboard.welcomeBack}, {user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-2 ${stat.color}`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>{t.dashboard.frequentlyUsedActions}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isAdmin ? (
              <>
                <Link
                  href="/dashboard/reservations-management"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <Calendar className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.manageReservations}</span>
                </Link>
                <Link
                  href="/dashboard/delivery-management"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <ShoppingBag className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.manageOrders}</span>
                </Link>
                <Link
                  href="/dashboard/menu-management"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <TrendingUp className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.updateMenu}</span>
                </Link>
                <Link
                  href="/dashboard/customers"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <Users className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.viewCustomers}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/reservation"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <Calendar className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.makeReservation}</span>
                </Link>
                <Link
                  href="/delivery"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <ShoppingBag className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.orderFood}</span>
                </Link>
                <Link
                  href="/dashboard/loyalty"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <Award className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.loyaltyRewards}</span>
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50"
                >
                  <Users className="mb-2 h-8 w-8 text-blue-900" />
                  <span>{t.dashboard.updateProfile}</span>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentActivity}</CardTitle>
          <CardDescription>{t.dashboard.latestUpdates}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start space-x-4 rounded-lg border border-gray-100 p-4">
                <div
                  className={`rounded-full p-2 ${
                    activity.type === "reservation"
                      ? "bg-green-100 text-green-800"
                      : activity.type === "order"
                        ? "bg-purple-100 text-purple-800"
                        : activity.type === "customer"
                          ? "bg-blue-100 text-blue-800"
                          : activity.type === "loyalty"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {activity.type === "reservation" ? (
                    <Calendar className="h-5 w-5" />
                  ) : activity.type === "order" ? (
                    <ShoppingBag className="h-5 w-5" />
                  ) : activity.type === "customer" ? (
                    <Users className="h-5 w-5" />
                  ) : activity.type === "loyalty" ? (
                    <Award className="h-5 w-5" />
                  ) : (
                    <TrendingUp className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {isAdmin && activity.customer ? `${activity.customer}` : t.dashboard.you}
                    </p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="mt-1 text-gray-600">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
