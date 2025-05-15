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
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useGetOrdersQuery, useUpdateOrderStatusMutation, useCreateOrderMutation } from '@/redux/api'
import { DataTable } from '@/components/ui/data-table'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

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
  email: string
}

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  loyaltyPoints: number
  joinDate: string
}

interface Reservation {
  _id: string
  date: string
  time: string
  partySize: number
  specialRequests?: string
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
  _id: string;
  restaurantId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'QR';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dữ liệu mẫu cho nhà hàng
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    _id: "rest1",
    name: "Pizza Liêm Khiết - Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028-1234-5678",
    email: "rest1@example.com",
  },
  {
    _id: "rest2",
    name: "Pizza Liêm Khiết - Quận 3",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    phone: "028-8765-4321",
    email: "rest2@example.com",
  },
]

// Dữ liệu mẫu cho người dùng
const MOCK_USERS: User[] = [
  {
    _id: "user1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    role: "customer",
    loyaltyPoints: 1000,
    joinDate: "2023-05-01",
  },
  {
    _id: "user2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0912345678",
    role: "customer",
    loyaltyPoints: 500,
    joinDate: "2023-05-05",
  },
]

// Dữ liệu mẫu cho đặt bàn
const MOCK_RESERVATIONS: Reservation[] = [
  {
    _id: "res1",
    date: "2023-05-15",
    time: "19:00",
    partySize: 4,
    specialRequests: "No onions, extra cheese",
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
const MOCK_ORDERS: Order[] = []

// Status mapping for visual elements
const STATUS_MAP = {
  pending: {
    label: "Pending",
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="h-4 w-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Package className="h-4 w-4" />,
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

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const OrderDetails = ({ order, onClose }: OrderDetailsProps) => {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>
          Order ID: {order._id}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Order Information</h3>
            <p>Restaurant ID: {order.restaurantId}</p>
            <p>Total Amount: ${order.totalAmount.toFixed(2)}</p>
            <p>Status: {order.status}</p>
            <p>Payment Method: {order.paymentMethod}</p>
            <p>Payment Status: {order.paymentStatus}</p>
          </div>
          <div>
            <h3 className="font-semibold">Dates</h3>
            <p>Created: {format(new Date(order.createdAt), 'PPp')}</p>
            <p>Updated: {format(new Date(order.updatedAt), 'PPp')}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={statusColors[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function OrdersPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [restaurantFilter, setRestaurantFilter] = useState("all")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isPaymentDetailsDialogOpen, setIsPaymentDetailsDialogOpen] = useState(false)
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all')
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    restaurantId: "",
    totalAmount: 0,
    status: "pending" as const,
    paymentMethod: "cash" as const,
    paymentStatus: "pending" as const,
    deleted: false,
  })
  
  const { data: orders = [], isLoading, error } = useGetOrdersQuery()
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [createOrder] = useCreateOrderMutation()

  console.log('Orders from API:', orders) // Add this line for debugging

  const columns = [
    {
      accessorKey: '_id',
      header: 'Order ID',
    },
    {
      accessorKey: 'restaurantId',
      header: 'Restaurant ID',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }: { row: any }) => (
        <span>${row.original.totalAmount.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <OrderStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }: { row: any }) => (
        <span>{format(new Date(row.original.createdAt), 'PPp')}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const order = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {order.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate(order._id, 'processing')}
                >
                  Process
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                >
                  Cancel
                </Button>
              </>
            )}
            {order.status === 'processing' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(order._id, 'completed')}
              >
                Complete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const handleCreateOrder = async () => {
    try {
      await createOrder(newOrder).unwrap()
      setIsCreateOrderDialogOpen(false)
      setNewOrder({
        restaurantId: "",
        totalAmount: 0,
        status: "pending" as const,
        paymentMethod: "cash" as const,
        paymentStatus: "pending" as const,
        deleted: false,
      })
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap()
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
    }

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm
      ? order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurantId.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesStatus = selectedStatus === 'all' ? true : order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error loading orders. Please try again later.
      </div>
    )
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
                {Object.entries(STATUS_MAP).map(([key, value]) => (
                  <div
                    key={key}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setStatusFilter(key)
                      setShowStatusDropdown(false)
                    }}
                  >
                    {value.label}
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
              <DataTable
                columns={columns}
                data={filteredOrders}
              />
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
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
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
                  <Label htmlFor="restaurantId">Restaurant ID</Label>
                  <Input
                    id="restaurantId"
                    value={newOrder.restaurantId}
                    onChange={(e) => setNewOrder({ ...newOrder, restaurantId: e.target.value })}
                    placeholder="Enter restaurant ID"
                  />
                </div>

                <div>
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={newOrder.totalAmount}
                    onChange={(e) => setNewOrder({ ...newOrder, totalAmount: parseFloat(e.target.value) })}
                    placeholder="Enter total amount"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={newOrder.paymentMethod}
                    onValueChange={(value: 'cash' | 'card' | 'QR') => setNewOrder({ ...newOrder, paymentMethod: value })}
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
              </div>
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
