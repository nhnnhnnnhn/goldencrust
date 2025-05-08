"use client"

import { useState } from "react"
// Thêm import Link từ next/link
import Link from "next/link"
import {
  PlusCircle,
  Search,
  Filter,
  ChevronDown,
  X,
  Users,
  CheckCircle,
  XCircle,
  Utensils,
  Printer,
} from "lucide-react"

// Dữ liệu mẫu cho các bàn
const initialTables = [
  {
    id: 1,
    tableNumber: "A1",
    capacity: 4,
    status: "available", // available, occupied, reserved
    location: "Main Hall",
    reservationTime: null,
    customerName: null,
  },
  {
    id: 2,
    tableNumber: "A2",
    capacity: 2,
    status: "occupied",
    location: "Main Hall",
    reservationTime: "12:30",
    customerName: "Nguyễn Văn A",
  },
  {
    id: 3,
    tableNumber: "A3",
    capacity: 6,
    status: "reserved",
    location: "Main Hall",
    reservationTime: "18:00",
    customerName: "Trần Thị B",
  },
  {
    id: 4,
    tableNumber: "B1",
    capacity: 4,
    status: "available",
    location: "Terrace",
    reservationTime: null,
    customerName: null,
  },
  {
    id: 5,
    tableNumber: "B2",
    capacity: 8,
    status: "occupied",
    location: "Terrace",
    reservationTime: "13:45",
    customerName: "Lê Văn C",
  },
  {
    id: 6,
    tableNumber: "C1",
    capacity: 2,
    status: "available",
    location: "Private Room",
    reservationTime: null,
    customerName: null,
  },
  {
    id: 7,
    tableNumber: "C2",
    capacity: 10,
    status: "reserved",
    location: "Private Room",
    reservationTime: "19:30",
    customerName: "Phạm Thị D",
  },
  {
    id: 8,
    tableNumber: "D1",
    capacity: 4,
    status: "available",
    location: "Bar Area",
    reservationTime: null,
    customerName: null,
  },
]

// Danh sách các khu vực
const locations = ["All", "Main Hall", "Terrace", "Private Room", "Bar Area"]

// Danh sách trạng thái
const statuses = ["All", "available", "occupied", "reserved"]
const statusLabels = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
}
const statusColors = {
  available: "bg-green-100 text-green-800",
  occupied: "bg-red-100 text-red-800",
  reserved: "bg-yellow-100 text-yellow-800",
}
const statusIcons = {
  available: <CheckCircle size={16} className="text-green-600" />,
  occupied: <XCircle size={16} className="text-red-600" />,
  reserved: <Users size={16} className="text-yellow-600" />,
}

export default function TableManagement() {
  const [tables, setTables] = useState(initialTables)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentTable, setCurrentTable] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tableToDelete, setTableToDelete] = useState(null)
  const [showTableDetails, setShowTableDetails] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)

  // Lọc các bàn dựa trên tìm kiếm, trạng thái và khu vực
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.customerName && table.customerName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = selectedStatus === "All" || table.status === selectedStatus
    const matchesLocation = selectedLocation === "All" || table.location === selectedLocation

    return matchesSearch && matchesStatus && matchesLocation
  })

  // Xử lý thêm bàn mới
  const handleAddTable = () => {
    setCurrentTable({
      id: tables.length + 1,
      tableNumber: "",
      capacity: 4,
      status: "available",
      location: "Main Hall",
      reservationTime: null,
      customerName: null,
    })
    setShowAddEditModal(true)
  }

  // Xử lý chỉnh sửa bàn
  const handleEditTable = (table) => {
    setCurrentTable(table)
    setShowAddEditModal(true)
  }

  // Xử lý xóa bàn
  const handleDeleteClick = (table) => {
    setTableToDelete(table)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    setTables(tables.filter((table) => table.id !== tableToDelete.id))
    setShowDeleteConfirm(false)
    setTableToDelete(null)
  }

  // Xử lý lưu bàn (thêm mới hoặc cập nhật)
  const handleSaveTable = (table) => {
    if (tables.find((t) => t.id === table.id)) {
      // Cập nhật bàn hiện có
      setTables(tables.map((t) => (t.id === table.id ? table : t)))
    } else {
      // Thêm bàn mới
      setTables([...tables, table])
    }
    setShowAddEditModal(false)
    setCurrentTable(null)
  }

  // Xử lý xem chi tiết bàn
  const handleViewDetails = (table) => {
    setSelectedTable(table)
    setShowTableDetails(true)
  }

  // Xử lý cập nhật trạng thái bàn
  const handleUpdateStatus = (id, newStatus) => {
    setTables(
      tables.map((table) => {
        if (table.id === id) {
          const updatedTable = { ...table, status: newStatus }

          // Nếu bàn trở thành available, xóa thông tin đặt bàn
          if (newStatus === "available") {
            updatedTable.reservationTime = null
            updatedTable.customerName = null
          }

          return updatedTable
        }
        return table
      }),
    )

    if (selectedTable && selectedTable.id === id) {
      const updatedTable = { ...selectedTable, status: newStatus }
      if (newStatus === "available") {
        updatedTable.reservationTime = null
        updatedTable.customerName = null
      }
      setSelectedTable(updatedTable)
    }
  }

  // Xử lý in hóa đơn cho bàn
  const handlePrintTableReceipt = (table) => {
    // Tạo dữ liệu mẫu cho hóa đơn
    const orderItems = [
      { name: "Pizza Hải Sản Đặc Biệt", quantity: 1, price: 189000 },
      { name: "Mỳ Ý Sốt Bò Bằm", quantity: 1, price: 120000 },
      { name: "Nước Ép Cam Tươi", quantity: 2, price: 45000 },
    ]

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
            <p><strong>Bàn:</strong> ${table.tableNumber}</p>
            <p><strong>Ngày:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
            <p><strong>Giờ:</strong> ${new Date().toLocaleTimeString("vi-VN")}</p>
            <p><strong>Khách hàng:</strong> ${table.customerName || "Khách lẻ"}</p>
          </div>
          
          <div class="items">
            ${orderItems
              .map(
                (item) => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price * item.quantity)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="total">
            <div>Tổng cộng: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}</div>
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
        <h1 className="text-2xl font-bold">Table Management</h1>
        <button
          onClick={handleAddTable}
          className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white px-4 py-2.5 rounded-md transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by table number or customer name..."
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
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <Filter size={20} />
            <span>Location: {selectedLocation}</span>
            <ChevronDown size={16} />
          </button>

          {showLocationDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {locations.map((location) => (
                <div
                  key={location}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedLocation(location)
                    setShowLocationDropdown(false)
                  }}
                >
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị bàn dạng lưới */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDetails(table)}
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Table {table.tableNumber}</h3>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[table.status]}`}
                >
                  {statusIcons[table.status]}
                  <span className="ml-1">{statusLabels[table.status]}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Users size={16} />
                <span>Capacity: {table.capacity}</span>
              </div>

              <div className="text-sm text-gray-600">
                <span>Location: {table.location}</span>
              </div>
            </div>

            {table.status !== "available" && (
              <div className="p-4 bg-gray-50">
                {table.customerName && <div className="text-sm font-medium">{table.customerName}</div>}
                {table.reservationTime && <div className="text-sm text-gray-600">Time: {table.reservationTime}</div>}
              </div>
            )}
          </div>
        ))}

        {filteredTables.length === 0 && (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <Users size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No tables found</p>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa bàn */}
      {showAddEditModal && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {tables.find((t) => t.id === currentTable.id) ? "Edit Table" : "Add New Table"}
              </h2>
              <button onClick={() => setShowAddEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <input
                  type="text"
                  value={currentTable.tableNumber}
                  onChange={(e) => setCurrentTable({ ...currentTable, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={currentTable.capacity}
                  onChange={(e) => setCurrentTable({ ...currentTable, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={currentTable.location}
                  onChange={(e) => setCurrentTable({ ...currentTable, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations
                    .filter((loc) => loc !== "All")
                    .map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={currentTable.status}
                  onChange={(e) => {
                    const newStatus = e.target.value
                    const updatedTable = { ...currentTable, status: newStatus }

                    // Nếu bàn trở thành available, xóa thông tin đặt bàn
                    if (newStatus === "available") {
                      updatedTable.reservationTime = null
                      updatedTable.customerName = null
                    }

                    setCurrentTable(updatedTable)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses
                    .filter((status) => status !== "All")
                    .map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                </select>
              </div>

              {currentTable.status !== "available" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={currentTable.customerName || ""}
                      onChange={(e) => setCurrentTable({ ...currentTable, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reservation Time</label>
                    <input
                      type="text"
                      value={currentTable.reservationTime || ""}
                      onChange={(e) => setCurrentTable({ ...currentTable, reservationTime: e.target.value })}
                      placeholder="e.g. 18:30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTable(currentTable)}
                className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && tableToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete Table {tableToDelete.tableNumber}?</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết bàn */}
      {showTableDetails && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Table {selectedTable.tableNumber} Details</h2>
              <button onClick={() => setShowTableDetails(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedTable.status]}`}
                >
                  {statusIcons[selectedTable.status]}
                  <span className="ml-1">{statusLabels[selectedTable.status]}</span>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span>{selectedTable.capacity} people</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span>{selectedTable.location}</span>
              </div>

              {selectedTable.status !== "available" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span>{selectedTable.customerName}</span>
                  </div>

                  {selectedTable.reservationTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>{selectedTable.reservationTime}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedTable.status === "occupied" && (
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => handlePrintTableReceipt(selectedTable)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266] transition-colors"
                >
                  <Printer size={18} />
                  <span>In hóa đơn</span>
                </button>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-700">Change Status</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, "available")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                    selectedTable.status === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800"
                  }`}
                  disabled={selectedTable.status === "available"}
                >
                  Available
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, "occupied")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                    selectedTable.status === "occupied"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800 hover:bg-red-100 hover:text-red-800"
                  }`}
                  disabled={selectedTable.status === "occupied"}
                >
                  Occupied
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, "reserved")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                    selectedTable.status === "reserved"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800 hover:bg-yellow-100 hover:text-yellow-800"
                  }`}
                  disabled={selectedTable.status === "reserved"}
                >
                  Reserved
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href={`/dashboard/table-order/${selectedTable.id}?tableNumber=${selectedTable.tableNumber}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266] transition-colors"
              >
                <Utensils size={18} />
                <span>Place Order for This Table</span>
              </Link>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowTableDetails(false)
                    handleEditTable(selectedTable)
                  }}
                  className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowTableDetails(false)
                    handleDeleteClick(selectedTable)
                  }}
                  className="px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
