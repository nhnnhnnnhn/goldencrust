"use client"

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
  Calendar,
} from "lucide-react"

// Dữ liệu mẫu cho giao dịch thanh toán
const initialTransactions = [
  {
    id: "TRX-001",
    date: "2023-05-15",
    time: "18:45",
    amount: 450000,
    method: "card",
    status: "completed",
    customer: "Nguyễn Văn A",
    description: "Payment for order #ORD-123",
  },
  {
    id: "TRX-002",
    date: "2023-05-15",
    time: "19:30",
    amount: 320000,
    method: "cash",
    status: "completed",
    customer: "Trần Thị B",
    description: "Payment for order #ORD-124",
  },
  {
    id: "TRX-003",
    date: "2023-05-16",
    time: "12:15",
    amount: 780000,
    method: "card",
    status: "failed",
    customer: "Lê Văn C",
    description: "Payment for order #ORD-125",
  },
  {
    id: "TRX-004",
    date: "2023-05-16",
    time: "14:20",
    amount: 560000,
    method: "cash",
    status: "completed",
    customer: "Phạm Thị D",
    description: "Payment for order #ORD-126",
  },
  {
    id: "TRX-005",
    date: "2023-05-17",
    time: "20:10",
    amount: 1250000,
    method: "card",
    status: "pending",
    customer: "Hoàng Văn E",
    description: "Payment for order #ORD-127",
  },
]

// Dữ liệu mẫu cho cài đặt thanh toán
const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    enabled: true,
    provider: "Stripe",
    fee: "2.9% + 3,000 VND",
  },
  {
    id: "cash",
    name: "Cash",
    enabled: true,
    provider: "N/A",
    fee: "0%",
  },
  {
    id: "momo",
    name: "MoMo",
    enabled: false,
    provider: "MoMo",
    fee: "2.5%",
  },
  {
    id: "zalopay",
    name: "ZaloPay",
    enabled: false,
    provider: "ZaloPay",
    fee: "2.5%",
  },
]

// Danh sách trạng thái
const statuses = ["All", "completed", "pending", "failed"]
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

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("transactions")
  const [paymentConfig, setPaymentConfig] = useState(paymentMethods)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // Lọc giao dịch dựa trên tìm kiếm và trạng thái
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "All" || transaction.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Xử lý xem chi tiết giao dịch
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetails(true)
  }

  // Xử lý cập nhật trạng thái phương thức thanh toán
  const handleTogglePaymentMethod = (id) => {
    setPaymentConfig(
      paymentConfig.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)),
    )
  }

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Tính tổng doanh thu
  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  // Tính số giao dịch thành công
  const successfulTransactions = transactions.filter((t) => t.status === "completed").length

  // Tính số giao dịch thất bại
  const failedTransactions = transactions.filter((t) => t.status === "failed").length

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                placeholder="Search by ID, customer or description..."
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
                <span>Status: {selectedStatus}</span>
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
                      {status !== "All" && statusIcons[status]}
                      {status === "All" ? status : statusLabels[status]}
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        {transaction.date} {transaction.time}
                      </TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{formatPrice(transaction.amount)}</TableCell>
                      <TableCell className="capitalize">{transaction.method}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[transaction.status]}`}
                        >
                          {statusIcons[transaction.status]}
                          <span className="ml-1">{statusLabels[transaction.status]}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">View details</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
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
                        <TableCell className="font-medium">{method.name}</TableCell>
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
                    <select
                      id="currency"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="VND">Vietnamese Dong (VND)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
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
      {showTransactionDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button onClick={() => setShowTransactionDetails(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{selectedTransaction.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span>
                  {selectedTransaction.date} {selectedTransaction.time}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{selectedTransaction.customer}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatPrice(selectedTransaction.amount)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{selectedTransaction.method}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[selectedTransaction.status]
                  }`}
                >
                  {statusIcons[selectedTransaction.status]}
                  <span className="ml-1">{statusLabels[selectedTransaction.status]}</span>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span>{selectedTransaction.description}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                <span>Download Receipt</span>
              </Button>
              <Button onClick={() => setShowTransactionDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
