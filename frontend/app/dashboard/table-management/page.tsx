"use client"

import { useState } from "react"
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
  Building,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Định nghĩa kiểu dữ liệu cho Restaurant
interface Restaurant {
  _id: string
  address: string
  tableNumber: number
  deleted?: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Định nghĩa kiểu dữ liệu cho Table
interface Table {
  _id: string
  restaurantId: string
  tableNumber: string
  capacity: number
  status: "available" | "reserved" | "occupied"
  location: string
  customerName?: string | null
  reservationTime?: string | null
  deleted?: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Dữ liệu mẫu cho các nhà hàng
const initialRestaurants: Restaurant[] = [
  {
    _id: "rest1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    tableNumber: 15,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "rest2",
    address: "456 Lê Lợi, Quận 1, TP.HCM",
    tableNumber: 10,
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    _id: "rest3",
    address: "789 Đồng Khởi, Quận 1, TP.HCM",
    tableNumber: 8,
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
  },
]

// Dữ liệu mẫu cho các bàn
const initialTables: Table[] = [
  {
    _id: "table1",
    restaurantId: "rest1",
    tableNumber: "A1",
    capacity: 4,
    status: "available",
    location: "Main Hall",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table2",
    restaurantId: "rest1",
    tableNumber: "A2",
    capacity: 2,
    status: "occupied",
    location: "Main Hall",
    customerName: "Nguyễn Văn A",
    reservationTime: "12:30",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table3",
    restaurantId: "rest1",
    tableNumber: "A3",
    capacity: 6,
    status: "reserved",
    location: "Main Hall",
    customerName: "Trần Thị B",
    reservationTime: "18:00",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table4",
    restaurantId: "rest1",
    tableNumber: "B1",
    capacity: 4,
    status: "available",
    location: "Terrace",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table5",
    restaurantId: "rest1",
    tableNumber: "B2",
    capacity: 8,
    status: "occupied",
    location: "Terrace",
    customerName: "Lê Văn C",
    reservationTime: "13:45",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table6",
    restaurantId: "rest2",
    tableNumber: "C1",
    capacity: 2,
    status: "available",
    location: "Private Room",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    _id: "table7",
    restaurantId: "rest2",
    tableNumber: "C2",
    capacity: 10,
    status: "reserved",
    location: "Private Room",
    customerName: "Phạm Thị D",
    reservationTime: "19:30",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    _id: "table8",
    restaurantId: "rest3",
    tableNumber: "D1",
    capacity: 4,
    status: "available",
    location: "Bar Area",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
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
  const { toast } = useToast()
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(initialRestaurants[0]._id)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentTable, setCurrentTable] = useState<Partial<Table> | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const [showTableDetails, setShowTableDetails] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showRestaurantModal, setShowRestaurantModal] = useState(false)
  const [currentRestaurant, setCurrentRestaurant] = useState<Partial<Restaurant> | null>(null)
  const [showDeleteRestaurantConfirm, setShowDeleteRestaurantConfirm] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null)

  // Lọc các bàn dựa trên nhà hàng đã chọn, tìm kiếm, trạng thái và khu vực
  const filteredTables = tables.filter((table) => {
    const matchesRestaurant = table.restaurantId === selectedRestaurant
    const matchesSearch =
      table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.customerName && table.customerName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = selectedStatus === "All" || table.status === selectedStatus
    const matchesLocation = selectedLocation === "All" || table.location === selectedLocation

    return matchesRestaurant && matchesSearch && matchesStatus && matchesLocation
  })

  // Xử lý thêm bàn mới
  const handleAddTable = () => {
    setCurrentTable({
      restaurantId: selectedRestaurant,
      tableNumber: "",
      capacity: 4,
      status: "available",
      location: "Main Hall",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    setShowAddEditModal(true)
  }

  // Xử lý chỉnh sửa bàn
  const handleEditTable = (table: Table) => {
    setCurrentTable({ ...table })
    setShowAddEditModal(true)
  }

  // Xử lý xóa bàn
  const handleDeleteClick = (table: Table) => {
    setTableToDelete(table)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (!tableToDelete) return

    // Trong thực tế, đây sẽ là API call để soft delete
    const updatedTables = tables.map((table) => {
      if (table._id === tableToDelete._id) {
        return {
          ...table,
          deleted: true,
          deletedAt: new Date(),
        }
      }
      return table
    })

    // Lọc ra các bàn chưa bị xóa để hiển thị
    setTables(updatedTables.filter((table) => !table.deleted))
    setShowDeleteConfirm(false)
    setTableToDelete(null)

    toast({
      title: "Xóa bàn thành công",
      description: `Bàn ${tableToDelete.tableNumber} đã được xóa.`,
    })
  }

  // Xử lý lưu bàn (thêm mới hoặc cập nhật)
  const handleSaveTable = () => {
    if (!currentTable) return

    const now = new Date()

    if (currentTable._id) {
      // Cập nhật bàn hiện có
      setTables(
        tables.map((table) =>
          table._id === currentTable._id ? ({ ...table, ...currentTable, updatedAt: now } as Table) : table,
        ),
      )
      toast({
        title: "Cập nhật bàn thành công",
        description: `Bàn ${currentTable.tableNumber} đã được cập nhật.`,
      })
    } else {
      // Thêm bàn mới
      const newTable: Table = {
        _id: `table${tables.length + 1}`,
        ...(currentTable as Omit<Table, "_id">),
        createdAt: now,
        updatedAt: now,
      } as Table

      setTables([...tables, newTable])
      toast({
        title: "Thêm bàn thành công",
        description: `Bàn ${newTable.tableNumber} đã được thêm.`,
      })
    }

    setShowAddEditModal(false)
    setCurrentTable(null)
  }

  // Xử lý xem chi tiết bàn
  const handleViewDetails = (table: Table) => {
    setSelectedTable(table)
    setShowTableDetails(true)
  }

  // Xử lý cập nhật trạng thái bàn
  const handleUpdateStatus = (id: string, newStatus: "available" | "occupied" | "reserved") => {
    setTables(
      tables.map((table) => {
        if (table._id === id) {
          const updatedTable = { ...table, status: newStatus, updatedAt: new Date() }

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

    if (selectedTable && selectedTable._id === id) {
      const updatedTable = { ...selectedTable, status: newStatus, updatedAt: new Date() }
      if (newStatus === "available") {
        updatedTable.reservationTime = null
        updatedTable.customerName = null
      }
      setSelectedTable(updatedTable)
    }

    toast({
      title: "Cập nhật trạng thái thành công",
      description: `Trạng thái bàn đã được cập nhật thành ${statusLabels[newStatus]}.`,
    })
  }

  // Xử lý thêm nhà hàng mới
  const handleAddRestaurant = () => {
    setCurrentRestaurant({
      address: "",
      tableNumber: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    setShowRestaurantModal(true)
  }

  // Xử lý chỉnh sửa nhà hàng
  const handleEditRestaurant = (restaurant: Restaurant) => {
    setCurrentRestaurant({ ...restaurant })
    setShowRestaurantModal(true)
  }

  // Xử lý xóa nhà hàng
  const handleDeleteRestaurantClick = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant)
    setShowDeleteRestaurantConfirm(true)
  }

  const confirmDeleteRestaurant = () => {
    if (!restaurantToDelete) return

    // Trong thực tế, đây sẽ là API call để soft delete
    const updatedRestaurants = restaurants.map((restaurant) => {
      if (restaurant._id === restaurantToDelete._id) {
        return {
          ...restaurant,
          deleted: true,
          deletedAt: new Date(),
        }
      }
      return restaurant
    })

    // Lọc ra các nhà hàng chưa bị xóa để hiển thị
    setRestaurants(updatedRestaurants.filter((restaurant) => !restaurant.deleted))

    // Nếu nhà hàng bị xóa là nhà hàng đang được chọn, chọn nhà hàng khác
    if (selectedRestaurant === restaurantToDelete._id) {
      const availableRestaurants = updatedRestaurants.filter((restaurant) => !restaurant.deleted)
      if (availableRestaurants.length > 0) {
        setSelectedRestaurant(availableRestaurants[0]._id)
      } else {
        setSelectedRestaurant("")
      }
    }

    setShowDeleteRestaurantConfirm(false)
    setRestaurantToDelete(null)

    toast({
      title: "Xóa nhà hàng thành công",
      description: `Nhà hàng tại ${restaurantToDelete.address} đã được xóa.`,
    })
  }

  // Xử lý lưu nhà hàng (thêm mới hoặc cập nhật)
  const handleSaveRestaurant = () => {
    if (!currentRestaurant) return

    const now = new Date()

    if (currentRestaurant._id) {
      // Cập nhật nhà hàng hiện có
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === currentRestaurant._id
            ? ({ ...restaurant, ...currentRestaurant, updatedAt: now } as Restaurant)
            : restaurant,
        ),
      )
      toast({
        title: "Cập nhật nhà hàng thành công",
        description: `Nhà hàng tại ${currentRestaurant.address} đã được cập nhật.`,
      })
    } else {
      // Thêm nhà hàng mới
      const newRestaurant: Restaurant = {
        _id: `rest${restaurants.length + 1}`,
        ...(currentRestaurant as Omit<Restaurant, "_id">),
        createdAt: now,
        updatedAt: now,
      } as Restaurant

      setRestaurants([...restaurants, newRestaurant])
      setSelectedRestaurant(newRestaurant._id)
      toast({
        title: "Thêm nhà hàng thành công",
        description: `Nhà hàng tại ${newRestaurant.address} đã được thêm.`,
      })
    }

    setShowRestaurantModal(false)
    setCurrentRestaurant(null)
  }

  // Xử lý in hóa đơn cho bàn
  const handlePrintTableReceipt = (table: Table) => {
    // Tạo dữ liệu mẫu cho hóa đơn
    const orderItems = [
      { name: "Pizza Hải Sản Đặc Biệt", quantity: 1, price: 189000 },
      { name: "Mỳ Ý Sốt Bò Bằm", quantity: 1, price: 120000 },
      { name: "Nước Ép Cam Tươi", quantity: 2, price: 45000 },
    ]

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Tạo cửa sổ mới để in
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Tìm thông tin nhà hàng
    const restaurant = restaurants.find((r) => r._id === table.restaurantId)
    const restaurantAddress = restaurant ? restaurant.address : "Địa chỉ không xác định"

    // Tạo nội dung hóa đơn
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn - Golden Crust</title>
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
            <div class="logo">Golden Crust</div>
            <div>${restaurantAddress}</div>
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
            <p>www.goldencrust.com</p>
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
        <div className="flex gap-2">
          <Button
            onClick={handleAddRestaurant}
            className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
          >
            <Building size={20} />
            <span>Add Restaurant</span>
          </Button>
          <Button
            onClick={handleAddTable}
            className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
            disabled={!selectedRestaurant}
          >
            <PlusCircle size={20} />
            <span>Add Table</span>
          </Button>
        </div>
      </div>

      {/* Chọn nhà hàng */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Restaurant</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedRestaurant === restaurant._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedRestaurant(restaurant._id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building size={18} className="text-blue-600" />
                    <span className="font-medium">Restaurant {restaurant._id.replace("rest", "#")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <MapPin size={16} />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="text-sm text-gray-600">Tables: {restaurant.tableNumber}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditRestaurant(restaurant)
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRestaurantClick(restaurant)
                    }}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            key={table._id}
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
              <h2 className="text-xl font-bold">{currentTable._id ? "Edit Table" : "Add New Table"}</h2>
              <button onClick={() => setShowAddEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
                <Select
                  value={currentTable.restaurantId}
                  onValueChange={(value) => setCurrentTable({ ...currentTable, restaurantId: value })}
                  disabled={!!currentTable._id} // Không cho phép đổi nhà hàng khi chỉnh sửa bàn
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant._id} value={restaurant._id}>
                        {restaurant.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <Input
                  type="text"
                  value={currentTable.tableNumber || ""}
                  onChange={(e) => setCurrentTable({ ...currentTable, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <Input
                  type="number"
                  value={currentTable.capacity || 0}
                  onChange={(e) => setCurrentTable({ ...currentTable, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Select
                  value={currentTable.location}
                  onValueChange={(value) => setCurrentTable({ ...currentTable, location: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter((loc) => loc !== "All")
                      .map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={currentTable.status}
                  onValueChange={(value: "available" | "reserved" | "occupied") => {
                    const newStatus = value
                    const updatedTable = { ...currentTable, status: newStatus }

                    // Nếu bàn trở thành available, xóa thông tin đặt bàn
                    if (newStatus === "available") {
                      updatedTable.reservationTime = null
                      updatedTable.customerName = null
                    }

                    setCurrentTable(updatedTable)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses
                      .filter((status) => status !== "All")
                      .map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {currentTable.status !== "available" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <Input
                      type="text"
                      value={currentTable.customerName || ""}
                      onChange={(e) => setCurrentTable({ ...currentTable, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reservation Time</label>
                    <Input
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
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTable} className="bg-[#003087] hover:bg-[#002266] text-white">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa nhà hàng */}
      {showRestaurantModal && currentRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{currentRestaurant._id ? "Edit Restaurant" : "Add New Restaurant"}</h2>
              <button onClick={() => setShowRestaurantModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  type="text"
                  value={currentRestaurant.address || ""}
                  onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables</label>
                <Input
                  type="number"
                  value={currentRestaurant.tableNumber || 0}
                  onChange={(e) => setCurrentRestaurant({ ...currentRestaurant, tableNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowRestaurantModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRestaurant} className="bg-[#003087] hover:bg-[#002266] text-white">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa bàn */}
      {showDeleteConfirm && tableToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete Table {tableToDelete.tableNumber}?</p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmDelete} className="bg-[#003087] hover:bg-[#002266] text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa nhà hàng */}
      {showDeleteRestaurantConfirm && restaurantToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete Restaurant</h2>
            <p className="mb-6">Are you sure you want to delete the restaurant at {restaurantToDelete.address}?</p>
            <p className="mb-6 text-red-600">This will also delete all tables associated with this restaurant!</p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteRestaurantConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmDeleteRestaurant} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
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

              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant:</span>
                <span>{restaurants.find((r) => r._id === selectedTable.restaurantId)?.address || "Unknown"}</span>
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

              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(selectedTable.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{new Date(selectedTable.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedTable.status === "occupied" && (
              <div className="space-y-2 mb-6">
                <Button
                  onClick={() => handlePrintTableReceipt(selectedTable)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266] transition-colors"
                >
                  <Printer size={18} />
                  <span>Print Receipt</span>
                </Button>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-700">Change Status</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateStatus(selectedTable._id, "available")}
                  variant="outline"
                  className={`flex-1 ${
                    selectedTable.status === "available" ? "bg-green-100 text-green-800 border-green-300" : ""
                  }`}
                  disabled={selectedTable.status === "available"}
                >
                  Available
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedTable._id, "occupied")}
                  variant="outline"
                  className={`flex-1 ${
                    selectedTable.status === "occupied" ? "bg-red-100 text-red-800 border-red-300" : ""
                  }`}
                  disabled={selectedTable.status === "occupied"}
                >
                  Occupied
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedTable._id, "reserved")}
                  variant="outline"
                  className={`flex-1 ${
                    selectedTable.status === "reserved" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""
                  }`}
                  disabled={selectedTable.status === "reserved"}
                >
                  Reserved
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href={`/dashboard/table-order/${selectedTable._id}?tableNumber=${selectedTable.tableNumber}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003087] text-white rounded-md hover:bg-[#002266] transition-colors"
              >
                <Utensils size={18} />
                <span>Place Order for This Table</span>
              </Link>

              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    setShowTableDetails(false)
                    handleEditTable(selectedTable)
                  }}
                  className="bg-[#003087] hover:bg-[#002266] text-white"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setShowTableDetails(false)
                    handleDeleteClick(selectedTable)
                  }}
                  className="bg-[#003087] hover:bg-[#002266] text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
