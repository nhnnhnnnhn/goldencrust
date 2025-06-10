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

// Định nghĩa giao diện dữ liệu
interface MonthlyRevenueItem {
  name: string;
  revenue: number;
}

interface CategoryRevenueItem {
  name: string;
  revenue: number;
  percentage: number;
}

interface DailyItemData {
  name: string;
  quantity: number;
  revenue: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
}

interface OrderTypeStats {
  _id: string;
  type: string;
  count: number;
}

interface TimeSlotStats {
  _id?: string;
  timeSlot: string;
  count: number;
}

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

// Hàm tính toán thống kê theo loại đơn hàng từ dữ liệu API thực
const calculateOrderTypeStats = (orders: any[]) => {
  console.log('Calculating order type stats from orders:', orders);
  
  if (!orders || orders.length === 0) {
    console.log('No orders data available for order type stats');
    return [
      { type: "Dine In", count: 0 },
      { type: "Takeaway", count: 0 },
      { type: "Delivery", count: 0 },
    ];
  }

  const stats = {
    "Dine In": 0,
    "Takeaway": 0,
    "Delivery": 0
  };

  orders.forEach(order => {
    console.log('Processing order:', order.orderType);
    // Kiểm tra trước khi truy cập thuộc tính để tránh lỗi undefined
    const orderType = order.orderType?.toLowerCase() || '';
    
    if (orderType.includes('dine')) {
      stats["Dine In"] += 1;
    } else if (orderType.includes('takeaway')) {
      stats["Takeaway"] += 1;
    } else if (orderType.includes('delivery')) {
      stats["Delivery"] += 1;
    } else {
      // Nếu không có loại cụ thể, phân loại dựa vào các thuộc tính khác
      if (order.deliveryInfo) {
        stats["Delivery"] += 1;
      } else {
        stats["Takeaway"] += 1; // Mặc định nếu không có loại cụ thể
      }
    }
  });

  const result = Object.keys(stats).map(type => ({
    type,
    count: stats[type as keyof typeof stats]
  }));
  
  console.log('Final order type stats:', result);
  return result;
};

// Hàm tính toán thống kê phân bố khách hàng theo giờ từ dữ liệu thực
const calculateTimeSlotStats = (orders: any[]) => {
  console.log('Calculating time slot stats from orders:', orders);
  
  // Khởi tạo mảng các khung giờ từ 11h sáng đến 22h tối
  const timeSlots = Array.from({ length: 12 }, (_, i) => ({
    timeSlot: `${i + 11}:00`,
    customerCount: 0
  }));
  
  if (!orders || orders.length === 0) {
    console.log('No orders data available for time slot stats');
    return timeSlots;
  }
  
  const uniqueCustomers = new Map();
  let processedOrders = 0;
  
  orders.forEach((order, index) => {
    // Lấy ngày đặt hàng từ order.orderDate hoặc order.createdAt
    const orderDateStr = order.orderDate || order.createdAt;
    
    if (!orderDateStr) {
      console.log(`Order ${index} missing date information`);
      return;
    }
    
    const date = new Date(orderDateStr);
    
    // Kiểm tra ngày hợp lệ
    if (isNaN(date.getTime())) {
      console.log(`Order ${index} has invalid date: ${orderDateStr}`);
      return;
    }
    
    const orderHour = date.getHours();
    
    // Kiểm tra nếu giờ nằm trong khoảng hoạt động
    if (orderHour >= 11 && orderHour <= 22) {
      const slotIndex = orderHour - 11;
      
      // Kiểm tra chỉ số hợp lệ trước khi truy cập vào mảng
      if (slotIndex >= 0 && slotIndex < timeSlots.length) {
        // Lấy ID khách hàng hoặc sử dụng một giá trị ngẫu nhiên nếu không có
        const customerId = order.userId || order.user?.id || `anonymous_${index}`;
        const timeSlotKey = `${orderHour}_${customerId}`;
        
        console.log(`Processing order ${index} at hour ${orderHour} for customer ${customerId}`);
        
        // Đảm bảo mỗi khách hàng chỉ được tính một lần trong mỗi khung giờ
        if (!uniqueCustomers.has(timeSlotKey)) {
          uniqueCustomers.set(timeSlotKey, true);
          timeSlots[slotIndex].customerCount += 1;
          console.log(`Added customer to time slot ${timeSlots[slotIndex].timeSlot}, count now: ${timeSlots[slotIndex].customerCount}`);
        } else {
          console.log(`Customer ${customerId} already counted at hour ${orderHour}`);
        }
      } else {
        console.log(`Time slot index out of range: ${slotIndex} for hour ${orderHour}`);
      }
      
      processedOrders++;
    } else {
      console.log(`Order hour ${orderHour} outside operating hours (11-22)`);
    }
  });
  
  console.log(`Processed ${processedOrders} orders for time slot stats`);
  console.log('Unique customer count by time slot:', uniqueCustomers.size);
  console.log('Final time slot stats:', timeSlots);
  
  return timeSlots;
}

// Hàm chuyển đổi dữ liệu đơn hàng theo giờ trong ngày
const calculateHourlyData = (orders: any[]) => {
  console.log('Calculating hourly revenue data from orders:', orders);
  
  // Khởi tạo mảng kết quả với các giờ từ 6h sáng đến 23h đêm
  const hours = Array.from({ length: 18 }, (_, index) => {
    const hour = index + 6;
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      revenue: 0,
      orders: 0
    };
  });
  
  if (!orders || orders.length === 0) {
    console.log('No orders data available for hourly revenue calculation');
    return hours;
  }
  
  let processedOrders = 0;
  
  // Nhóm dữ liệu theo giờ
  orders.forEach((order, index) => {
    // Lấy ngày đặt hàng từ order.orderDate hoặc order.createdAt
    const orderDateStr = order.orderDate || order.createdAt;
    
    if (!orderDateStr) {
      console.log(`Order ${index} missing date information`);
      return;
    }
    
    const date = new Date(orderDateStr);
    
    // Kiểm tra ngày hợp lệ
    if (isNaN(date.getTime())) {
      console.log(`Order ${index} has invalid date: ${orderDateStr}`);
      return;
    }
    
    const orderHour = date.getHours();
    
    // Kiểm tra phạm vi giờ hợp lệ
    if (orderHour >= 6 && orderHour <= 23) {
      // Tính chỉ số trong mảng hours (ví dụ: 6 giờ ở vị trí 0, 7 giờ ở vị trí 1, v.v.)
      const index = orderHour - 6;
      
      // Kiểm tra chỉ số hợp lệ trước khi truy cập vào mảng
      if (index >= 0 && index < hours.length) {
        // Kiểm tra totalAmount có tồn tại và hợp lệ không
        const amount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
        
        console.log(`Adding order at hour ${orderHour}: revenue=${amount}`);
        
        hours[index].revenue += amount;
        hours[index].orders += 1;
        processedOrders++;
      } else {
        console.log(`Hour index out of range: ${index} for hour ${orderHour}`);
      }
    } else {
      console.log(`Order hour ${orderHour} outside operating hours (6-23)`);
    }
  });
  
  console.log(`Processed ${processedOrders} orders for hourly revenue data`);
  console.log('Final hourly revenue data:', hours);
  
  return hours;
}

// Hàm tính toán thống kê theo món ăn từ dữ liệu đơn hàng thực
interface DailyItemData {
  name: string;
  quantity: number;
  revenue: number;
}

const calculateDailyItemsData = (orders: any[]): DailyItemData[] => {
  console.log('Calculating daily items data from orders:', orders);
  
  if (!orders || orders.length === 0) {
    console.log('No orders data available for daily items');
    return [];
  }
  
  const itemStats: Record<string, { quantity: number, revenue: number }> = {};
  let processedItemCount = 0;
  
  // Tổng hợp dữ liệu theo món ăn
  orders.forEach((order: any, orderIndex: number) => {
    console.log(`Processing order ${orderIndex}:`, order);
    
    // Kiểm tra cấu trúc dữ liệu đơn hàng
    const orderItems = Array.isArray(order.items) ? order.items : 
                      Array.isArray(order.orderItems) ? order.orderItems : [];
    
    if (orderItems.length === 0) {
      console.log(`Order ${orderIndex} has no valid items array`);
    }
    
    orderItems.forEach((item: any, itemIndex: number) => {
      console.log(`Processing item ${itemIndex} in order ${orderIndex}:`, item);
      
      // Lấy tên sản phẩm từ cấu trúc dữ liệu
      let itemName = 'Sản phẩm khác';
      if (item.product && item.product.name) {
        itemName = item.product.name;
      } else if (item.name) {
        itemName = item.name;
      } else if (item.productId && typeof item.productId === 'object' && item.productId.name) {
        itemName = item.productId.name;
      }
      
      // Kiểm tra và xử lý số lượng và giá
      const quantity = parseInt(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const revenue = price * quantity;
      
      console.log(`Item ${itemName}: quantity=${quantity}, price=${price}, revenue=${revenue}`);
      
      if (!itemStats[itemName]) {
        itemStats[itemName] = { quantity: 0, revenue: 0 };
      }
      
      itemStats[itemName].quantity += quantity;
      itemStats[itemName].revenue += revenue;
      processedItemCount++;
    });
  });
  
  console.log(`Processed ${processedItemCount} items into ${Object.keys(itemStats).length} unique products`);
  console.log('Item stats before conversion:', itemStats);
  
  // Nếu không có dữ liệu sản phẩm, trả về mảng rỗng
  if (Object.keys(itemStats).length === 0) {
    console.log('No product data found');
    return [];
  }
  
  // Chuyển đổi và sắp xếp theo doanh thu giảm dần
  const result = Object.keys(itemStats)
    .map(name => ({
      name,
      quantity: itemStats[name].quantity,
      revenue: itemStats[name].revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Chỉ lấy 5 món doanh thu cao nhất
  
  console.log('Final daily items data:', result);
  return result;
}

// Hàm tính toán thống kê theo phương thức thanh toán từ dữ liệu thực
interface PaymentMethodData {
  name: string;
  value: number;
}

const calculatePaymentMethodData = (orders: any[]): PaymentMethodData[] => {
  console.log('Calculating payment method stats from orders:', orders);
  
  if (!orders || orders.length === 0) {
    console.log('No orders data available for payment method stats');
    return [
      { name: "Tiền mặt", value: 0 },
      { name: "Thẻ", value: 0 },
      { name: "Ví điện tử", value: 0 },
    ];
  }
  
  const paymentStats: Record<string, number> = {
    "Tiền mặt": 0,
    "Thẻ": 0,
    "Ví điện tử": 0
  };
  
  let totalProcessed = 0;
  
  orders.forEach((order, index) => {
    console.log(`Processing order ${index}:`, order);
    console.log(`Payment method:`, order.paymentMethod);
    
    // Kiểm tra thanh toán qua Stripe từ các trường liên quan
    const hasStripeData = order.stripePaymentIntentId || 
                         order.stripeCustomerId || 
                         order.stripeChargeId || 
                         order.stripePaymentMethodId ||
                         (order.payment && (
                           order.payment.stripePaymentIntentId ||
                           order.payment.stripeCustomerId ||
                           order.payment.stripeChargeId ||
                           order.payment.stripePaymentMethodId
                         ));
    
    if (hasStripeData) {
      console.log(`Order ${index} has Stripe payment data, categorizing as card payment`);
      paymentStats["Thẻ"] += 1;
      totalProcessed++;
      return;
    }
    
    // Kiểm tra trường hợp không có phương thức thanh toán
    const paymentMethod = order.paymentMethod || "";
    
    if (typeof paymentMethod !== 'string') {
      console.log(`Order ${index} has invalid payment method type:`, typeof paymentMethod);
      // Mặc định nếu paymentMethod không phải là chuỗi
      paymentStats["Tiền mặt"] += 1;
      totalProcessed++;
      return;
    }
    
    const paymentLower = paymentMethod.toLowerCase();
    
    // Nhận diện Stripe từ chuỗi phương thức thanh toán
    if (paymentLower.includes('stripe')) {
      console.log(`Order ${index} identified as Stripe payment from method name`);
      paymentStats["Thẻ"] += 1;
    } else if (paymentLower.includes('cash') || paymentLower.includes('tiền mặt')) {
      console.log(`Order ${index} counted as Cash payment`);
      paymentStats["Tiền mặt"] += 1;
    } else if (paymentLower.includes('card') || paymentLower.includes('thẻ') || 
               paymentLower.includes('credit') || paymentLower.includes('debit')) {
      console.log(`Order ${index} counted as Card payment`);
      paymentStats["Thẻ"] += 1;
    } else if (paymentLower.includes('wallet') || paymentLower.includes('momo') || 
               paymentLower.includes('zalopay') || paymentLower.includes('ví') || 
               paymentLower.includes('electronic') || paymentLower.includes('online')) {
      console.log(`Order ${index} counted as E-Wallet payment`);
      paymentStats["Ví điện tử"] += 1;
    } else {
      console.log(`Order ${index} has unrecognized payment method: "${paymentMethod}", checking payment details`);
      
      // Kiểm tra chi tiết thanh toán nếu có
      const paymentDetails = order.paymentDetails || order.payment || {};
      if (paymentDetails.method && typeof paymentDetails.method === 'string') {
        const detailMethodLower = paymentDetails.method.toLowerCase();
        
        if (detailMethodLower.includes('stripe') || detailMethodLower.includes('card')) {
          console.log(`Found Stripe/Card reference in payment details`);
          paymentStats["Thẻ"] += 1;
        } else if (detailMethodLower.includes('cash')) {
          console.log(`Found Cash reference in payment details`);
          paymentStats["Tiền mặt"] += 1;
        } else if (detailMethodLower.includes('wallet') || detailMethodLower.includes('momo')) {
          console.log(`Found E-Wallet reference in payment details`);
          paymentStats["Ví điện tử"] += 1;
        } else {
          console.log(`No recognizable payment method in details, defaulting to Cash`);
          paymentStats["Tiền mặt"] += 1;
        }
      } else {
        console.log(`No payment details found, defaulting to Cash`);
        paymentStats["Tiền mặt"] += 1;
      }
    }
    
    totalProcessed++;
  });
  
  console.log(`Processed ${totalProcessed} orders for payment methods`);
  console.log('Payment method stats:', paymentStats);
  
  const result = Object.keys(paymentStats).map(name => ({
    name,
    value: paymentStats[name]
  }));
  
  console.log('Final payment method data:', result);
  return result;
}

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
  
  // Tính toán dữ liệu doanh thu theo tháng từ dữ liệu đơn hàng
  interface MonthlyRevenueItem {
    name: string;
    revenue: number;
  }

  // Định nghĩa hàm tính doanh thu theo tháng từ dữ liệu đơn hàng
  const calculateMonthlyRevenueData = () => {
    console.log('Calculating monthly revenue from orders data:', ordersData);
    
    // Nếu không có dữ liệu đơn hàng, trả về mảng rỗng
    if (!ordersData || ordersData.length === 0) {
      console.log('No orders data available for monthly revenue');
      return [] as MonthlyRevenueItem[];
    }
    
    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear();
    console.log('Current year for revenue calculation:', currentYear);
    
    // Khởi tạo mảng các tháng với doanh thu ban đầu là 0
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(currentYear, i, 1).toLocaleString('vi-VN', { month: 'short' }),
      revenue: 0
    }));
    
    // Tính toán doanh thu cho từng tháng dựa trên các đơn hàng
    ordersData.forEach(order => {
      // Lấy ngày đặt hàng từ order.orderDate hoặc order.createdAt
      const orderDateStr = order.orderDate || order.createdAt;
      
      if (!orderDateStr) {
        console.log('Order missing date:', order);
        return;
      }
        
      const orderDate = new Date(orderDateStr);
      
      // Kiểm tra ngày hợp lệ
      if (isNaN(orderDate.getTime())) {
        console.log('Invalid date for order:', order);
        return;
      }
      
      // Chỉ tính các đơn hàng trong năm hiện tại
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        
        // Kiểm tra totalAmount có tồn tại và hợp lệ không
        const amount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
        months[monthIndex].revenue += amount;
        
        console.log(`Added ${amount} to month ${monthIndex + 1}`);
      }
    });
    
    console.log('Final monthly revenue data:', months);
    return months;
  };
  
  // Hàm tính toán doanh thu theo danh mục
  const calculateCategoryRevenueData = () => {
    console.log('Calculating category revenue from orders data:', ordersData);
    
    // Nếu không có dữ liệu đơn hàng, trả về mảng rỗng
    if (!ordersData || ordersData.length === 0) {
      console.log('No orders data available for category revenue');
      return [] as CategoryRevenueItem[];
    }
    
    const categoryStats: Record<string, number> = {};
    let totalRevenue = 0;

    // Tính tổng doanh thu theo danh mục
    ordersData.forEach((order: any, index: number) => {
      console.log(`Processing order ${index}:`, order);
      
      // Kiểm tra xem order.items có tồn tại và là mảng không
      if (!Array.isArray(order.items) || order.items.length === 0) {
        console.log(`Order ${index} has no items array:`, order);
        return;
      }
      
      order.items.forEach((item: any, itemIndex: number) => {
        console.log(`Processing item ${itemIndex} in order ${index}:`, item);
        
        // Xử lý trường hợp không có thông tin sản phẩm
        if (!item.product) {
          console.log(`Item ${itemIndex} has no product information`); 
          return;
        }

        // Lấy category từ sản phẩm hoặc sử dụng 'Khác' nếu không có
        const category = item.product.category || 'Khác';
        
        // Tính doanh thu cho mục này
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const itemRevenue = price * quantity;
        
        console.log(`Item revenue for ${category}: ${itemRevenue} (${price} x ${quantity})`);
        
        if (!categoryStats[category]) {
          categoryStats[category] = 0;
        }
        
        categoryStats[category] += itemRevenue;
        totalRevenue += itemRevenue;
      });
    });
    
    console.log('Category stats before conversion:', categoryStats);
    console.log('Total revenue:', totalRevenue);
    
    // Nếu không có dữ liệu danh mục, tạo dữ liệu mặc định
    if (Object.keys(categoryStats).length === 0) {
      console.log('No category data found, creating default data');
      return [];
    }
    
    // Chuyển đổi thành mảng và tính phần trăm
    const result = Object.keys(categoryStats).map(name => ({
      name,
      revenue: categoryStats[name],
      percentage: totalRevenue > 0 ? Math.round((categoryStats[name] / totalRevenue) * 100) : 0
    }));
    
    console.log('Final category revenue data:', result);
    return result;
  };
  
  console.log('OrdersData from API:', ordersData); // Ghi log dữ liệu API để kiểm tra
  
  // Kiểm tra dữ liệu API trả về
  console.log('[DASHBOARD DEBUG] Orders API:', ordersData);
  console.log('[DASHBOARD DEBUG] User Stats API:', userStatsData);
  console.log('[DASHBOARD DEBUG] Reservations API:', reservationsData);
  console.log('[DASHBOARD DEBUG] Deliveries API:', deliveriesData);
  
  // Dữ liệu thống kê được tính toán trực tiếp từ dữ liệu thực
  const finalMonthlyRevenueData = calculateMonthlyRevenueData();
  console.log('[DASHBOARD DEBUG] Monthly Revenue Data:', finalMonthlyRevenueData);
  
  const finalCategoryRevenueData = calculateCategoryRevenueData();
  console.log('[DASHBOARD DEBUG] Category Revenue Data:', finalCategoryRevenueData);
  
  const topProductsData = calculateDailyItemsData(ordersData || []);
  console.log('[DASHBOARD DEBUG] Top Products Data:', topProductsData);
  
  const paymentMethodData = calculatePaymentMethodData(ordersData || []);
  console.log('[DASHBOARD DEBUG] Payment Method Data:', paymentMethodData);
  
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
  
  // Tất cả các dữ liệu biểu đồ bây giờ được tính toán trực tiếp từ dữ liệu API thực tế
  const finalOrderTypeData = calculateOrderTypeStats(ordersData || []);
  const finalTimeSlotData = calculateTimeSlotStats(ordersData || []);
  
  // Sử dụng dữ liệu thực từ API cho các thống kê tổng quan
  // Sử dụng todayRevenue đã tính trước đó từ ordersData
  const previousMonthRevenue = todayRevenue * 0.8 // Ước tính doanh thu tháng trước thấp hơn 20%
  const revenueGrowthPercentage = growthRate || 0
  
  // Đã tính sẵn totalOrders từ dữ liệu ordersData
  // Sử dụng giá trị mặc định cho thống kê trước đó
  const previousTotalOrders = Math.round(totalOrders * 0.9) // Ước tính số đơn hàng tháng trước thấp hơn 10%
  
  // Số khách hàng trung bình mỗi ngày - sử dụng avgCustomersPerDay đã tính trước đó dựa trên userStats 
  const averageCustomersPerDay = avgCustomersPerDay || 
    (finalTimeSlotData?.reduce((sum: number, item: any) => sum + (item.customerCount || 0), 0) / (finalTimeSlotData?.length || 1)) || 0
  
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

          <TabsContent value="overview">
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
                        data={calculateHourlyData(filterOrdersByDate(ordersData || [], date))}
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
