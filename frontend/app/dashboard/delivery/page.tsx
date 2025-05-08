"use client"

import { useState } from "react"
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
} from "lucide-react"

// Dữ liệu mẫu cho đơn giao hàng
const initialDeliveries = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    orderTime: "10:30",
    estimatedDelivery: "11:15",
    status: "preparing",
    items: [
      { name: "Pizza Hải Sản Đặc Biệt", quantity: 1, price: 189000 },
      { name: "Nước Ép Cam Tươi", quantity: 2, price: 45000 },
    ],
    total: 279000,
    paymentMethod: "cash",
    notes: "Gọi trước khi giao",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    phone: "0912345678",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    orderTime: "11:45",
    estimatedDelivery: "12:30",
    status: "out_for_delivery",
    items: [
      { name: "Pizza Thịt Xông Khói", quantity: 1, price: 159000 },
      { name: "Mỳ Ý Hải Sản", quantity: 1, price: 120000 },
    ],
    total: 279000,
    paymentMethod: "card",
    notes: "",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    phone: "0923456789",
    address: "789 Võ Văn Tần, Quận 10, TP.HCM",
    orderTime: "12:15",
    estimatedDelivery: "13:00",
    status: "delivered",
    items: [
      { name: "Salad Cá Hồi", quantity: 1, price: 110000 },
      { name: "Pizza Hải Sản Đặc Biệt", quantity: 1, price: 189000 },
    ],
    total: 299000,
    paymentMethod: "cash",
    notes: "Không cần chuông cửa",
  },
  {
    id: 4,
    customerName: "Phạm Thị D",
    phone: "0934567890",
    address: "101 Nguyễn Đình Chiểu, Quận 3, TP.HCM",
    orderTime: "18:30",
    estimatedDelivery: "19:15",
    status: "preparing",
    items: [{ name: "Pizza Thịt Xông Khói", quantity: 2, price: 159000 }],
    total: 318000,
    paymentMethod: "card",
    notes: "",
  },
  {
    id: 5,
    customerName: "Hoàng Văn E",
    phone: "0945678901",
    address: "202 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
    orderTime: "19:00",
    estimatedDelivery: "19:45",
    status: "cancelled",
    items: [
      { name: "Mỳ Ý Hải Sản", quantity: 1, price: 120000 },
      { name: "Nước Ép Cam Tươi", quantity: 1, price: 45000 },
    ],
    total: 165000,
    paymentMethod: "cash",
    notes: "Khách hàng hủy đơn",
  },
]

// Danh sách trạng thái
const statuses = ["Tất cả", "preparing", "out_for_delivery", "delivered", "cancelled"]
const statusLabels = {
  preparing: "Đang chuẩn bị",
  out_for_delivery: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
}
const statusColors = {
  preparing: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}
const statusIcons = {
  preparing: <Package size={16} className="text-blue-600" />,
  out_for_delivery: <TruckIcon size={16} className="text-yellow-600" />,
  delivered: <CheckCircle size={16} className="text-green-600" />,
  cancelled: <XCircle size={16} className="text-red-600" />,
}

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false)
  const [currentDelivery, setCurrentDelivery] = useState(null)

  // Lọc đơn giao hàng dựa trên tìm kiếm và trạng thái
  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.phone.includes(searchTerm) ||
      delivery.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "Tất cả" || delivery.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Xử lý xem chi tiết đơn giao hàng
  const handleViewDetails = (delivery) => {
    setCurrentDelivery(delivery)
    setShowDeliveryDetails(true)
  }

  // Xử lý cập nhật trạng thái đơn giao hàng
  const handleUpdateStatus = (id, newStatus) => {
    setDeliveries(deliveries.map((delivery) => (delivery.id === id ? { ...delivery, status: newStatus } : delivery)))

    if (currentDelivery && currentDelivery.id === id) {
      setCurrentDelivery({ ...currentDelivery, status: newStatus })
    }
  }

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Xử lý in hóa đơn
  const handlePrintReceipt = (delivery) => {
    // Tạo cửa sổ mới để in
    const printWindow = window.open("", "_blank")

    // Tạo nội dung hóa đơn
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn - Pizza Liêm Khiết</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
          }
          .receipt {
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .info {
            margin-bottom: 15px;
          }
          .info p {
            margin: 5px 0;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 15px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total {
            font-weight: bold;
            text-align: right;
            margin-bottom: 15px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
          }
          @media print {
            body {
              width: 80mm;
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
            <p><strong>Mã đơn hàng:</strong> #${delivery.id}</p>
            <p><strong>Ngày:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
            <p><strong>Khách hàng:</strong> ${delivery.customerName}</p>
            <p><strong>SĐT:</strong> ${delivery.phone}</p>
            <p><strong>Địa chỉ:</strong> ${delivery.address}</p>
            <p><strong>Phương thức thanh toán:</strong> ${delivery.paymentMethod === "cash" ? "Tiền mặt" : "Thẻ"}</p>
          </div>
          
          <div class="items">
            ${delivery.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="total">
            <div>Tổng cộng: ${formatPrice(delivery.total)}</div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
            <p>www.pizzaliemkhiet.com</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            In hóa đơn
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Đóng
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Giao Hàng</h1>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white px-4 py-2 rounded-md transition-colors"
        >
          <RefreshCw size={18} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <Filter size={20} />
            <span>Trạng thái: {selectedStatus === "Tất cả" ? selectedStatus : statusLabels[selectedStatus]}</span>
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
                  {status !== "Tất cả" && statusIcons[status]}
                  {status === "Tất cả" ? status : statusLabels[status]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách đơn giao hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDetails(delivery)}
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{delivery.customerName}</h3>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[delivery.status]}`}
                >
                  {statusIcons[delivery.status]}
                  <span className="ml-1">{statusLabels[delivery.status]}</span>
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{delivery.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{delivery.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-red-600" />
                  <span>Đặt lúc: {delivery.orderTime}</span>
                </div>
                <div className="text-sm font-medium">{formatPrice(delivery.total)}</div>
              </div>

              <div className="text-sm text-gray-600">
                {delivery.items.length} món · {delivery.paymentMethod === "cash" ? "Tiền mặt" : "Thẻ"}
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
              <h2 className="text-xl font-bold">Chi Tiết Đơn Giao Hàng #{currentDelivery.id}</h2>
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
                  <span>{currentDelivery.phone}</span>
                </div>
                <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{currentDelivery.address}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Thông tin đơn hàng</h3>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <Clock size={16} className="text-red-600" />
                  <p>Đặt lúc: {currentDelivery.orderTime}</p>
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <TruckIcon size={16} className="text-red-600" />
                  <p>Dự kiến giao: {currentDelivery.estimatedDelivery}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[currentDelivery.status]}`}
                  >
                    {statusIcons[currentDelivery.status]}
                    <span className="ml-1">{statusLabels[currentDelivery.status]}</span>
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
                      <span>{item.name}</span>
                    </div>
                    <div>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold">
                  <div>Tổng cộng</div>
                  <div>{formatPrice(currentDelivery.total)}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Phương thức thanh toán</h3>
              <p className="text-sm">
                {currentDelivery.paymentMethod === "cash" ? "Tiền mặt khi nhận hàng" : "Thanh toán bằng thẻ"}
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
              {currentDelivery.status === "preparing" && (
                <button
                  onClick={() => handleUpdateStatus(currentDelivery.id, "out_for_delivery")}
                  className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
                >
                  Bắt đầu giao hàng
                </button>
              )}

              {currentDelivery.status === "out_for_delivery" && (
                <button
                  onClick={() => handleUpdateStatus(currentDelivery.id, "delivered")}
                  className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
                >
                  Xác nhận đã giao
                </button>
              )}

              {(currentDelivery.status === "preparing" || currentDelivery.status === "out_for_delivery") && (
                <button
                  onClick={() => handleUpdateStatus(currentDelivery.id, "cancelled")}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
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
    </div>
  )
}
