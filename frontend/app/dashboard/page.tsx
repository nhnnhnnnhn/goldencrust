"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ShoppingBag, Users, Award, TrendingUp, Clock, DollarSign, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"
import { getTranslation } from "@/utils/translations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

// Dữ liệu mẫu cho thống kê
const revenueData = [
  { name: "Jan", revenue: 12500000 },
  { name: "Feb", revenue: 14200000 },
  { name: "Mar", revenue: 15800000 },
  { name: "Apr", revenue: 16900000 },
  { name: "May", revenue: 18500000 },
  { name: "Jun", revenue: 19200000 },
  { name: "Jul", revenue: 21000000 },
  { name: "Aug", revenue: 22500000 },
  { name: "Sep", revenue: 24000000 },
  { name: "Oct", revenue: 25500000 },
  { name: "Nov", revenue: 27000000 },
  { name: "Dec", revenue: 29500000 },
]

const dailyRevenueData = [
  { name: "Mon", revenue: 3200000 },
  { name: "Tue", revenue: 2800000 },
  { name: "Wed", revenue: 3500000 },
  { name: "Thu", revenue: 4200000 },
  { name: "Fri", revenue: 5100000 },
  { name: "Sat", revenue: 6500000 },
  { name: "Sun", revenue: 5800000 },
]

const categoryData = [
  { name: "Pizza", value: 45 },
  { name: "Pasta", value: 20 },
  { name: "Salad", value: 15 },
  { name: "Dessert", value: 10 },
  { name: "Beverage", value: 10 },
]

// Bảng màu chuyên nghiệp hơn cho các biểu đồ
const COLORS = [
  "#4361ee", "#3a0ca3", "#7209b7", "#f72585", "#4cc9f0", 
  "#4895ef", "#560bad", "#b5179e", "#f15bb5", "#00bbf9"
]

const SOFT_COLORS = [
  "#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500", 
  "#e76f51", "#f4a261", "#2a9d8f", "#264653", "#caffbf"
]

const GRADIENT_COLORS = [
  { start: "#6a11cb", end: "#2575fc" },
  { start: "#fc6076", end: "#ff9a44" },
  { start: "#a8eb12", end: "#00b712" },
  { start: "#f77062", end: "#fe5196" },
  { start: "#00c6fb", end: "#005bea" }
]

const orderTypeData = [
  { name: "Dine-in", orders: 450 },
  { name: "Takeaway", orders: 320 },
  { name: "Delivery", orders: 580 },
]

const timeSlotData = [
  { time: "11:00-13:00", customers: 120 },
  { time: "13:00-15:00", customers: 85 },
  { time: "15:00-17:00", customers: 60 },
  { time: "17:00-19:00", customers: 150 },
  { time: "19:00-21:00", customers: 210 },
  { time: "21:00-23:00", customers: 180 },
]

// Dữ liệu mẫu cho thống kê theo giờ trong ngày
const hourlyData = [
  { hour: "06:00", revenue: 250000, orders: 5 },
  { hour: "07:00", revenue: 420000, orders: 8 },
  { hour: "08:00", revenue: 680000, orders: 12 },
  { hour: "09:00", revenue: 850000, orders: 15 },
  { hour: "10:00", revenue: 1200000, orders: 22 },
  { hour: "11:00", revenue: 1850000, orders: 35 },
  { hour: "12:00", revenue: 2500000, orders: 48 },
  { hour: "13:00", revenue: 2200000, orders: 42 },
  { hour: "14:00", revenue: 1500000, orders: 28 },
  { hour: "15:00", revenue: 980000, orders: 18 },
  { hour: "16:00", revenue: 1100000, orders: 20 },
  { hour: "17:00", revenue: 1650000, orders: 30 },
  { hour: "18:00", revenue: 2300000, orders: 45 },
  { hour: "19:00", revenue: 2800000, orders: 52 },
  { hour: "20:00", revenue: 2600000, orders: 50 },
  { hour: "21:00", revenue: 2100000, orders: 40 },
  { hour: "22:00", revenue: 1400000, orders: 25 },
  { hour: "23:00", revenue: 750000, orders: 15 },
]

// Dữ liệu mẫu cho thống kê theo món ăn trong ngày
const dailyItemsData = [
  { name: "Pizza Margherita", quantity: 42, revenue: 4200000 },
  { name: "Pizza Pepperoni", quantity: 38, revenue: 4180000 },
  { name: "Pasta Carbonara", quantity: 25, revenue: 2250000 },
  { name: "Tiramisu", quantity: 20, revenue: 1400000 },
  { name: "Coca Cola", quantity: 55, revenue: 1100000 },
]

// Dữ liệu mẫu cho phương thức thanh toán trong ngày
const paymentMethodData = [
  { name: "Cash", value: 35 },
  { name: "Credit Card", value: 40 },
  { name: "Mobile Payment", value: 25 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [timeRange, setTimeRange] = useState("This Month")
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    // Get language from localStorage
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)
  
  // Format giá tiền
  const formatPrice = (value: any) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  // Tính tổng doanh thu
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)

  // Tính tổng số đơn hàng
  const totalOrders = orderTypeData.reduce((sum, item) => sum + item.orders, 0)

  // Tính số khách hàng trung bình mỗi ngày
  const averageCustomersPerDay = timeSlotData.reduce((sum, item) => sum + item.customers, 0) / timeSlotData.length

  // Tính tổng doanh thu trong ngày
  const dailyTotalRevenue = hourlyData.reduce((sum, item) => sum + item.revenue, 0)

  // Tính tổng số đơn hàng trong ngày
  const dailyTotalOrders = hourlyData.reduce((sum, item) => sum + item.orders, 0)

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

      {/* Thống kê */}
      <div className="grid gap-6 mb-8">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Statistics</h1>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(date, "dd/MM/yyyy")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate || new Date())
                      setIsCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <button
                  onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <Filter size={20} />
                  <span>Time Range: {timeRange}</span>
                  <ChevronDown size={16} />
                </button>

                {showTimeRangeDropdown && (
                  <div className="absolute z-10 mt-1 right-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                    {["Today", "Yesterday", "This Week", "This Month", "This Year", "All Time"].map((range) => (
                      <div
                        key={range}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTimeRange(range)
                          setShowTimeRangeDropdown(false)
                        }}
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <TabsContent value="overview">
            {/* Thẻ thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                      <p className="mt-2 text-3xl font-semibold">{formatPrice(totalRevenue)}</p>
                      <p className="mt-2 text-xs text-gray-400">Tăng 8.2% so với tháng trước</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                      <p className="mt-2 text-3xl font-semibold">{totalOrders}</p>
                      <p className="mt-2 text-xs text-gray-400">Tăng 12.5% so với tháng trước</p>
                    </div>
                    <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Khách hàng/Ngày</p>
                      <p className="mt-2 text-3xl font-semibold">{Math.round(averageCustomersPerDay)}</p>
                      <p className="mt-2 text-xs text-gray-400">Tăng 5.7% so với tháng trước</p>
                    </div>
                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tốc độ tăng trưởng</p>
                      <p className="mt-2 text-3xl font-semibold">+15.2%</p>
                      <p className="mt-2 text-xs text-gray-400">Tăng 2.1% so với tháng trước</p>
                    </div>
                    <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Biểu đồ doanh thu theo tháng */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
                  <CardDescription>Xu hướng doanh thu trong năm qua</CardDescription>
                </CardHeader>
                <div className="w-full h-[320px] pl-2 pt-4 pb-6 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      barGap={2}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${value/1000000}M`} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        width={40}
                      />
                      <Tooltip
                        formatter={(value) => formatPrice(value as number)}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          border: "none",
                          fontSize: "12px"
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Doanh thu" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Biểu đồ doanh thu theo ngày và phân loại sản phẩm */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Doanh thu theo ngày</CardTitle>
                  <CardDescription>Doanh thu theo ngày trong tuần</CardDescription>
                </CardHeader>
                <div className="w-full h-[280px] pl-2 pt-4 pb-6 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyRevenueData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${value/1000000}M`} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        width={40}
                      />
                      <Tooltip
                        formatter={(value) => formatPrice(value as number)}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          border: "none",
                          fontSize: "12px"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Doanh thu" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                        activeDot={{ r: 5, strokeWidth: 2, fill: "white" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Doanh thu theo danh mục</CardTitle>
                  <CardDescription>Phân bổ doanh thu theo loại sản phẩm</CardDescription>
                </CardHeader>
                <div className="w-full h-[280px] pl-2 pt-4 pb-6 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#eee', strokeWidth: 1 }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(var(--primary) / ${0.9 - (index * 0.2)})`}
                            stroke="white"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `${value}%`}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          border: "none",
                          fontSize: "12px"
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Biểu đồ loại đơn hàng và khách hàng theo khung giờ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Đơn hàng theo loại hình</CardTitle>
                  <CardDescription>Phân bố đơn hàng theo hình thức phục vụ</CardDescription>
                </CardHeader>
                <div className="w-full h-[280px] pl-2 pt-4 pb-6 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orderTypeData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      barGap={2}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          border: "none",
                          fontSize: "12px"
                        }}
                      />
                      <Legend
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                      />
                      {orderTypeData.map((entry, index) => (
                        <Bar 
                          key={`bar-${index}`}
                          dataKey="orders" 
                          name={entry.name} 
                          radius={[4, 4, 0, 0]}
                          fill={`hsl(var(--primary) / ${0.9 - (index * 0.3)})`}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Lượng khách theo giờ</CardTitle>
                  <CardDescription>Số lượng khách hàng theo khung giờ</CardDescription>
                </CardHeader>
                <div className="w-full h-[280px] pl-2 pt-4 pb-6 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={timeSlotData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          border: "none",
                          fontSize: "12px"
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        name="Khách hàng" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={0.2}
                        fill="hsl(var(--primary))" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            {/* Thẻ thống kê theo ngày */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Daily Revenue</p>
                      <p className="mt-1 text-3xl font-semibold">{formatPrice(dailyTotalRevenue)}</p>
                    </div>
                    <div className="rounded-full bg-green-100 p-2 text-green-800">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Daily Orders</p>
                      <p className="mt-1 text-3xl font-semibold">{dailyTotalOrders}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-2 text-blue-800">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                      <p className="mt-1 text-3xl font-semibold">{formatPrice(dailyTotalRevenue / dailyTotalOrders)}</p>
                    </div>
                    <div className="rounded-full bg-purple-100 p-2 text-purple-800">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Peak Hour</p>
                      <p className="mt-1 text-3xl font-semibold">19:00</p>
                    </div>
                    <div className="rounded-full bg-amber-100 p-2 text-amber-800">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Biểu đồ doanh thu theo giờ trong ngày */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Revenue</CardTitle>
                  <CardDescription>Revenue by hour for {format(date, "dd/MM/yyyy")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={hourlyData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                        <Tooltip formatter={(value) => formatPrice(value)} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#0088FE"
                          fill="#0088FE"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
