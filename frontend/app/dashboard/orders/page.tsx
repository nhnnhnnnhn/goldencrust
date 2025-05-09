"use client"

import { useState } from "react"
import {
  Clock,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  FileText,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Download,
  CreditCard,
  DollarSign,
  Home,
  Utensils,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Định nghĩa các kiểu dữ liệu
interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  discountPercentage: number
  total: number
}

interface Restaurant {
  _id: string
  name: string
  address: string
  phone: string
}

interface User {
  _id: string
  name: string
  email: string
  phone: string
}

interface Reservation {
  _id: string
  customerName: string
  reservationDate: string
  reservationTime: string
  numberOfGuests: number
}

interface OrderDetail {
  _id: string
  orderId: string
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  orderType: "dine-in" | "takeaway" | "delivery"
  deleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface Payment {
  _id: string
  amount: number
  userId: string
  paymentMethod: "credit_card" | "debit_card" | "paypal" | "cash" | "stripe"
  transactionId?: string
  orderId: string
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  stripeChargeId?: string
  stripePaymentMethodId?: string
  currency: string
  status: "pending" | "completed" | "failed"
  createdBy?: string
  updatedBy?: string
  deleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface Order {
  _id: string
  reservationId?: string
  userId: string
  restaurantId: string
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  paymentMethod: "cash" | "card" | "QR"
  paymentStatus: "paid" | "pending" | "failed"
  deleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
  // Thông tin bổ sung từ các bảng liên quan
  user?: User
  restaurant?: Restaurant
  reservation?: Reservation
  orderDetail?: OrderDetail
  payment?: Payment
}

// Dữ liệu mẫu cho nhà hàng
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    _id: "rest1",
    name: "Pizza Liêm Khiết - Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028-1234-5678",
  },
  {
    _id: "rest2",
    name: "Pizza Liêm Khiết - Quận 3",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    phone: "028-8765-4321",
  },
]

// Dữ liệu mẫu cho người dùng
const MOCK_USERS: User[] = [
  {
    _id: "user1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
  },
  {
    _id: "user2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0912345678",
  },
]

// Dữ liệu mẫu cho đặt bàn
const MOCK_RESERVATIONS: Reservation[] = [
  {
    _id: "res1",
    customerName: "Nguyễn Văn A",
    reservationDate: "2023-05-15",
    reservationTime: "19:00",
    numberOfGuests: 4,
  },
]

// Dữ liệu mẫu cho món ăn
const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    _id: "item1",
    name: "Margherita Pizza",
    description: "Classic tomato and mozzarella",
    price: 12.99,
    image: "/placeholder.svg?height=300&width=300&text=Margherita+Pizza",
    category: "pizza",
  },
  {
    _id: "item2",
    name: "Pepperoni Pizza",
    description: "Pepperoni and cheese",
    price: 14.99,
    image: "/placeholder.svg?height=300&width=300&text=Pepperoni+Pizza",
    category: "pizza",
  },
  {
    _id: "item3",
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter",
    price: 4.99,
    image: "/placeholder.svg?height=300&width=300&text=Garlic+Bread",
    category: "sides",
  },
  {
    _id: "item4",
    name: "Coca Cola",
    description: "330ml can",
    price: 2.99,
    image: "/placeholder.svg?height=300&width=300&text=Coca+Cola",
    category: "drinks",
  },
]

// Dữ liệu mẫu cho chi tiết đơn hàng
const MOCK_ORDER_DETAILS: OrderDetail[] = [
  {
    _id: "od1",
    orderId: "ord1",
    restaurantId: "rest1",
    items: [
      {
        menuItemId: "item1",
        name: "Margherita Pizza",
        quantity: 1,
        price: 12.99,
        discountPercentage: 0,
        total: 12.99,
      },
      {
        menuItemId: "item3",
        name: "Garlic Bread",
        quantity: 1,
        price: 4.99,
        discountPercentage: 0,
        total: 4.99,
      },
      {
        menuItemId: "item4",
        name: "Coca Cola",
        quantity: 2,
        price: 2.99,
        discountPercentage: 0,
        total: 5.98,
      },
    ],
    totalAmount: 23.96,
    status: "completed",
    orderType: "dine-in",
    deleted: false,
    createdAt: new Date("2023-05-15T19:30:00"),
    updatedAt: new Date("2023-05-15T19:30:00"),
  },
  {
    _id: "od2",
    orderId: "ord2",
    restaurantId: "rest1",
    items: [
      {
        menuItemId: "item2",
        name: "Pepperoni Pizza",
        quantity: 1,
        price: 14.99,
        discountPercentage: 0,
        total: 14.99,
      },
      {
        menuItemId: "item4",
        name: "Coca Cola",
        quantity: 1,
        price: 2.99,
        discountPercentage: 0,
        total: 2.99,
      },
    ],
    totalAmount: 17.98,
    status: "pending",
    orderType: "takeaway",
    deleted: false,
    createdAt: new Date("2023-05-14T12:45:00"),
    updatedAt: new Date("2023-05-14T12:45:00"),
  },
]

// Dữ liệu mẫu cho thanh toán
const MOCK_PAYMENTS: Payment[] = [
  {
    _id: "pay1",
    amount: 23.96,
    userId: "user1",
    paymentMethod: "credit_card",
    transactionId: "tx_123456",
    orderId: "ord1",
    stripePaymentIntentId: "pi_123456",
    stripeCustomerId: "cus_123456",
    stripeChargeId: "ch_123456",
    stripePaymentMethodId: "pm_123456",
    currency: "usd",
    status: "completed",
    createdBy: "user1",
    updatedBy: "user1",
    deleted: false,
    createdAt: new Date("2023-05-15T19:35:00"),
    updatedAt: new Date("2023-05-15T19:35:00"),
  },
  {
    _id: "pay2",
    amount: 17.98,
    userId: "user2",
    paymentMethod: "cash",
    orderId: "ord2",
    currency: "usd",
    status: "pending",
    createdBy: "user2",
    deleted: false,
    createdAt: new Date("2023-05-14T12:50:00"),
    updatedAt: new Date("2023-05-14T12:50:00"),
  },
]

// Dữ liệu mẫu cho đơn hàng
const MOCK_ORDERS: Order[] = [
  {
    _id: "ord1",
    reservationId: "res1",
    userId: "user1",
    restaurantId: "rest1",
    totalAmount: 23.96,
    status: "completed",
    paymentMethod: "card",
    paymentStatus: "paid",
    deleted: false,
    createdAt: new Date("2023-05-15T19:30:00"),
    updatedAt: new Date("2023-05-15T19:30:00"),
    user: MOCK_USERS.find((user) => user._id === "user1"),
    restaurant: MOCK_RESTAURANTS.find((restaurant) => restaurant._id === "rest1"),
    reservation: MOCK_RESERVATIONS.find((reservation) => reservation._id === "res1"),
    orderDetail: MOCK_ORDER_DETAILS.find((orderDetail) => orderDetail.orderId === "ord1"),
    payment: MOCK_PAYMENTS.find((payment) => payment.orderId === "ord1"),
  },
  {
    _id: "ord2",
    userId: "user2",
    restaurantId: "rest1",
    totalAmount: 17.98,
    status: "pending",
    paymentMethod: "cash",
    paymentStatus: "pending",
    deleted: false,
    createdAt: new Date("2023-05-14T12:45:00"),
    updatedAt: new Date("2023-05-14T12:45:00"),
    user: MOCK_USERS.find((user) => user._id === "user2"),
    restaurant: MOCK_RESTAURANTS.find((restaurant) => restaurant._id === "rest1"),
    orderDetail: MOCK_ORDER_DETAILS.find((orderDetail) => orderDetail.orderId === "ord2"),
    payment: MOCK_PAYMENTS.find((payment) => payment.orderId === "ord2"),
  },
  {
    _id: "ord3",
    userId: "user1",
    restaurantId: "rest2",
    totalAmount: 32.97,
    status: "cancelled",
    paymentMethod: "card",
    paymentStatus: "failed",
    deleted: false,
    createdAt: new Date("2023-05-13T18:15:00"),
    updatedAt: new Date("2023-05-13T18:30:00"),
    user: MOCK_USERS.find((user) => user._id === "user1"),
    restaurant: MOCK_RESTAURANTS.find((restaurant) => restaurant._id === "rest2"),
  },
]

// Status mapping for visual elements
const STATUS_MAP = {
  pending: {
    label: "Pending",
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
}

const PAYMENT_STATUS_MAP = {
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
}

const ORDER_TYPE_MAP = {
  "dine-in": {
    label: "Dine-in",
    icon: <Utensils className="h-4 w-4" />,
  },
  takeaway: {
    label: "Takeaway",
    icon: <Package className="h-4 w-4" />,
  },
  delivery: {
    label: "Delivery",
    icon: <Truck className="h-4 w-4" />,
  },
}

const PAYMENT_METHOD_MAP = {
  cash: {
    label: "Cash",
    icon: <DollarSign className="h-4 w-4" />,
  },
  card: {
    label: "Card",
    icon: <CreditCard className="h-4 w-4" />,
  },
  QR: {
    label: "QR Code",
    icon: <CreditCard className="h-4 w-4" />,
  },
  credit_card: {
    label: "Credit Card",
    icon: <CreditCard className="h-4 w-4" />,
  },
  debit_card: {
    label: "Debit Card",
    icon: <CreditCard className="h-4 w-4" />,
  },
  paypal: {
    label: "PayPal",
    icon: <CreditCard className="h-4 w-4" />,
  },
  stripe: {
    label: "Stripe",
    icon: <CreditCard className="h-4 w-4" />,
  },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isPaymentDetailsDialogOpen, setIsPaymentDetailsDialogOpen] = useState(false)
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [restaurantFilter, setRestaurantFilter] = useState("all")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    userId: "",
    restaurantId: "",
    paymentMethod: "cash",
    status: "pending",
    paymentStatus: "pending",
  })
  const [orderItems, setOrderItems] = useState<Partial<OrderItem>[]>([
    {
      menuItemId: "",
      quantity: 1,
      price: 0,
      discountPercentage: 0,
    },
  ])

  // Lọc đơn hàng dựa trên tìm kiếm, trạng thái và nhà hàng
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.restaurant?.name || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesRestaurant = restaurantFilter === "all" || order.restaurantId === restaurantFilter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "dine-in" && order.orderDetail?.orderType === "dine-in") ||
      (activeTab === "takeaway" && order.orderDetail?.orderType === "takeaway") ||
      (activeTab === "delivery" && order.orderDetail?.orderType === "delivery")

    return matchesSearch && matchesStatus && matchesRestaurant && matchesTab
  })

  // Xử lý xem chi tiết đơn hàng
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

  // Xử lý xem chi tiết thanh toán
  const handleViewPaymentDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsPaymentDetailsDialogOpen(true)
  }

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = (orderId: string, newStatus: "pending" | "completed" | "cancelled") => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              status: newStatus,
              updatedAt: new Date(),
            }
          : order,
      ),
    )

    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        updatedAt: new Date(),
      })
    }

    // Đóng dialog sau khi cập nhật
    setIsOrderDetailsDialogOpen(false)
  }

  // Xử lý cập nhật trạng thái thanh toán
  const handleUpdatePaymentStatus = (orderId: string, newStatus: "paid" | "pending" | "failed") => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              paymentStatus: newStatus,
              updatedAt: new Date(),
            }
          : order,
      ),
    )

    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus: newStatus,
        updatedAt: new Date(),
      })
    }

    // Đóng dialog sau khi cập nhật
    setIsPaymentDetailsDialogOpen(false)
  }

  // Xử lý xóa đơn hàng (soft delete)
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                deleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
              }
            : order,
        ),
      )
    }
  }

  // Xử lý thêm món vào đơn hàng mới
  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { menuItemId: "", quantity: 1, price: 0, discountPercentage: 0 }])
  }

  // Xử lý xóa món khỏi đơn hàng mới
  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  // Xử lý thay đổi thông tin món trong đơn hàng mới
  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Nếu thay đổi menuItemId, cập nhật giá
    if (field === "menuItemId") {
      const selectedItem = MOCK_MENU_ITEMS.find((item) => item._id === value)
      if (selectedItem) {
        updatedItems[index].price = selectedItem.price
        updatedItems[index].name = selectedItem.name
      }
    }

    // Tính toán tổng tiền cho món
    if (field === "menuItemId" || field === "quantity" || field === "price" || field === "discountPercentage") {
      const quantity = updatedItems[index].quantity || 0
      const price = updatedItems[index].price || 0
      const discountPercentage = updatedItems[index].discountPercentage || 0
      const discountAmount = (price * quantity * discountPercentage) / 100
      updatedItems[index].total = price * quantity - discountAmount
    }

    setOrderItems(updatedItems)
  }

  // Tính tổng tiền đơn hàng mới
  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + (item.total || 0), 0)
  }

  // Xử lý tạo đơn hàng mới
  const handleCreateOrder = () => {
    // Kiểm tra dữ liệu đầu vào
    if (!newOrder.userId || !newOrder.restaurantId || orderItems.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    // Tạo ID mới cho đơn hàng
    const newOrderId = `ord${Math.floor(Math.random() * 1000)}`
    const now = new Date()
    const totalAmount = calculateOrderTotal()

    // Tạo chi tiết đơn hàng
    const orderDetail: OrderDetail = {
      _id: `od${Math.floor(Math.random() * 1000)}`,
      orderId: newOrderId,
      restaurantId: newOrder.restaurantId as string,
      items: orderItems.map((item) => ({
        menuItemId: item.menuItemId as string,
        name: item.name as string,
        quantity: item.quantity as number,
        price: item.price as number,
        discountPercentage: item.discountPercentage as number,
        total: item.total as number,
      })),
      totalAmount,
      status: "pending",
      orderType: (newOrder.orderType as "dine-in" | "takeaway" | "delivery") || "dine-in",
      deleted: false,
      createdAt: now,
      updatedAt: now,
    }

    // Tạo thanh toán
    const payment: Payment = {
      _id: `pay${Math.floor(Math.random() * 1000)}`,
      amount: totalAmount,
      userId: newOrder.userId as string,
      paymentMethod: (newOrder.paymentMethod as "cash") || "cash",
      orderId: newOrderId,
      currency: "usd",
      status: "pending",
      createdBy: user?._id,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    }

    // Tạo đơn hàng mới
    const order: Order = {
      _id: newOrderId,
      reservationId: newOrder.reservationId,
      userId: newOrder.userId as string,
      restaurantId: newOrder.restaurantId as string,
      totalAmount,
      status: "pending",
      paymentMethod: (newOrder.paymentMethod as "cash") || "cash",
      paymentStatus: "pending",
      deleted: false,
      createdAt: now,
      updatedAt: now,
      user: MOCK_USERS.find((u) => u._id === newOrder.userId),
      restaurant: MOCK_RESTAURANTS.find((r) => r._id === newOrder.restaurantId),
      reservation: newOrder.reservationId ? MOCK_RESERVATIONS.find((r) => r._id === newOrder.reservationId) : undefined,
      orderDetail,
      payment,
    }

    // Thêm đơn hàng mới vào danh sách
    setOrders([order, ...orders])

    // Reset form
    setNewOrder({
      userId: "",
      restaurantId: "",
      paymentMethod: "cash",
      status: "pending",
      paymentStatus: "pending",
    })
    setOrderItems([
      {
        menuItemId: "",
        quantity: 1,
        price: 0,
        discountPercentage: 0,
      },
    ])

    // Đóng dialog
    setIsCreateOrderDialogOpen(false)
  }

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
  }

  // Format ngày giờ
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
          <p className="text-gray-500">View and manage all orders</p>
        </div>
        <Button onClick={() => setIsCreateOrderDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Create New Order
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <Filter size={16} />
              <span>
                Status: {statusFilter === "all" ? "All" : STATUS_MAP[statusFilter as keyof typeof STATUS_MAP].label}
              </span>
              <ChevronDown size={16} />
            </button>

            {showStatusDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("all")
                    setShowStatusDropdown(false)
                  }}
                >
                  All
                </div>
                {Object.keys(STATUS_MAP).map((status) => (
                  <div
                    key={status}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setStatusFilter(status)
                      setShowStatusDropdown(false)
                    }}
                  >
                    {STATUS_MAP[status as keyof typeof STATUS_MAP].icon}
                    {STATUS_MAP[status as keyof typeof STATUS_MAP].label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <Home size={16} />
              <span>
                Restaurant:{" "}
                {restaurantFilter === "all" ? "All" : MOCK_RESTAURANTS.find((r) => r._id === restaurantFilter)?.name}
              </span>
              <ChevronDown size={16} />
            </button>

            {showRestaurantDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setRestaurantFilter("all")
                    setShowRestaurantDropdown(false)
                  }}
                >
                  All Restaurants
                </div>
                {MOCK_RESTAURANTS.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRestaurantFilter(restaurant._id)
                      setShowRestaurantDropdown(false)
                    }}
                  >
                    {restaurant.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Filter by Date</span>
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="dine-in">Dine-in</TabsTrigger>
          <TabsTrigger value="takeaway">Takeaway</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id} className={order.deleted ? "bg-gray-50 text-gray-500" : ""}>
                      <TableCell className="font-medium">{order._id}</TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                      <TableCell>{order.user?.name || "Unknown"}</TableCell>
                      <TableCell>{order.restaurant?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {order.orderDetail?.orderType ? (
                          <div className="flex items-center gap-1">
                            {ORDER_TYPE_MAP[order.orderDetail.orderType].icon}
                            <span>{ORDER_TYPE_MAP[order.orderDetail.orderType].label}</span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_MAP[order.status].color} flex items-center gap-1 px-2 py-1`}>
                          {STATUS_MAP[order.status].icon}
                          <span>{STATUS_MAP[order.status].label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${PAYMENT_STATUS_MAP[order.paymentStatus].color} flex items-center gap-1 px-2 py-1`}
                        >
                          {PAYMENT_STATUS_MAP[order.paymentStatus].icon}
                          <span>{PAYMENT_STATUS_MAP[order.paymentStatus].label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrderDetails(order)}
                            disabled={order.deleted}
                            className="h-8 w-8"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPaymentDetails(order)}
                            disabled={order.deleted}
                            className="h-8 w-8"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span className="sr-only">Payment details</span>
                          </Button>
                          {!order.deleted && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOrder(order._id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                <p className="text-gray-500 text-center mt-1">
                  {searchTerm || statusFilter !== "all" || restaurantFilter !== "all"
                    ? "No orders match your current filters."
                    : "There are no orders in the system yet."}
                </p>
                {(searchTerm || statusFilter !== "all" || restaurantFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setRestaurantFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsDialogOpen} onOpenChange={setIsOrderDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order {selectedOrder?._id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
                    <div className="mt-2 bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Order ID:</span>
                        <span className="text-sm font-medium">{selectedOrder._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date & Time:</span>
                        <span className="text-sm">{formatDateTime(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge
                          className={`${STATUS_MAP[selectedOrder.status].color} flex items-center gap-1 px-2 py-1`}
                        >
                          {STATUS_MAP[selectedOrder.status].icon}
                          <span>{STATUS_MAP[selectedOrder.status].label}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Order Type:</span>
                        {selectedOrder.orderDetail?.orderType ? (
                          <div className="flex items-center gap-1">
                            {ORDER_TYPE_MAP[selectedOrder.orderDetail.orderType].icon}
                            <span className="text-sm">{ORDER_TYPE_MAP[selectedOrder.orderDetail.orderType].label}</span>
                          </div>
                        ) : (
                          <span className="text-sm">N/A</span>
                        )}
                      </div>
                      {selectedOrder.reservation && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Reservation:</span>
                          <span className="text-sm">
                            {selectedOrder.reservation.customerName} - {selectedOrder.reservation.reservationDate}{" "}
                            {selectedOrder.reservation.reservationTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                    <div className="mt-2 bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name:</span>
                        <span className="text-sm">{selectedOrder.user?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email:</span>
                        <span className="text-sm">{selectedOrder.user?.email || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone:</span>
                        <span className="text-sm">{selectedOrder.user?.phone || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Restaurant Information</h3>
                    <div className="mt-2 bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name:</span>
                        <span className="text-sm">{selectedOrder.restaurant?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Address:</span>
                        <span className="text-sm">{selectedOrder.restaurant?.address || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone:</span>
                        <span className="text-sm">{selectedOrder.restaurant?.phone || "Unknown"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Information</h3>
                    <div className="mt-2 bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Payment Method:</span>
                        <div className="flex items-center gap-1">
                          {PAYMENT_METHOD_MAP[selectedOrder.paymentMethod as keyof typeof PAYMENT_METHOD_MAP].icon}
                          <span className="text-sm">
                            {PAYMENT_METHOD_MAP[selectedOrder.paymentMethod as keyof typeof PAYMENT_METHOD_MAP].label}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Payment Status:</span>
                        <Badge
                          className={`${PAYMENT_STATUS_MAP[selectedOrder.paymentStatus].color} flex items-center gap-1 px-2 py-1`}
                        >
                          {PAYMENT_STATUS_MAP[selectedOrder.paymentStatus].icon}
                          <span>{PAYMENT_STATUS_MAP[selectedOrder.paymentStatus].label}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Amount:</span>
                        <span className="text-sm font-medium">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.orderDetail?.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right">{item.discountPercentage}%</TableCell>
                        <TableCell className="text-right">{formatPrice(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    {!selectedOrder.orderDetail?.items.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No items found for this order
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <div className="flex gap-2">
                  {!selectedOrder.deleted && (
                    <>
                      {selectedOrder.status !== "completed" && (
                        <Button
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "completed")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      )}
                      {selectedOrder.status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "cancelled")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsOrderDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDetailsDialogOpen} onOpenChange={setIsPaymentDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Order {selectedOrder?._id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID:</span>
                  <span className="font-medium">{selectedOrder.payment?._id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">
                    {formatPrice(selectedOrder.payment?.amount || selectedOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <div className="flex items-center gap-1">
                    {selectedOrder.payment?.paymentMethod ? (
                      <>
                        {
                          PAYMENT_METHOD_MAP[selectedOrder.payment.paymentMethod as keyof typeof PAYMENT_METHOD_MAP]
                            .icon
                        }
                        <span>
                          {
                            PAYMENT_METHOD_MAP[selectedOrder.payment.paymentMethod as keyof typeof PAYMENT_METHOD_MAP]
                              .label
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        {PAYMENT_METHOD_MAP[selectedOrder.paymentMethod as keyof typeof PAYMENT_METHOD_MAP].icon}
                        <span>
                          {PAYMENT_METHOD_MAP[selectedOrder.paymentMethod as keyof typeof PAYMENT_METHOD_MAP].label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <Badge
                    className={`${PAYMENT_STATUS_MAP[selectedOrder.paymentStatus].color} flex items-center gap-1 px-2 py-1`}
                  >
                    {PAYMENT_STATUS_MAP[selectedOrder.paymentStatus].icon}
                    <span>{PAYMENT_STATUS_MAP[selectedOrder.paymentStatus].label}</span>
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>
                    {selectedOrder.payment
                      ? formatDateTime(selectedOrder.payment.createdAt)
                      : formatDateTime(selectedOrder.createdAt)}
                  </span>
                </div>
                {selectedOrder.payment?.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span>{selectedOrder.payment.transactionId}</span>
                  </div>
                )}
                {selectedOrder.payment?.currency && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Currency:</span>
                    <span>{selectedOrder.payment.currency.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {selectedOrder.payment?.paymentMethod === "stripe" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Stripe Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    {selectedOrder.payment.stripePaymentIntentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Intent ID:</span>
                        <span className="text-sm font-mono">{selectedOrder.payment.stripePaymentIntentId}</span>
                      </div>
                    )}
                    {selectedOrder.payment.stripeCustomerId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Customer ID:</span>
                        <span className="text-sm font-mono">{selectedOrder.payment.stripeCustomerId}</span>
                      </div>
                    )}
                    {selectedOrder.payment.stripeChargeId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Charge ID:</span>
                        <span className="text-sm font-mono">{selectedOrder.payment.stripeChargeId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between sm:justify-between">
                <div className="flex gap-2">
                  {!selectedOrder.deleted && (
                    <>
                      {selectedOrder.paymentStatus !== "paid" && (
                        <Button
                          onClick={() => handleUpdatePaymentStatus(selectedOrder._id, "paid")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </Button>
                      )}
                      {selectedOrder.paymentStatus !== "failed" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleUpdatePaymentStatus(selectedOrder._id, "failed")}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Mark as Failed
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsPaymentDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new order</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">Customer</Label>
                  <Select
                    value={newOrder.userId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, userId: value })}
                  >
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="restaurantId">Restaurant</Label>
                  <Select
                    value={newOrder.restaurantId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, restaurantId: value })}
                  >
                    <SelectTrigger id="restaurantId">
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_RESTAURANTS.map((restaurant) => (
                        <SelectItem key={restaurant._id} value={restaurant._id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reservationId">Reservation (Optional)</Label>
                  <Select
                    value={newOrder.reservationId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, reservationId: value })}
                  >
                    <SelectTrigger id="reservationId">
                      <SelectValue placeholder="Select a reservation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Reservation</SelectItem>
                      {MOCK_RESERVATIONS.map((reservation) => (
                        <SelectItem key={reservation._id} value={reservation._id}>
                          {reservation.customerName} - {reservation.reservationDate} {reservation.reservationTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select
                    value={newOrder.orderType}
                    onValueChange={(value) => setNewOrder({ ...newOrder, orderType: value })}
                  >
                    <SelectTrigger id="orderType">
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Dine-in</SelectItem>
                      <SelectItem value="takeaway">Takeaway</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={newOrder.paymentMethod}
                    onValueChange={(value) => setNewOrder({ ...newOrder, paymentMethod: value })}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="QR">QR Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or notes"
                    value={newOrder.notes || ""}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Order Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOrderItem}
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex flex-wrap gap-2 items-end p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor={`item-${index}`} className="text-xs">
                        Item
                      </Label>
                      <Select
                        value={item.menuItemId || ""}
                        onValueChange={(value) => handleOrderItemChange(index, "menuItemId", value)}
                      >
                        <SelectTrigger id={`item-${index}`}>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_MENU_ITEMS.map((menuItem) => (
                            <SelectItem key={menuItem._id} value={menuItem._id}>
                              {menuItem.name} - {formatPrice(menuItem.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-20">
                      <Label htmlFor={`quantity-${index}`} className="text-xs">
                        Quantity
                      </Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleOrderItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="w-24">
                      <Label htmlFor={`price-${index}`} className="text-xs">
                        Price
                      </Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleOrderItemChange(index, "price", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="w-24">
                      <Label htmlFor={`discount-${index}`} className="text-xs">
                        Discount %
                      </Label>
                      <Input
                        id={`discount-${index}`}
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercentage}
                        onChange={(e) =>
                          handleOrderItemChange(index, "discountPercentage", Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="w-24">
                      <Label className="text-xs">Total</Label>
                      <div className="h-10 px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-900">
                        {formatPrice(item.total || 0)}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOrderItem(index)}
                      className="h-10 w-10 text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">Total: {formatPrice(calculateOrderTotal())}</div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOrderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder} className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Order
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
