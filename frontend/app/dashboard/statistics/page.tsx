"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Area,
} from "recharts"
import { DollarSign, TrendingUp, Users, ShoppingBag, Filter, ChevronDown, Calendar } from "lucide-react"
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

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

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("This Month")
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Format giá tiền
  const formatPrice = (value) => {
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

  return (
    <div className="p-6">
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
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="mt-1 text-3xl font-semibold">{formatPrice(totalRevenue)}</p>
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
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="mt-1 text-3xl font-semibold">{totalOrders}</p>
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
                    <p className="text-sm font-medium text-gray-500">Avg. Customers/Day</p>
                    <p className="mt-1 text-3xl font-semibold">{Math.round(averageCustomersPerDay)}</p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-2 text-purple-800">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Growth Rate</p>
                    <p className="mt-1 text-3xl font-semibold">+15.2%</p>
                  </div>
                  <div className="rounded-full bg-amber-100 p-2 text-amber-800">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ doanh thu theo tháng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trends over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value) => formatPrice(value)} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ doanh thu theo ngày và phân loại sản phẩm */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue by day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyRevenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip formatter={(value) => formatPrice(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#00C49F" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Percentage of sales by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ loại đơn hàng và khách hàng theo khung giờ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders by Type</CardTitle>
                <CardDescription>Distribution of orders by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orderTypeData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Orders" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Traffic by Time</CardTitle>
                <CardDescription>Number of customers by time slot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeSlotData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="customers" name="Customers" fill="#8884D8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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

          {/* Biểu đồ số lượng đơn hàng theo giờ và top món ăn bán chạy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Orders</CardTitle>
                <CardDescription>Number of orders by hour for {format(date, "dd/MM/yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
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
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Orders" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Best selling items for {format(date, "dd/MM/yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyItemsData}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "revenue" ? formatPrice(value) : value,
                          name === "revenue" ? "Revenue" : "Quantity",
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="quantity" name="Quantity" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biểu đồ phương thức thanh toán và bảng chi tiết đơn hàng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods for {format(date, "dd/MM/yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Item</CardTitle>
                <CardDescription>Revenue contribution by item for {format(date, "dd/MM/yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyItemsData}
                      layout="vertical"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `${value / 1000000}M`} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => formatPrice(value)} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
