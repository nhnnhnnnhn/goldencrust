"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  Download,
  Filter,
  ChevronDown,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  CreditCard,
  Wallet,
  RefreshCw,
  ArrowDownRight,
  Printer,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Định nghĩa các kiểu dữ liệu
interface User {
  _id: string
  name: string
  email: string
  phone: string
}

interface Order {
  _id: string
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
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
  // Thông tin bổ sung từ các bảng liên quan
  user?: User
  order?: Order
}

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

// Dữ liệu mẫu cho đơn hàng
const MOCK_ORDERS: Order[] = [
  {
    _id: "ord1",
    totalAmount: 23.96,
    status: "completed",
  },
  {
    _id: "ord2",
    totalAmount: 17.98,
    status: "pending",
  },
  {
    _id: "ord3",
    totalAmount: 32.97,
    status: "cancelled",
  },
]

// Dữ liệu mẫu cho thanh toán
const initialTransactions: Payment[] = [
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
    user: MOCK_USERS.find((user) => user._id === "user1"),
    order: MOCK_ORDERS.find((order) => order._id === "ord1"),
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
    user: MOCK_USERS.find((user) => user._id === "user2"),
    order: MOCK_ORDERS.find((order) => order._id === "ord2"),
  },
  {
    _id: "pay3",
    amount: 32.97,
    userId: "user1",
    paymentMethod: "paypal",
    transactionId: "tx_789012",
    orderId: "ord3",
    currency: "usd",
    status: "failed",
    createdBy: "user1",
    deleted: false,
    createdAt: new Date("2023-05-13T18:20:00"),
    updatedAt: new Date("2023-05-13T18:30:00"),
    user: MOCK_USERS.find((user) => user._id === "user1"),
    order: MOCK_ORDERS.find((order) => order._id === "ord3"),
  },
]

// Dữ liệu mẫu cho cài đặt thanh toán
const paymentMethods = [
  {
    id: "credit_card",
    name: "Credit Card",
    enabled: true,
    provider: "Stripe",
    fee: "2.9% + $0.30",
  },
  {
    id: "debit_card",
    name: "Debit Card",
    enabled: true,
    provider: "Stripe",
    fee: "2.9% + $0.30",
  },
  {
    id: "cash",
    name: "Cash",
    enabled: true,
    provider: "N/A",
    fee: "0%",
  },
  {
    id: "paypal",
    name: "PayPal",
    enabled: false,
    provider: "PayPal",
    fee: "2.9% + $0.30",
  },
  {
    id: "stripe",
    name: "Stripe",
    enabled: true,
    provider: "Stripe",
    fee: "2.9% + $0.30",
  },
]

// Danh sách trạng thái
const statuses = ["all", "completed", "pending", "failed"]
const statusLabels = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
}
const statusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
}
const statusIcons = {
  completed: <CheckCircle size={16} className="text-green-600" />,
  pending: <AlertCircle size={16} className="text-yellow-600" />,
  failed: <XCircle size={16} className="text-red-600" />,
}

// Danh sách phương thức thanh toán
const paymentMethodLabels = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  paypal: "PayPal",
  cash: "Cash",
  stripe: "Stripe",
}
const paymentMethodIcons = {
  credit_card: <CreditCard size={16} className="text-blue-600" />,
  debit_card: <CreditCard size={16} className="text-blue-600" />,
  paypal: <CreditCard size={16} className="text-blue-600" />,
  cash: <Wallet size={16} className="text-green-600" />,
  stripe: <CreditCard size={16} className="text-purple-600" />,
}

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState<Payment[]>(initialTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("transactions")
  const [paymentConfig, setPaymentConfig] = useState(paymentMethods)
  const [selectedTransaction, setSelectedTransaction] = useState<Payment | null>(null)
  const [isTransactionDetailsDialogOpen, setIsTransactionDetailsDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundReason, setRefundReason] = useState("")
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    to: new Date().toISOString().split("T")[0], // today
  })

  // Lọc giao dịch dựa trên tìm kiếm, trạng thái và phương thức thanh toán
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus
    const matchesPaymentMethod = selectedPaymentMethod === "all" || transaction.paymentMethod === selectedPaymentMethod

    // Lọc theo ngày
    const transactionDate = new Date(transaction.createdAt).toISOString().split("T")[0]
    const matchesDateRange = transactionDate >= dateRange.from && transactionDate <= dateRange.to

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange && !transaction.deleted
  })

  // Xử lý xem chi tiết giao dịch
  const handleViewTransaction = (transaction: Payment) => {
    setSelectedTransaction(transaction)
    setIsTransactionDetailsDialogOpen(true)
  }

  // Xử lý mở dialog hoàn tiền
  const handleOpenRefundDialog = (transaction: Payment) => {
    if (transaction.status !== "completed") {
      alert("You can only refund completed transactions")
      return
    }

    setSelectedTransaction(transaction)
    setRefundAmount(transaction.amount)
    setRefundReason("")
    setIsRefundDialogOpen(true)
  }

  // Xử lý hoàn tiền
  const handleRefund = () => {
    if (!selectedTransaction) return

    // Kiểm tra số tiền hoàn
    if (refundAmount <= 0 || refundAmount > selectedTransaction.amount) {
      alert("Invalid refund amount")
      return
    }

    // Tạo giao dịch hoàn tiền mới
    const now = new Date()
    const refundTransaction: Payment = {
      _id: `pay_refund_${Math.floor(Math.random() * 1000)}`,
      amount: -refundAmount, // Số tiền âm để thể hiện hoàn tiền
      userId: selectedTransaction.userId,
      paymentMethod: selectedTransaction.paymentMethod,
      transactionId: `refund_${Math.floor(Math.random() * 1000)}`,
      orderId: selectedTransaction.orderId,
      currency: selectedTransaction.currency,
      status: "completed",
      createdBy: "admin", // Giả định admin thực hiện hoàn tiền
      deleted: false,
      createdAt: now,
      updatedAt: now,
      user: selectedTransaction.user,
      order: selectedTransaction.order,
    }

    // Thêm giao dịch hoàn tiền vào danh sách
    setTransactions([refundTransaction, ...transactions])

    // Đóng dialog
    setIsRefundDialogOpen(false)
    setIsTransactionDetailsDialogOpen(false)

    // Thông báo thành công
    alert(`Refund of ${formatPrice(refundAmount)} has been processed successfully`)
  }

  // Xử lý cập nhật trạng thái phương thức thanh toán
  const handleTogglePaymentMethod = (id: string) => {
    setPaymentConfig(
      paymentConfig.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)),
    )
  }

  // Xử lý in hóa đơn
  const handlePrintReceipt = (transaction: Payment) => {
    // Tạo cửa sổ mới để in
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Tạo nội dung hóa đơn
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - Pizza Liêm Khiết</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .receipt {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .info-section {
            flex: 1;
          }
          .info-section h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
            color: #555;
          }
          .info-section p {
            margin: 5px 0;
          }
          .details {
            margin-bottom: 20px;
          }
          .details table {
            width: 100%;
            border-collapse: collapse;
          }
          .details th, .details td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .details th {
            background-color: #f9f9f9;
          }
          .total {
            text-align: right;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
          }
          @media print {
            body {
              width: 100%;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">Pizza Liêm Khiết</div>
            <div>123 Nguyễn Huệ, Quận 1, TP.HCM</div>
            <div>SĐT: 028-1234-5678</div>
          </div>
          
          <div class="info">
            <div class="info-section">
              <h3>Payment Information</h3>
              <p><strong>Transaction ID:</strong> ${transaction._id}</p>
              <p><strong>Order ID:</strong> ${transaction.orderId}</p>
              <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(transaction.createdAt).toLocaleTimeString()}</p>
              <p><strong>Payment Method:</strong> ${paymentMethodLabels[transaction.paymentMethod as keyof typeof paymentMethodLabels]}</p>
              <p><strong>Status:</strong> ${statusLabels[transaction.status as keyof typeof statusLabels]}</p>
            </div>
            
            <div class="info-section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${transaction.user?.name || "N/A"}</p>
              <p><strong>Email:</strong> ${transaction.user?.email || "N/A"}</p>
              <p><strong>Phone:</strong> ${transaction.user?.phone || "N/A"}</p>
            </div>
          </div>
          
          <div class="details">
            <h3>Payment Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Order #${transaction.orderId}</td>
                  <td>${formatPrice(transaction.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="total">
            <div>Total: ${formatPrice(transaction.amount)}</div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is an official receipt for your payment.</p>
            <p>www.pizzaliemkhiet.com</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Receipt
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `

    // Ghi nội dung vào cửa sổ mới
    printWindow.document.open()
    printWindow.document.write(receiptContent)
    printWindow.document.close()

    // Tự động in sau khi tải xong
    printWindow.onload = () => {
      // Chờ một chút để đảm bảo CSS được áp dụng
      setTimeout(() => {
        printWindow.focus()
        // Không tự động in để người dùng có thể xem trước
        // printWindow.print()
      }, 500)
    }
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

  // Tính tổng doanh thu
  const totalRevenue = transactions
    .filter((t) => t.status === "completed" && !t.deleted && t.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  // Tính tổng hoàn tiền
  const totalRefunds = transactions
    .filter((t) => t.status === "completed" && !t.deleted && t.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

  // Tính số giao dịch thành công
  const successfulTransactions = transactions.filter(
    (t) => t.status === "completed" && !t.deleted && t.amount > 0,
  ).length

  // Tính số giao dịch thất bại
  const failedTransactions = transactions.filter((t) => t.status === "failed" && !t.deleted).length

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="transactions">
          {/* Thẻ thống kê tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                    <p className="text-sm font-medium text-gray-500">Total Refunds</p>
                    <p className="mt-1 text-3xl font-semibold">{formatPrice(totalRefunds)}</p>
                  </div>
                  <div className="rounded-full bg-red-100 p-2 text-red-800">
                    <ArrowDownRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Successful Transactions</p>
                    <p className="mt-1 text-3xl font-semibold">{successfulTransactions}</p>
                  </div>
                  <div className="rounded-full bg-green-100 p-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Failed Transactions</p>
                    <p className="mt-1 text-3xl font-semibold">{failedTransactions}</p>
                  </div>
                  <div className="rounded-full bg-red-100 p-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thanh tìm kiếm và lọc */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by ID, customer or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
              >
                <Filter size={20} />
                <span>
                  Status: {selectedStatus === "all" ? "All" : statusLabels[selectedStatus as keyof typeof statusLabels]}
                </span>
                <ChevronDown size={16} />
              </button>

              {showStatusDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {statuses.map((status) => (
                    <div
                      key={status}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedStatus(status)
                        setShowStatusDropdown(false)
                      }}
                    >
                      {status !== "all" && statusIcons[status as keyof typeof statusIcons]}
                      {status === "all" ? "All" : statusLabels[status as keyof typeof statusLabels]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
              >
                <CreditCard size={20} />
                <span>
                  Method:{" "}
                  {selectedPaymentMethod === "all"
                    ? "All"
                    : paymentMethodLabels[selectedPaymentMethod as keyof typeof paymentMethodLabels]}
                </span>
                <ChevronDown size={16} />
              </button>

              {showPaymentMethodDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedPaymentMethod("all")
                      setShowPaymentMethodDropdown(false)
                    }}
                  >
                    All
                  </div>
                  {Object.keys(paymentMethodLabels).map((method) => (
                    <div
                      key={method}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedPaymentMethod(method)
                        setShowPaymentMethodDropdown(false)
                      }}
                    >
                      {paymentMethodIcons[method as keyof typeof paymentMethodIcons]}
                      {paymentMethodLabels[method as keyof typeof paymentMethodLabels]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="date-from" className="sr-only">
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full"
                />
              </div>
              <span>to</span>
              <div>
                <Label htmlFor="date-to" className="sr-only">
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </Button>
          </div>

          {/* Bảng giao dịch */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium">{transaction._id}</TableCell>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                      <TableCell>{transaction.user?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{transaction.orderId}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {paymentMethodIcons[transaction.paymentMethod as keyof typeof paymentMethodIcons]}
                          <span>
                            {paymentMethodLabels[transaction.paymentMethod as keyof typeof paymentMethodLabels]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={transaction.amount < 0 ? "text-red-600" : ""}>
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[transaction.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusIcons[transaction.status as keyof typeof statusIcons]}
                          <span className="ml-1">{statusLabels[transaction.status as keyof typeof statusLabels]}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewTransaction(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">View details</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintReceipt(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Print receipt</span>
                            <Printer className="h-4 w-4" />
                          </Button>
                          {transaction.status === "completed" && transaction.amount > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenRefundDialog(transaction)}
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-800"
                            >
                              <span className="sr-only">Refund</span>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure available payment methods for your customers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentConfig.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {paymentMethodIcons[method.id as keyof typeof paymentMethodIcons] || (
                              <CreditCard size={16} />
                            )}
                            {method.name}
                          </div>
                        </TableCell>
                        <TableCell>{method.provider}</TableCell>
                        <TableCell>{method.fee}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              method.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {method.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={method.enabled ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleTogglePaymentMethod(method.id)}
                          >
                            {method.enabled ? "Disable" : "Enable"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure general payment settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="VND">Vietnamese Dong (VND)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input id="tax-rate" type="number" defaultValue="10" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt-prefix">Receipt Prefix</Label>
                    <Input id="receipt-prefix" defaultValue="INV-" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt-footer">Receipt Footer Text</Label>
                    <Input id="receipt-footer" defaultValue="Thank you for your business!" />
                  </div>

                  <Button type="button" className="w-full">
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Integration</CardTitle>
              <CardDescription>Configure your payment gateway credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stripe">
                <TabsList className="mb-4">
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  <TabsTrigger value="momo">MoMo</TabsTrigger>
                </TabsList>

                <TabsContent value="stripe" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-public-key">Public Key</Label>
                      <Input id="stripe-public-key" type="password" defaultValue="pk_test_51H..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-secret-key">Secret Key</Label>
                      <Input id="stripe-secret-key" type="password" defaultValue="sk_test_51H..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                    <Input id="stripe-webhook" type="password" defaultValue="whsec_..." />
                  </div>
                  <Button type="button">Save Stripe Settings</Button>
                </TabsContent>

                <TabsContent value="paypal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypal-client-id">Client ID</Label>
                      <Input id="paypal-client-id" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypal-secret">Secret</Label>
                      <Input id="paypal-secret" type="password" />
                    </div>
                  </div>
                  <Button type="button">Save PayPal Settings</Button>
                </TabsContent>

                <TabsContent value="momo" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="momo-partner-code">Partner Code</Label>
                      <Input id="momo-partner-code" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="momo-access-key">Access Key</Label>
                      <Input id="momo-access-key" type="password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="momo-secret-key">Secret Key</Label>
                    <Input id="momo-secret-key" type="password" />
                  </div>
                  <Button type="button">Save MoMo Settings</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal chi tiết giao dịch */}
      <Dialog open={isTransactionDetailsDialogOpen} onOpenChange={setIsTransactionDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Transaction {selectedTransaction?._id}</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{selectedTransaction._id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span>{formatDateTime(selectedTransaction.createdAt)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{selectedTransaction.user?.name || "Unknown"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{selectedTransaction.orderId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className={`font-medium ${selectedTransaction.amount < 0 ? "text-red-600" : ""}`}>
                  {formatPrice(selectedTransaction.amount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <div className="flex items-center gap-1">
                  {paymentMethodIcons[selectedTransaction.paymentMethod as keyof typeof paymentMethodIcons]}
                  <span>
                    {paymentMethodLabels[selectedTransaction.paymentMethod as keyof typeof paymentMethodLabels]}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[selectedTransaction.status as keyof typeof statusColors]
                  }`}
                >
                  {statusIcons[selectedTransaction.status as keyof typeof statusIcons]}
                  <span className="ml-1">{statusLabels[selectedTransaction.status as keyof typeof statusLabels]}</span>
                </span>
              </div>

              {selectedTransaction.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">External Transaction ID:</span>
                  <span className="font-mono text-sm">{selectedTransaction.transactionId}</span>
                </div>
              )}

              {selectedTransaction.paymentMethod === "stripe" && (
                <>
                  {selectedTransaction.stripePaymentIntentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stripe Payment Intent:</span>
                      <span className="font-mono text-sm">{selectedTransaction.stripePaymentIntentId}</span>
                    </div>
                  )}
                  {selectedTransaction.stripeCustomerId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stripe Customer:</span>
                      <span className="font-mono text-sm">{selectedTransaction.stripeCustomerId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => selectedTransaction && handlePrintReceipt(selectedTransaction)}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
              {selectedTransaction?.status === "completed" && selectedTransaction.amount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTransactionDetailsDialogOpen(false)
                    selectedTransaction && handleOpenRefundDialog(selectedTransaction)
                  }}
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refund
                </Button>
              )}
            </div>
            <Button onClick={() => setIsTransactionDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal hoàn tiền */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund for transaction {selectedTransaction?._id} (Order #{selectedTransaction?.orderId})
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Refund Amount</Label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input
                    id="refund-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selectedTransaction.amount}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Maximum refund amount: {formatPrice(selectedTransaction.amount)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund-reason">Reason for Refund</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger id="refund-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="duplicate_charge">Duplicate Charge</SelectItem>
                    <SelectItem value="fraudulent">Fraudulent Charge</SelectItem>
                    <SelectItem value="order_change">Order Change</SelectItem>
                    <SelectItem value="order_cancellation">Order Cancellation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {refundReason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="refund-notes">Additional Notes</Label>
                  <Textarea id="refund-notes" placeholder="Please provide details about this refund" />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={
                !refundAmount ||
                !refundReason ||
                refundAmount <= 0 ||
                (selectedTransaction && refundAmount > selectedTransaction.amount)
              }
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
