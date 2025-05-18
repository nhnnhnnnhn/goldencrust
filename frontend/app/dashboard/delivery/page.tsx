"use client"

import { useState, useEffect } from "react"
import type { ReactElement } from "react"
import {
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  TruckIcon,
  Package,
  XCircle,
  RefreshCw,
  Printer,
  AlertTriangle,
} from "lucide-react"
import { useGetAllDeliveriesQuery, useUpdateDeliveryStatusMutation } from "@/redux/api/deliveryApi"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DeliveryItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  discountPercentage: number;
  total: number;
}

interface Delivery {
  _id: string;
  deliveryStatus: 'preparing' | 'on the way' | 'delivered' | 'cancelled';
  userId: string;
  customerName: string;
  items: DeliveryItem[];
  totalAmount: number;
  expectedDeliveryTime: Date;
  notes: string;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentMethod: 'cash on delivery' | 'online payment';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Danh sách trạng thái
const statuses = ["Tất cả", "preparing", "on the way", "delivered", "cancelled"] as const
const statusLabels: Record<Delivery['deliveryStatus'], string> = {
  preparing: "Đang chuẩn bị",
  "on the way": "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
}
const statusColors: Record<Delivery['deliveryStatus'], string> = {
  preparing: "bg-blue-100 text-blue-800",
  "on the way": "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}
const statusIcons: Record<Delivery['deliveryStatus'], ReactElement> = {
  preparing: <Package size={16} className="text-blue-600" />,
  "on the way": <TruckIcon size={16} className="text-yellow-600" />,
  delivered: <CheckCircle size={16} className="text-green-600" />,
  cancelled: <XCircle size={16} className="text-red-600" />,
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth';

export default function DeliveryManagement() {
  const { data: deliveries = [], isLoading, error, refetch } = useGetAllDeliveriesQuery()
  const [updateDeliveryStatus] = useUpdateDeliveryStatusMutation()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false)
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; status: Delivery['deliveryStatus'] } | null>(null)

  // Add error logging
  useEffect(() => {
    if (error) {
      console.error('Error fetching deliveries:', error)
    }
  }, [error])

  // Add data logging
  useEffect(() => {
    console.log('Deliveries data:', deliveries)
  }, [deliveries])

  // Clear update error after 5 seconds
  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => {
        setUpdateError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [updateError])

  const filterDeliveriesByDate = (deliveries: Delivery[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.createdAt);
      
      switch (dateFilter) {
        case 'today':
          return deliveryDate >= today;
        case 'yesterday':
          return deliveryDate >= yesterday && deliveryDate < today;
        case 'thisWeek':
          return deliveryDate >= startOfWeek;
        case 'thisMonth':
          return deliveryDate >= startOfMonth;
        default:
          return true;
      }
    });
  };

  // Lọc đơn giao hàng dựa trên tìm kiếm và trạng thái
  const filteredDeliveries = filterDeliveriesByDate(deliveries).filter((delivery) => {
    if (!delivery || typeof delivery !== 'object') return false;

    const matchesSearch =
      (delivery.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (delivery.deliveryPhone || '').includes(searchTerm) ||
      (delivery.deliveryAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "Tất cả" || delivery.deliveryStatus === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Xử lý xem chi tiết đơn giao hàng
  const handleViewDetails = (delivery: Delivery) => {
    if (!delivery) return;
    setCurrentDelivery(delivery)
    setShowDeliveryDetails(true)
  }

  // Xử lý cập nhật trạng thái đơn giao hàng
  const handleUpdateStatus = async (id: string, newStatus: Delivery['deliveryStatus']) => {
    if (!id || !newStatus) {
      setUpdateError('Invalid delivery ID or status')
      return
    }

    // Set pending update and show confirmation modal
    setPendingUpdate({ id, status: newStatus })
    setShowConfirmModal(true)
  }

  // Handle confirmed update
  const handleConfirmedUpdate = async () => {
    if (!pendingUpdate) return

    try {
      setUpdateError(null)
      const result = await updateDeliveryStatus(pendingUpdate).unwrap()
      console.log('Update result:', result)
      
      if (currentDelivery && currentDelivery._id === pendingUpdate.id) {
        setCurrentDelivery({ ...currentDelivery, deliveryStatus: pendingUpdate.status })
      }
      
      // Refresh the deliveries list
      refetch()
    } catch (error: any) {
      console.error('Failed to update delivery status:', error)
      setUpdateError(error?.data?.message || 'Failed to update delivery status')
    } finally {
      setShowConfirmModal(false)
      setPendingUpdate(null)
    }
  }

  // Get confirmation message based on status
  const getConfirmMessage = (status: Delivery['deliveryStatus']) => {
    switch (status) {
      case 'on the way':
        return 'Bạn có chắc chắn muốn bắt đầu giao hàng?'
      case 'delivered':
        return 'Bạn có chắc chắn muốn xác nhận đã giao hàng?'
      case 'cancelled':
        return 'Bạn có chắc chắn muốn hủy đơn hàng này?'
      default:
        return 'Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?'
    }
  }

  // Format giá tiền
  const formatPrice = (price: number) => {
    if (typeof price !== 'number') return '0 ₫';
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Xử lý in hóa đơn
  const handlePrintReceipt = (delivery: Delivery) => {
    if (!delivery) return;

    // Tạo cửa sổ mới để in
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Tạo nội dung hóa đơn
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn - Pizza Liêm Khiết</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
            background: #fff;
            color: #333;
          }
          
          .receipt {
            padding: 15px;
            border: 1px solid #eee;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px dashed #e0e0e0;
          }
          
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #003087;
            margin-bottom: 5px;
            letter-spacing: 1px;
          }
          
          .header p {
            margin: 3px 0;
            color: #666;
            font-size: 12px;
          }
          
          .info {
            margin-bottom: 20px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          
          .info p {
            margin: 8px 0;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
          }
          
          .info p strong {
            color: #555;
            font-weight: 500;
          }
          
          .items {
            border-top: 2px dashed #e0e0e0;
            border-bottom: 2px dashed #e0e0e0;
            padding: 15px 0;
            margin-bottom: 20px;
          }
          
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
          }
          
          .item-name {
            flex: 1;
            margin-right: 10px;
          }
          
          .item-quantity {
            color: #666;
            margin: 0 5px;
          }
          
          .item-price {
            font-weight: 500;
          }
          
          .total {
            text-align: right;
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          
          .total p {
            margin: 5px 0;
            font-size: 14px;
          }
          
          .total-amount {
            font-size: 18px !important;
            font-weight: 700;
            color: #003087;
          }
          
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #e0e0e0;
          }
          
          .footer p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            margin-top: 5px;
          }
          
          .status-paid {
            background: #e6f4ea;
            color: #1e7e34;
          }
          
          .status-pending {
            background: #fff3cd;
            color: #856404;
          }
          
          .status-failed {
            background: #f8d7da;
            color: #721c24;
          }
          
          @media print {
            body {
              width: 80mm;
            }
            .no-print {
              display: none;
            }
            .receipt {
              box-shadow: none;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">Pizza Liêm Khiết</div>
            <p>123 Nguyễn Huệ, Quận 1, TP.HCM</p>
            <p>SĐT: 028-1234-5678</p>
            <p>MST: 0123456789</p>
          </div>
          
          <div class="info">
            <p><strong>Mã đơn hàng:</strong> <span>#${delivery._id.slice(-6)}</span></p>
            <p><strong>Ngày:</strong> <span>${new Date(delivery.createdAt).toLocaleDateString("vi-VN")}</span></p>
            <p><strong>Giờ:</strong> <span>${new Date(delivery.createdAt).toLocaleTimeString("vi-VN")}</span></p>
            <p><strong>Khách hàng:</strong> <span>${delivery.customerName || 'N/A'}</span></p>
            <p><strong>SĐT:</strong> <span>${delivery.deliveryPhone || 'N/A'}</span></p>
            <p><strong>Địa chỉ:</strong> <span>${delivery.deliveryAddress || 'N/A'}</span></p>
            <p><strong>Phương thức:</strong> <span>${delivery.paymentMethod === "cash on delivery" ? "Tiền mặt" : "Thanh toán online"}</span></p>
            <p><strong>Trạng thái:</strong> <span class="status-badge status-${delivery.paymentStatus}">${
              delivery.paymentStatus === "paid" ? "Đã thanh toán" : 
              delivery.paymentStatus === "pending" ? "Chờ thanh toán" : 
              "Thanh toán thất bại"
            }</span></p>
          </div>
          
          <div class="items">
            ${(delivery.items || []).map(
              (item) => `
              <div class="item">
                <span class="item-name">${item.menuItemName || 'Unknown Item'}</span>
                <span class="item-quantity">x${item.quantity || 0}</span>
                <span class="item-price">${formatPrice(item.total || 0)}</span>
              </div>
            `
            ).join("")}
          </div>
          
          <div class="total">
            <p>Tổng cộng: <span class="total-amount">${formatPrice(delivery.totalAmount || 0)}</span></p>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p>Hẹn gặp lại quý khách!</p>
            <p>Hotline: 1900-1234</p>
          </div>
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <XCircle size={48} className="text-red-500 mb-4" />
          <p className="text-red-500 mb-2">Error loading deliveries</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý giao hàng</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Trạng thái: {selectedStatus === "Tất cả" ? "Tất cả" : statusLabels[selectedStatus as Delivery['deliveryStatus']]}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-md shadow-lg z-10">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status)
                        setShowStatusDropdown(false)
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 border-b last:border-0"
                    >
                      {status !== "Tất cả" ? (
                        <>
                          <span className={`p-1.5 rounded-full ${statusColors[status as Delivery['deliveryStatus']].replace('text-', 'bg-')}`}>
                            {statusIcons[status as Delivery['deliveryStatus']]}
                          </span>
                          <span className={statusColors[status as Delivery['deliveryStatus']]}>
                            {statusLabels[status as Delivery['deliveryStatus']]}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="p-1.5 rounded-full bg-gray-100">
                            <Filter className="h-4 w-4 text-gray-600" />
                          </span>
                          <span className="text-gray-700">Tất cả</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Select
              value={dateFilter}
              onValueChange={(value: DateFilter) => setDateFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo ngày" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn hàng</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="yesterday">Hôm qua</SelectItem>
                <SelectItem value="thisWeek">Tuần này</SelectItem>
                <SelectItem value="thisMonth">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Danh sách đơn giao hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeliveries.map((delivery, index) => (
          <div
            key={delivery._id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDetails(delivery)}
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{delivery.customerName}</h3>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[delivery.deliveryStatus]}`}
                >
                  {statusIcons[delivery.deliveryStatus]}
                  <span className="ml-1">{statusLabels[delivery.deliveryStatus]}</span>
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{delivery.deliveryAddress}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{delivery.deliveryPhone}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-red-600" />
                  <span>Đặt lúc: {new Date(delivery.createdAt).toLocaleTimeString("vi-VN")}</span>
                </div>
                <div className="text-sm font-medium">{formatPrice(delivery.totalAmount)}</div>
              </div>

              <div className="text-sm text-gray-600">
                {delivery.items.length} món · {delivery.paymentMethod === "cash on delivery" ? "Tiền mặt" : "Thanh toán online"}
              </div>
            </div>
          </div>
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Không tìm thấy đơn giao hàng nào</p>
          </div>
        )}
      </div>

      {/* Modal chi tiết đơn giao hàng */}
      {showDeliveryDetails && currentDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi Tiết Đơn Giao Hàng #{currentDelivery._id.slice(-6)}</h2>
              <button onClick={() => setShowDeliveryDetails(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin khách hàng</h3>
                <p className="text-lg font-medium">{currentDelivery.customerName}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{currentDelivery.deliveryPhone}</span>
                </div>
                <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{currentDelivery.deliveryAddress}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin đơn hàng</h3>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <Clock size={16} className="text-red-600" />
                  <p>Đặt lúc: {new Date(currentDelivery.createdAt).toLocaleTimeString("vi-VN")}</p>
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <TruckIcon size={16} className="text-red-600" />
                  <p>Dự kiến giao: {new Date(currentDelivery.expectedDeliveryTime).toLocaleTimeString("vi-VN")}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[currentDelivery.deliveryStatus]}`}
                  >
                    {statusIcons[currentDelivery.deliveryStatus]}
                    <span className="ml-1">{statusLabels[currentDelivery.deliveryStatus]}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Các món đã đặt</h3>
              <div className="bg-gray-50 rounded-md p-3">
                {currentDelivery.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{item.quantity}x </span>
                      <span>{item.menuItemName}</span>
                    </div>
                    <div>{formatPrice(item.total)}</div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold">
                  <div>Tổng cộng</div>
                  <div>{formatPrice(currentDelivery.totalAmount)}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Phương thức thanh toán</h3>
              <p className="text-sm">
                {currentDelivery.paymentMethod === "cash on delivery" ? "Tiền mặt khi nhận hàng" : "Thanh toán online"}
              </p>
            </div>

            {currentDelivery.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ghi chú</h3>
                <p className="text-sm bg-gray-50 p-3 rounded">{currentDelivery.notes}</p>
              </div>
            )}

            <div className="mb-6">
              <button
                onClick={() => handlePrintReceipt(currentDelivery)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
              >
                <Printer size={18} />
                <span>In hóa đơn</span>
              </button>
            </div>

            <div className="flex justify-end gap-2">
              {currentDelivery.deliveryStatus === "preparing" && (
                <button
                  onClick={() => handleUpdateStatus(currentDelivery._id, "on the way")}
                  className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Bắt đầu giao hàng
                </button>
              )}

              {currentDelivery.deliveryStatus === "on the way" && (
                <button
                  onClick={() => handleUpdateStatus(currentDelivery._id, "delivered")}
                  className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Xác nhận đã giao
                </button>
              )}

              {(currentDelivery.deliveryStatus === "preparing" || currentDelivery.deliveryStatus === "on the way") && (
                <button
                  onClick={() => handleUpdateStatus(currentDelivery._id, "cancelled")}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Hủy đơn hàng
                </button>
              )}

              <button
                onClick={() => setShowDeliveryDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && pendingUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-yellow-500" />
              <h3 className="text-lg font-semibold">Xác nhận</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {getConfirmMessage(pendingUpdate.status)}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setPendingUpdate(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmedUpdate}
                className="px-4 py-2 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
