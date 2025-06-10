"use client"

import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast";

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  useGetPaymentsQuery, 
  useLazyGetInvoiceUrlQuery, 
  useCreateRefundMutation,
  useLazyGetCustomerDetailsQuery 
} from "@/redux/api/stripeApi";
import { Provider } from "react-redux"
import { store } from "@/redux/store"
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
  status: string // Đổi từ union type sang string để tương thích với API
}

interface Payment {
  _id: string
  amount: number
  userId: string
  paymentMethod: string // Đổi từ union type sang string để tương thích với API
  transactionId?: string
  orderId: string
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  stripeChargeId?: string
  stripePaymentMethodId?: string
  currency: string
  status: string // Đổi từ union type sang string để tương thích với API
  createdBy?: string
  updatedBy?: string
  deleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
  // Thông tin bổ sung từ các bảng liên quan
  user?: User
  order?: Order
  // Thông tin khách hàng nhập khi thanh toán
  customerName?: string
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

// Danh sách trạng thái
const statuses = ["all", "completed", "pending", "failed", "refunded"]
const statusLabels = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
}
const statusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
}
const statusIcons = {
  completed: <CheckCircle size={16} className="text-green-600" />,
  pending: <AlertCircle size={16} className="text-yellow-600" />,
  failed: <XCircle size={16} className="text-red-600" />,
  refunded: <RefreshCw size={16} className="text-blue-600" />,
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

const PaymentContent = () => {
  // Khởi tạo các biến trạng thái cơ bản
  const [transactions, setTransactions] = useState<Payment[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  
  // Hàm định dạng giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  // Khởi tạo các lazy query hook
  const [getInvoiceUrl] = useLazyGetInvoiceUrlQuery();
  const [getCustomerDetails] = useLazyGetCustomerDetailsQuery();
  const [createRefund, { isLoading: isRefunding }] = useCreateRefundMutation();
  
  // Lấy dữ liệu thanh toán từ API
  const { data: paymentData, isLoading, isFetching, error } = useGetPaymentsQuery({
    page,
    limit,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    search: searchTerm || undefined,
    paymentMethod: selectedPaymentMethod === 'all' ? undefined : selectedPaymentMethod,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
  })
  
  // State để lưu tạm thời các khách hàng đã lấy thành công
  const [loadedCustomers, setLoadedCustomers] = useState<Record<string, string>>({});
  
  // Cập nhật danh sách giao dịch khi dữ liệu từ API thay đổi
  useEffect(() => {
    if (paymentData?.payments) {
      // Lấy danh sách giao dịch và cập nhật state
      setTransactions(paymentData.payments);
    }
  }, [paymentData]);
  
  // Tích hợp lấy thông tin khách hàng bằng RTK Query
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      // Chỉ lấy các giao dịch chưa có tên khách hàng và chưa được lấy trước đó
      const transactionsNeedCustomerInfo = transactions.filter(transaction => 
        transaction.stripePaymentIntentId && 
        !transaction.customerName && 
        !loadedCustomers[transaction.stripePaymentIntentId]
      );
      
      if (transactionsNeedCustomerInfo.length === 0) return;
      
      // Log số lượng cần xử lý
      console.log(`Fetching customer details for ${transactionsNeedCustomerInfo.length} transactions`);
      
      // Lấy thông tin khách hàng cho mỗi giao dịch
      for (const transaction of transactionsNeedCustomerInfo) {
        try {
          // Thêm timestamp để tránh cache
          const timestamp = Date.now();
          const { data } = await getCustomerDetails(`${transaction.stripePaymentIntentId}?_t=${timestamp}`);
          
          if (data?.success && data?.customerName) {
            console.log(`Got customer name: ${data.customerName} for payment ${transaction._id}`);
            
            // Cập nhật giao dịch với tên khách hàng
            setTransactions(current => 
              current.map(t => t._id === transaction._id ? 
                { ...t, customerName: data.customerName } : t)
            );
            
            // Cập nhật danh sách khách hàng đã xử lý
            setLoadedCustomers(prev => ({
              ...prev, 
              [transaction.stripePaymentIntentId as string]: data.customerName
            }));
          }
        } catch (error) {
          console.error(`Error fetching customer details for ${transaction._id}:`, error);
        }
      }
    };
    
    // Chỉ gọi khi transactions thay đổi
    if (transactions.length > 0) {
      fetchCustomerDetails();
    }
  }, [transactions, getCustomerDetails, loadedCustomers]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("transactions")

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

  // Xử lý hoàn tiền thông qua API Stripe
  const handleRefund = async () => {
    if (!selectedTransaction || !selectedTransaction.stripePaymentIntentId) return

    // Kiểm tra số tiền hoàn
    if (refundAmount <= 0 || refundAmount > selectedTransaction.amount) {
      toast.error("Số tiền hoàn không hợp lệ")
      return
    }

    try {
      // Hiển thị trạng thái đang xử lý
      toast.loading("\u0110ang xử lý hoàn tiền...")
      
      // Gọi API Stripe để thực hiện hoàn tiền
      const response = await createRefund({
        paymentId: selectedTransaction.stripePaymentIntentId,
        amount: refundAmount,
        reason: refundReason
      }).unwrap()
      
      if (response.success) {
        // Cập nhật giao dịch hiện tại thành refunded và amount = 0
        const now = new Date()
        
        // Tạo bản sao của transactions với giao dịch được cập nhật
        const updatedTransactions = transactions.map(transaction => {
          if (transaction._id === selectedTransaction._id) {
            return {
              ...transaction,
              status: "refunded",
              amount: 0,
              updatedAt: now
            }
          }
          return transaction
        })

        // Cập nhật danh sách giao dịch
        setTransactions(updatedTransactions)

        // Đóng dialog
        setIsRefundDialogOpen(false)
        setIsTransactionDetailsDialogOpen(false)

        // Thông báo thành công
        toast.dismiss()
        toast.success(`Đã hoàn ${formatPrice(refundAmount)} thành công`)
      } else {
        toast.dismiss()
        toast.error("Có lỗi xảy ra khi hoàn tiền")
      }
    } catch (error) {
      toast.dismiss()
      toast.error(`Lỗi: ${error instanceof Error ? error.message : "Không thể hoàn tiền"}`)
      console.error("Refund error:", error)
    }
  }

  // Xử lý xem hóa đơn PDF từ Stripe

  // Xử lý xem hóa đơn PDF từ Stripe
  const handlePrintReceipt = async (transaction: Payment) => {
    try {
      // Hiển thị trạng thái đang tải
      toast.loading('Đang lấy hóa đơn từ Stripe...');
      
      // Kiểm tra có ID thanh toán không
      if (!transaction.stripePaymentIntentId) {
        toast.dismiss();
        toast.error('Không tìm thấy thông tin thanh toán Stripe');
        return;
      }
      
      // Gọi API lấy URL hóa đơn từ Stripe sử dụng lazy query
      const response = await getInvoiceUrl(transaction.stripePaymentIntentId);
      
      if (response.error || !response.data?.invoiceUrl) {
        toast.dismiss();
        toast.error('Không tìm thấy hóa đơn cho giao dịch này');
        return;
      }
      
      // Mở URL trong tab mới
      window.open(response.data.invoiceUrl, '_blank');
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error('Lỗi khi lấy hóa đơn: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
      console.error('Error getting invoice:', error);
    }
  }

  // Format ngày giờ
  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Kiểm tra xem dateObj có phải là Date hợp lệ không
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <p>Loading transactions...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center gap-2 text-red-600">
                            <AlertCircle className="h-8 w-8" />
                            <p>Error loading transactions. Please try again.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <p className="text-muted-foreground">No transactions found matching your filters.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-medium">{transaction._id}</TableCell>
                          <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{transaction.customerName || transaction.user?.name || "Unknown"}</div>
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
                      ))
                    )}
                    {isFetching && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={8} className="border-t">
                          <div className="flex items-center justify-center py-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span className="ml-2 text-xs">Updating...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal chi tiết giao dịch */}
      <Dialog
        open={isTransactionDetailsDialogOpen}
        onOpenChange={(open) => setIsTransactionDetailsDialogOpen(open)}
      >
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
      <Dialog
        open={isRefundDialogOpen}
        onOpenChange={(open) => setIsRefundDialogOpen(open)}
      >
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
                (!!selectedTransaction && refundAmount > selectedTransaction.amount)
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

export default function PaymentManagement() {
  return (
    <Provider store={store}>
      <PaymentContent />
    </Provider>
  )
}
