"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  Receipt
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useGetTodayOrdersQuery, useUpdateOrderStatusMutation, useCreateOrderMutation, useDeleteOrderMutation, useGetOrdersByDateQuery } from '@/redux/api/order'
import { useGetRestaurantsQuery } from '@/redux/api/restaurant'
import { useGetTablesByRestaurantQuery } from '@/redux/api/tableApi'
import { DataTable } from '@/components/ui/data-table'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useGetMenuItemsQuery } from '@/redux/api/menuItems'
import { toast } from "@/components/ui/use-toast"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
  menuItemId: string;
  quantity: number;
  price: number;
  total: number;
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
  userId: string;
  restaurantId: string;
  orderDate: Date;
  items: OrderItem[];
  orderType: 'Dine-in' | 'Takeaway';
  status: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface Row {
  getValue: (key: string) => any;
  original: Order;
}

interface CreateOrderRequest {
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  orderType: 'Dine-in' | 'Takeaway';
  totalAmount: number;
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
        quantity: 1,
        price: 12.99,
        total: 12.99,
      },
      {
        menuItemId: "item3",
        quantity: 1,
        price: 4.99,
        total: 4.99,
      },
      {
        menuItemId: "item4",
        quantity: 2,
        price: 2.99,
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
        quantity: 1,
        price: 14.99,
        total: 14.99,
      },
      {
        menuItemId: "item4",
        quantity: 1,
        price: 2.99,
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
  const { data: restaurants } = useGetRestaurantsQuery();
  const restaurant = restaurants?.find(r => r._id === order.restaurantId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Restaurant</Label>
            <div className="col-span-3">
              {restaurant?.name || 'Unknown Restaurant'}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total Amount</Label>
            <div className="col-span-3">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.totalAmount)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Created At</Label>
            <div className="col-span-3">
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState("all")
  const [restaurantFilter, setRestaurantFilter] = useState("all")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all')
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    userId: "",
    restaurantId: "",
    items: [],
    orderType: "Dine-in",
    status: "pending",
    totalAmount: 0
  })
  
  // State cho dialog order type
  const [orderStep, setOrderStep] = useState<'initial' | 'dineInDetails'>('initial')
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('')
  const [selectedTableId, setSelectedTableId] = useState<string>('')  
  
  // Fetch restaurant and table data
  const { data: restaurantsData, isLoading: restaurantsLoading } = useGetRestaurantsQuery()
  const { data: tablesData, isLoading: tablesLoading } = useGetTablesByRestaurantQuery(
    selectedRestaurantId, 
    { skip: !selectedRestaurantId }
  )
  
  // Format date for API call
  const formattedDate = format(selectedDate, 'yyyy-MM-dd')
  
  // Use the appropriate query based on whether we're viewing today's orders or a specific date
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const { data: todayOrders = [], isLoading: todayLoading } = useGetTodayOrdersQuery(undefined, {
    skip: !isToday
  })
  const { data: dateOrders = [], isLoading: dateLoading } = useGetOrdersByDateQuery(formattedDate, {
    skip: isToday
  })
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [createOrder] = useCreateOrderMutation()

  const orders = isToday ? todayOrders : dateOrders
  const isLoading = isToday ? todayLoading : dateLoading

  // Fetch menu items data
  const { data: menuItems = [] } = useGetMenuItemsQuery()

  // Transform orders to include sequential IDs and restaurant names
  const transformedOrders = orders?.map((order: Order, index: number) => {
    const restaurant = restaurantsData?.find(r => r._id === order.restaurantId);
    return {
      ...order,
      sequentialId: index + 1,
      restaurantName: restaurant?.name || 'Unknown Restaurant'
    };
  }) || [];

  const columns = [
    {
      accessorKey: "sequentialId",
      header: "Order ID",
    },
    {
      accessorKey: "restaurantName",
      header: "Restaurant",
    },
    {
      accessorKey: "items",
      header: "Ordered Items",
      cell: ({ row }: { row: Row }) => {
        const items = row.getValue("items") as OrderItem[];
        return (
          <div className="max-w-[300px]">
            {items.map((item, index) => {
              const menuItem = menuItems.find(mi => mi._id === item.menuItemId);
              return (
                <div key={item.menuItemId} className="text-sm">
                  {item.quantity}x - {menuItem?.title || 'Unknown Item'}
                  {index < items.length - 1 && ", "}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "orderType",
      header: "Order Type",
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }: { row: Row }) => {
        const amount = parseFloat(row.getValue("totalAmount"))
        const formatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount)
        return formatted
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row }) => {
        const status = row.getValue("status")
        return <OrderStatusBadge status={status} />
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: { row: Row }) => {
        return format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm")
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row }) => {
        const order = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const handleCreateOrder = async () => {
    try {
      if (!user?.email) {
        console.error('User email is required');
        return;
      }

      if (!newOrder.restaurantId) {
        console.error('Restaurant is required');
        return;
      }

      if (!newOrder.orderType) {
        console.error('Order type is required');
        return;
      }

      // Instead of creating order directly, navigate to menu selection
      const queryParams = new URLSearchParams({
        restaurantId: newOrder.restaurantId,
        orderType: newOrder.orderType,
        userId: user.email
      });

      // Close the dialog
      setIsCreateOrderDialogOpen(false);
      
      // Navigate to menu order page with parameters
      router.push(`/menu-order?${queryParams.toString()}`);
      
    } catch (error) {
      console.error('Failed to process order:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap()
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  // Filter orders based on search term and status
  const filteredOrders = transformedOrders.filter((order: Order & { sequentialId: number; restaurantName: string }) => {
    const matchesSearch = searchTerm
      ? order.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesStatus = selectedStatus === 'all' ? true : order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Calculate total amount from all orders
  const totalAmount = filteredOrders.reduce((sum: number, order: Order & { sequentialId: number; restaurantName: string }) => sum + order.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isToday ? "Today's Orders" : format(selectedDate, "MMMM d, yyyy") + "'s Orders"}
          </h1>
          <p className="text-gray-500">View and manage orders</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button 
            onClick={() => setIsCreateOrderDialogOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!isToday}
            title={!isToday ? "You can only create orders for today" : ""}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Create New Order
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/order-detail')} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Receipt className="h-4 w-4 mr-2" />
            View Order Summary
            <span className="ml-2 px-2 py-0.5 bg-green-700 rounded-full text-sm">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount)}
            </span>
          </Button>
        </div>
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

        <Select value={selectedStatus} onValueChange={(value: Order['status'] | 'all') => setSelectedStatus(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
      />

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Fill in the order details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restaurant" className="text-right">
                Restaurant
              </Label>
              <Select
                value={newOrder.restaurantId}
                onValueChange={(value) => setNewOrder({ ...newOrder, restaurantId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurantsData?.map((restaurant) => (
                    <SelectItem key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orderType" className="text-right">
                Order Type
              </Label>
              <Select
                value={newOrder.orderType}
                onValueChange={(value: 'Dine-in' | 'Takeaway') => setNewOrder({ ...newOrder, orderType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dine-in">Dine-in</SelectItem>
                  <SelectItem value="Takeaway">Takeaway</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={!newOrder.restaurantId || !newOrder.orderType}
            >
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
