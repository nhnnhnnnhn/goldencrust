"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ShoppingBag, Users, Award, TrendingUp, Clock, DollarSign, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"
import { getTranslation } from "@/utils/translations"
import { useGetTodayOrdersQuery } from '@/redux/api/order'
import { useGetReservationsByDateRangeQuery, useGetReservationsQuery } from '@/redux/api/reservationApi'
import { useGetUserStatsQuery } from '@/redux/api/userApi'
import { useGetAllDeliveriesQuery } from '@/redux/api/deliveryApi'
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
  { type: "Dine In", count: 124 },
  { type: "Takeaway", count: 87 },
  { type: "Delivery", count: 96 },
]

const timeSlotData = [
  { hour: "11:00", customerCount: 23 },
  { hour: "12:00", customerCount: 45 },
  { hour: "13:00", customerCount: 58 },
  { hour: "14:00", customerCount: 32 },
  { hour: "15:00", customerCount: 21 },
  { hour: "16:00", customerCount: 15 },
  { hour: "17:00", customerCount: 24 },
  { hour: "18:00", customerCount: 47 },
  { hour: "19:00", customerCount: 62 },
  { hour: "20:00", customerCount: 53 },
  { hour: "21:00", customerCount: 31 },
  { hour: "22:00", customerCount: 18 },
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

// Hàm để tạo dữ liệu cho bảng thống kê theo ngày
const getDailyStats = (date: Date) => {
  // Format ngày hiện tại và 6 ngày trước đó (tổng 7 ngày)
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(date);
    d.setDate(date.getDate() - i);
    dates.push(d);
  }
  return dates;
}

// Hàm định dạng ngày để hiển thị
const formatDateDisplay = (date: Date, format: 'short' | 'long' = 'short') => {
  if (format === 'short') {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
  } else {
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }
}

// Hàm lọc đơn đặt hàng theo ngày
const filterOrdersByDate = (orders: any[], date: Date) => {
  if (!orders) return [];
  
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    return orderDate.toISOString().split('T')[0] === dateString;
  });
}

// Hàm lọc giao hàng theo ngày
const filterDeliveriesByDate = (deliveries: any[], date: Date) => {
  if (!deliveries) return [];
  
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return deliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.createdAt);
    return deliveryDate.toISOString().split('T')[0] === dateString;
  });
}

// Hàm lọc đặt bàn theo ngày
const filterReservationsByDate = (reservations: any[], date: Date) => {
  if (!reservations) return [];
  
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return reservations.filter(reservation => {
    const reservationDate = new Date(reservation.createdAt || reservation.reservationDate);
    return reservationDate.toISOString().split('T')[0] === dateString;
  });
}

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [timeRange, setTimeRange] = useState("This Month")
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [dateRange] = useState<Date[]>(getDailyStats(new Date()))

  // Lấy dữ liệu từ các API hiện có
  const { data: userStatsData, isLoading: isLoadingUserStats } = useGetUserStatsQuery()
  const { data: ordersData, isLoading: isLoadingOrders } = useGetTodayOrdersQuery()
  
  // Lấy tất cả đặt bàn và đặt bàn trong khoảng thời gian
  const { data: allReservations, isLoading: isLoadingAllReservations } = useGetReservationsQuery()
  
  // Lấy đặt bàn trong khoảng thời gian cụ thể
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  
  const startDate = format(sevenDaysAgo, "yyyy-MM-dd")
  const endDate = format(today, "yyyy-MM-dd")
  
  const { data: reservationsData, isLoading: isLoadingReservations } = useGetReservationsByDateRangeQuery({
    startDate,
    endDate
  })
  
  // Lấy tất cả giao hàng
  const { data: deliveriesData, isLoading: isLoadingDeliveries } = useGetAllDeliveriesQuery()
  
  // Dữ liệu mẫu cho thống kê doanh thu theo tháng và danh mục sẵn có
  // Tránh xung đột với biến mẫu toàn cục ở đầu file
  const sampleMonthlyRevenueData = revenueData
  const sampleCategoryRevenueData = categoryData.map(item => ({
    name: item.name,
    revenue: item.value * 100000,
    percentage: item.value
  }))
  
  // Tổng hợp trạng thái loading từ tất cả các API
  const isLoading = isLoadingOrders || isLoadingReservations || isLoadingDeliveries || isLoadingUserStats || isLoadingAllReservations
  
  // Tính toán thống kê từ dữ liệu API hiện có
  
  // 1. Tính tổng doanh thu trong ngày từ đơn hàng
  const todayRevenue = ordersData?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0
  
  // 2. Tính tổng số đơn hàng trong ngày
  const totalOrders = ordersData?.length || 0
  
  // 3. Tính trung bình số khách hàng mỗi ngày (dựa vào tổng số người dùng hoạt động và số món trung bình mỗi đơn hàng)
  const avgCustomersPerDay = userStatsData?.activeUsers ? Math.round(userStatsData.activeUsers / 30) : 0
  
  // 4. Tính tăng trưởng: So sánh với các tháng trước (giả lập một tỷ lệ tăng trưởng dựa trên số người dùng mới trong tháng)
  const growthRate = userStatsData?.newUsersThisMonth ? (userStatsData.newUsersThisMonth / userStatsData.totalUsers) * 100 : 0
  
  // Định nghĩa kiểu dữ liệu cho các thống kê
  interface OrderTypeStats {
    _id: string;
    type: string;
    count: number;
  }

  interface TimeSlotStats {
    _id: string;
    timeSlot: string;
    count: number;
  }

  // 5. Thống kê đơn hàng theo loại (Dine-in, Takeaway)
  const orderTypeStats: OrderTypeStats[] = []
  if (ordersData && ordersData.length > 0) {
    // Khởi tạo map để đếm số lượng đơn hàng theo loại
    const ordersByType = {} as Record<string, number>
    
    ordersData.forEach(order => {
      const type = order.orderType || 'Unknown'
      if (!ordersByType[type]) ordersByType[type] = 0
      ordersByType[type]++
    })
    
    // Chuyển đổi thành mảng để hiển thị trên biểu đồ
    Object.entries(ordersByType).forEach(([type, count]) => {
      orderTypeStats.push({
        _id: type,
        type: type,
        count: count
      })
    })
  }
  
  // 6. Tính phân bố khách hàng theo khung giờ từ dữ liệu đơn hàng
  const timeSlotStats = [] as { timeSlot: string, count: number }[]
  if (ordersData && ordersData.length > 0) {
    // Phân loại đơn hàng theo khung giờ (sáng, trưa, chiều, tối)
    const timeSlots = {
      'morning': 0,   // 6h-11h
      'noon': 0,      // 11h-14h
      'afternoon': 0, // 14h-18h
      'evening': 0    // 18h-22h
    }
    
    ordersData.forEach(order => {
      if (!order.orderDate) return
      
      const hour = new Date(order.orderDate).getHours()
      if (hour >= 6 && hour < 11) timeSlots['morning']++
      else if (hour >= 11 && hour < 14) timeSlots['noon']++
      else if (hour >= 14 && hour < 18) timeSlots['afternoon']++
      else if (hour >= 18 && hour < 23) timeSlots['evening']++
    })
    
    // Chuyển đổi thành mảng
    Object.entries(timeSlots).forEach(([slot, count]) => {
      timeSlotStats.push({ timeSlot: slot, count })
    })
  }

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
  
  // Tính số liệu từ dữ liệu API
  const totalCustomers = userStatsData?.totalUsers || 0
  const reservationsToday = reservationsData?.filter(r => {
    const reservationDate = new Date(r.createdAt || r.reservationDate);
    const todayString = new Date().toISOString().split('T')[0];
    return reservationDate.toISOString().split('T')[0] === todayString;
  })?.length || 0
  
  const ordersToday = ordersData?.length || 0
  const dailyRevenue = ordersData?.reduce((sum: number, order: any) => sum + order.totalAmount, 0) || 0
  
  // Tính số lượng giao hàng trong ngày
  const deliveriesToday = deliveriesData?.filter(d => {
    const deliveryDate = new Date(d.createdAt);
    const todayString = new Date().toISOString().split('T')[0];
    return deliveryDate.toISOString().split('T')[0] === todayString;
  })?.length || 0
  
  // Tạo dữ liệu thống kê theo ngày cho 7 ngày gần nhất
  const dailyRevenueStats = dateRange.map(date => {
    const ordersOnDate = filterOrdersByDate(ordersData || [], date);
    const revenueOnDate = ordersOnDate.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    return {
      date: date,
      dateFormatted: formatDateDisplay(date),
      revenue: revenueOnDate,
      ordersCount: ordersOnDate.length
    };
  });
  
  const dailyCustomerStats = dateRange.map(date => {
    const ordersOnDate = filterOrdersByDate(ordersData || [], date);
    // Đếm số lượng userId riêng biệt
    const uniqueUsers = new Set(ordersOnDate.map((order: any) => order.userId));
    return {
      date: date,
      dateFormatted: formatDateDisplay(date),
      customerCount: uniqueUsers.size
    };
  });
  
  const dailyDeliveryStats = dateRange.map(date => {
    const deliveriesOnDate = filterDeliveriesByDate(deliveriesData || [], date);
    // Phân tách đơn hàng theo trạng thái giao hàng
    const completedDeliveries = deliveriesOnDate.filter((delivery: any) => delivery.status === 'delivered');
    const inProgressDeliveries = deliveriesOnDate.filter((delivery: any) => ['pending', 'processing', 'on-the-way'].includes(delivery.status));
    
    return {
      date: date,
      dateFormatted: formatDateDisplay(date),
      deliveryCount: completedDeliveries.length,
      inProgressCount: inProgressDeliveries.length
    };
  });
  
  const dailyReservationStats = dateRange.map(date => {
    const reservationsOnDate = filterReservationsByDate(reservationsData || [], date);
    return {
      date: date,
      dateFormatted: formatDateDisplay(date),
      reservationCount: reservationsOnDate.length
    };
  });
  
  // Sử dụng dữ liệu đã tính toán từ các API hiện có
  const finalRevenueData = sampleMonthlyRevenueData || [] // Vẫn giữ lại dữ liệu mẫu cho biểu đồ doanh thu theo tháng
  const finalCategoryData = sampleCategoryRevenueData || [] // Vẫn giữ lại dữ liệu mẫu cho biểu đồ doanh thu theo danh mục
  const finalOrderTypeData = orderTypeStats || orderTypeData || []
  const finalTimeSlotData = timeSlotStats || timeSlotData || []
  
  // Sử dụng dữ liệu thực từ API cho các thống kê tổng quan
  // Sử dụng todayRevenue đã tính trước đó từ ordersData
  const previousMonthRevenue = todayRevenue * 0.8 // Ước tính doanh thu tháng trước thấp hơn 20%
  const revenueGrowthPercentage = growthRate || 0
  
  // Đã tính sẵn totalOrders từ dữ liệu ordersData
  // Sử dụng giá trị mặc định cho thống kê trước đó
  const previousTotalOrders = Math.round(totalOrders * 0.9) // Ước tính số đơn hàng tháng trước thấp hơn 10%
  
  // Số khách hàng trung bình mỗi ngày - sử dụng avgCustomersPerDay đã tính trước đó dựa trên userStats
  const averageCustomersPerDay = avgCustomersPerDay || 
    (finalTimeSlotData?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) / (finalTimeSlotData?.length || 1)) || 0
  
  // Ước tính số khách hàng trung bình tháng trước dựa trên số hiện tại
  const previousAverageCustomersPerDay = Math.round(averageCustomersPerDay * 0.85) // Giả sử tháng trước thấp hơn 15%
  const customerGrowthPercentage = averageCustomersPerDay && previousAverageCustomersPerDay ? 
    Math.round(((averageCustomersPerDay - previousAverageCustomersPerDay) / previousAverageCustomersPerDay) * 100) : 0
  
  // Tạm thởi sử dụng dailyRevenue cho dailyTotalRevenue
  const dailyTotalRevenue = dailyRevenue
  
  // Tạm thởi sử dụng ordersToday cho dailyTotalOrders
  const dailyTotalOrders = ordersToday

  // Dữ liệu thống kê từ API
  const stats = isAdmin
    ? [
        {
          label: t.dashboard.totalCustomers,
          value: isLoadingUserStats 
            ? <span className="text-gray-400">Loading...</span>
            : totalCustomers.toLocaleString(),
          icon: <Users className="h-5 w-5" />,
          color: "bg-blue-100 text-blue-800",
        },
        {
          label: t.dashboard.reservationsToday,
          value: isLoadingReservations
            ? <span className="text-gray-400">Loading...</span>
            : reservationsToday.toString(),
          icon: <Calendar className="h-5 w-5" />,
          color: "bg-green-100 text-green-800",
        },
        {
          label: t.dashboard.ordersToday,
          value: isLoadingOrders
            ? <span className="text-gray-400">Loading...</span>
            : ordersToday.toString(),
          icon: <ShoppingBag className="h-5 w-5" />,
          color: "bg-purple-100 text-purple-800",
        },
        {
          label: t.dashboard.revenueToday,
          value: isLoadingOrders
            ? <span className="text-gray-400">Loading...</span>
            : formatPrice(dailyRevenue),
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
                      {isLoading ? (
                        <>
                          <p className="mt-2 text-3xl font-semibold">---</p>
                          <p className="mt-2 text-xs text-gray-400">Đang tải dữ liệu...</p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-3xl font-semibold">{formatPrice(todayRevenue)}</p>
                          <p className="mt-2 text-xs text-gray-400">Tăng {revenueGrowthPercentage.toFixed(1)}% so với tháng trước</p>
                        </>
                      )}
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
                      {isLoading ? (
                        <>
                          <p className="mt-2 text-3xl font-semibold">---</p>
                          <p className="mt-2 text-xs text-gray-400">Đang tải dữ liệu...</p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-3xl font-semibold">{totalOrders}</p>
                          <p className="mt-2 text-xs text-gray-400">{previousTotalOrders > 0 ? (
                            `Tăng ${((totalOrders - previousTotalOrders) / previousTotalOrders * 100).toFixed(1)}% so với tháng trước`
                          ) : `Tăng ${customerGrowthPercentage.toFixed(1)}% so với tháng trước`}</p>
                        </>
                      )}
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
                      {isLoading ? (
                        <>
                          <p className="mt-2 text-3xl font-semibold">---</p>
                          <p className="mt-2 text-xs text-gray-400">Đang tải dữ liệu...</p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-3xl font-semibold">{Math.round(averageCustomersPerDay)}</p>
                          <p className="mt-2 text-xs text-gray-400">Tăng {previousAverageCustomersPerDay > 0 ? 
                              ((averageCustomersPerDay - previousAverageCustomersPerDay) / previousAverageCustomersPerDay * 100).toFixed(1) : 
                              customerGrowthPercentage.toFixed(1)}% so với tháng trước</p>
                        </>
                      )}
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
                      {isLoading ? (
                        <>
                          <p className="mt-2 text-3xl font-semibold">---</p>
                          <p className="mt-2 text-xs text-gray-400">Đang tải dữ liệu...</p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-3xl font-semibold">+{revenueGrowthPercentage.toFixed(1)}%</p>
                          <p className="mt-2 text-xs text-gray-400">So với tháng trước: {previousMonthRevenue > 0 ? 
                            ((todayRevenue / previousMonthRevenue - 1) * 100).toFixed(1) : 
                            0}%</p>
                        </>
                      )}
                    </div>
                    <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* 4 biểu đồ theo yêu cầu */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Doanh thu hàng ngày</CardTitle>
                  <CardDescription>7 ngày gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center items-center h-72">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyRevenueStats} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4361EE" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4361EE" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis 
                            dataKey="dateFormatted" 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tickFormatter={(value) => `${value/1000}K`}
                            dx={-10}
                          />
                          <Tooltip 
                            formatter={(value) => [formatPrice(value as number), 'Doanh thu']}
                            contentStyle={{ 
                              backgroundColor: "#f8f9fa", 
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            strokeWidth={2} 
                            stroke="#4361EE" 
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Lượng khách hàng</CardTitle>
                  <CardDescription>7 ngày gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center items-center h-72">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyCustomerStats} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <defs>
                            <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis 
                            dataKey="dateFormatted" 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            dx={-10}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} khách`, 'Số lượng']}
                            contentStyle={{ 
                              backgroundColor: "#f8f9fa", 
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                            }}
                          />
                          <Bar 
                            dataKey="customerCount" 
                            name="Số khách"
                            fill="url(#colorCustomers)" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
              
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Giao hàng theo ngày</CardTitle>
                  <CardDescription>7 ngày gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDeliveries ? (
                    <div className="flex justify-center items-center h-72">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyDeliveryStats} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis 
                            dataKey="dateFormatted" 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            dx={-10}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}`, 'Số lượng']}
                            contentStyle={{ 
                              backgroundColor: "#f8f9fa", 
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="deliveryCount" 
                            name="Giao hàng"
                            stackId="a"
                            fill="#8884d8" 
                            radius={[4, 4, 0, 0]}
                          />
                          {/* Thêm dữ liệu mẫu cho stacked bar */}
                          {/* Thêm trường mới vào dailyDeliveryStats để hiển thị đơn đang giao */}
                          <Bar 
                            dataKey="inProgressCount" 
                            name="Đang giao"
                            stackId="a"
                            fill="#82ca9d" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Đặt bàn hàng ngày</CardTitle>
                  <CardDescription>7 ngày gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingReservations ? (
                    <div className="flex justify-center items-center h-72">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyReservationStats} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <defs>
                            <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis 
                            dataKey="dateFormatted" 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            dx={-10}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} đặt bàn`, 'Số lượng']}
                            contentStyle={{ 
                              backgroundColor: "#f8f9fa", 
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                            }}
                          />
                          <Bar 
                            dataKey="reservationCount" 
                            name="Đặt bàn"
                            fill="url(#colorReservations)" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
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
                      <p className="mt-1 text-3xl font-semibold">{formatPrice(dailyRevenue)}</p>
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
                      <p className="mt-1 text-3xl font-semibold">{ordersToday}</p>
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
                      <p className="mt-1 text-3xl font-semibold">{formatPrice(ordersToday > 0 ? dailyRevenue / ordersToday : 0)}</p>
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
