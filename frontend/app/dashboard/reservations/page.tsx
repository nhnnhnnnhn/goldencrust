"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  Clock3,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { format, addHours, isPast, formatDistanceToNow } from "date-fns"
import { useGetRestaurantsQuery } from '@/redux/api'

// Định nghĩa kiểu dữ liệu cho Restaurant
interface Restaurant {
  _id: string
  name: string
  address: string
  phone: string
  email: string
  tableNumber: number
  status: 'open' | 'closed'
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

// Định nghĩa kiểu dữ liệu cho User
interface UserType {
  _id: string
  name: string
  email: string
  role: string
}

// Định nghĩa kiểu dữ liệu cho Reservation
interface Reservation {
  _id: string
  customerName: string
  customerPhone: string
  reservationDate: string | Date
  reservationTime: string
  numberOfGuests: number
  specialRequests?: string
  restaurantId: string
  status: "pending" | "confirmed" | "cancelled"
  createdBy?: string
  updatedBy?: string
  expiredAt: string | Date
  deleted?: boolean
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// Định nghĩa kiểu dữ liệu cho ReservedTable
interface ReservedTable {
  _id: string
  tableId: string
  userId?: string
  date: string | Date
  time: string
  status: "reserved" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

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
    status: "available",
    location: "Main Hall",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table3",
    restaurantId: "rest1",
    tableNumber: "A3",
    capacity: 6,
    status: "available",
    location: "Main Hall",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "table4",
    restaurantId: "rest2",
    tableNumber: "B1",
    capacity: 4,
    status: "available",
    location: "Terrace",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    _id: "table5",
    restaurantId: "rest2",
    tableNumber: "B2",
    capacity: 8,
    status: "available",
    location: "Terrace",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    _id: "table6",
    restaurantId: "rest3",
    tableNumber: "C1",
    capacity: 2,
    status: "available",
    location: "Private Room",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
  },
]

// Dữ liệu mẫu cho người dùng
const initialUsers: UserType[] = [
  {
    _id: "user1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    _id: "user2",
    name: "Staff User",
    email: "staff@example.com",
    role: "staff",
  },
]

// Dữ liệu mẫu cho đặt bàn
const initialReservations: Reservation[] = [
  {
    _id: "res1",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    reservationDate: new Date("2023-05-15"),
    reservationTime: "18:30",
    numberOfGuests: 4,
    specialRequests: "Kỷ niệm sinh nhật, cần bánh kem",
    restaurantId: "rest1",
    status: "confirmed",
    createdBy: "user1",
    updatedBy: "user1",
    expiredAt: new Date("2023-05-15T20:30:00"),
    createdAt: new Date("2023-05-10"),
    updatedAt: new Date("2023-05-10"),
  },
  {
    _id: "res2",
    customerName: "Trần Thị B",
    customerPhone: "0912345678",
    reservationDate: new Date("2023-05-15"),
    reservationTime: "19:00",
    numberOfGuests: 2,
    specialRequests: "Yêu cầu bàn gần cửa sổ",
    restaurantId: "rest1",
    status: "pending",
    createdBy: "user2",
    updatedBy: "user2",
    expiredAt: new Date("2023-05-15T21:00:00"),
    createdAt: new Date("2023-05-11"),
    updatedAt: new Date("2023-05-11"),
  },
  {
    _id: "res3",
    customerName: "Lê Văn C",
    customerPhone: "0923456789",
    reservationDate: new Date("2023-05-16"),
    reservationTime: "12:30",
    numberOfGuests: 6,
    specialRequests: "Có trẻ em, cần ghế cao",
    restaurantId: "rest2",
    status: "confirmed",
    createdBy: "user1",
    updatedBy: "user1",
    expiredAt: new Date("2023-05-16T14:30:00"),
    createdAt: new Date("2023-05-12"),
    updatedAt: new Date("2023-05-12"),
  },
]

// Danh sách trạng thái đặt bàn
const reservationStatuses = ["Tất cả", "pending", "confirmed", "cancelled"]
const reservationStatusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
}
const reservationStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}
const reservationStatusIcons = {
  pending: <AlertCircle size={16} className="text-yellow-600" />,
  confirmed: <CheckCircle size={16} className="text-green-600" />,
  cancelled: <XCircle size={16} className="text-red-600" />,
}

// Danh sách trạng thái bàn đã đặt
const reservedTableStatuses = ["reserved", "completed", "cancelled"]
const reservedTableStatusLabels = {
  reserved: "Đã đặt",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
}
const reservedTableStatusColors = {
  reserved: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function ReservationsManagement() {
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [reservedTables, setReservedTables] = useState<ReservedTable[]>([])
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [selectedRestaurant, setSelectedRestaurant] = useState("Tất cả")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showReservationDetails, setShowReservationDetails] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Partial<Reservation> | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null)
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false)
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("reservations")

  // Lọc đặt bàn dựa trên tìm kiếm, trạng thái, nhà hàng và ngày
  const filteredReservations = reservations
    .filter((reservation) => !reservation.deleted)
    .filter((reservation) => {
      const matchesSearch =
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerPhone.includes(searchTerm)

      const matchesStatus = selectedStatus === "Tất cả" || reservation.status === selectedStatus

      const matchesRestaurant = selectedRestaurant === "Tất cả" || reservation.restaurantId === selectedRestaurant

      const reservationDate = new Date(reservation.reservationDate)
      const matchesDate =
        reservationDate.getDate() === selectedDate.getDate() &&
        reservationDate.getMonth() === selectedDate.getMonth() &&
        reservationDate.getFullYear() === selectedDate.getFullYear()

      return matchesSearch && matchesStatus && matchesRestaurant && matchesDate
    })

  // Lọc bàn đã đặt
  const filteredReservedTables = reservedTables.filter((reservedTable) => {
    const reservedDate = new Date(reservedTable.date)
    const matchesDate =
      reservedDate.getDate() === selectedDate.getDate() &&
      reservedDate.getMonth() === selectedDate.getMonth() &&
      reservedDate.getFullYear() === selectedDate.getFullYear()

    return matchesDate
  })

  // Xử lý xem chi tiết đặt bàn
  const handleViewDetails = (reservation: Reservation) => {
    setCurrentReservation(reservation)
    setShowReservationDetails(true)
  }

  // Xử lý cập nhật trạng thái đặt bàn
  const handleUpdateStatus = (id: string, newStatus: "pending" | "confirmed" | "cancelled") => {
    const now = new Date()
    const updatedBy = users[0]._id // Giả sử người dùng hiện tại là admin

    setReservations(
      reservations.map((reservation) =>
        reservation._id === id ? { ...reservation, status: newStatus, updatedBy, updatedAt: now } : reservation,
      ),
    )

    if (currentReservation && currentReservation._id === id) {
      setCurrentReservation({ ...currentReservation, status: newStatus, updatedBy, updatedAt: now })
    }

    // Cập nhật trạng thái của các bàn đã đặt liên quan
    if (newStatus === "cancelled") {
      setReservedTables(
        reservedTables.map((reservedTable) => {
          const reservation = reservations.find((r) => r._id === id)
          if (
            reservation &&
            new Date(reservedTable.date).getTime() === new Date(reservation.reservationDate).getTime() &&
            reservedTable.time === reservation.reservationTime
          ) {
            return { ...reservedTable, status: "cancelled", updatedAt: now }
          }
          return reservedTable
        }),
      )
    }

    toast({
      title: "Cập nhật trạng thái thành công",
      description: `Trạng thái đặt bàn đã được cập nhật thành ${reservationStatusLabels[newStatus]}.`,
    })
  }

  // Xử lý thêm đặt bàn mới
  const handleAddReservation = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    setEditingReservation({
      customerName: "",
      customerPhone: "",
      reservationDate: tomorrow,
      reservationTime: "18:00",
      numberOfGuests: 2,
      specialRequests: "",
      restaurantId: restaurants[0]._id,
      status: "pending",
      createdBy: users[0]._id,
      updatedBy: users[0]._id,
      expiredAt: addHours(tomorrow, 2), // Mặc định hết hạn sau 2 giờ từ thời điểm đặt
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    setShowAddEditModal(true)
  }

  // Xử lý chỉnh sửa đặt bàn
  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation({ ...reservation })
    setShowAddEditModal(true)
  }

  // Xử lý lưu đặt bàn (thêm mới hoặc cập nhật)
  const handleSaveReservation = () => {
    if (!editingReservation) return

    const now = new Date()
    const updatedBy = users[0]._id // Giả sử người dùng hiện tại là admin

    // Tính toán thời điểm hết hạn (2 giờ sau thời điểm đặt)
    const reservationDateTime = new Date(editingReservation.reservationDate)
    const [hours, minutes] = (editingReservation.reservationTime || "").split(":").map(Number)
    reservationDateTime.setHours(hours || 0, minutes || 0, 0, 0)
    const expiredAt = addHours(reservationDateTime, 2)

    if (editingReservation._id) {
      // Cập nhật đặt bàn hiện có
      setReservations(
        reservations.map((reservation) =>
          reservation._id === editingReservation._id
            ? ({
                ...reservation,
                ...editingReservation,
                updatedBy,
                updatedAt: now,
                expiredAt,
              } as Reservation)
            : reservation,
        ),
      )
      toast({
        title: "Cập nhật đặt bàn thành công",
        description: `Đặt bàn của ${editingReservation.customerName} đã được cập nhật.`,
      })
    } else {
      // Thêm đặt bàn mới
      const newReservation: Reservation = {
        _id: `res${reservations.length + 1}`,
        ...(editingReservation as Omit<Reservation, "_id">),
        createdBy: users[0]._id,
        updatedBy: users[0]._id,
        expiredAt,
        createdAt: now,
        updatedAt: now,
      } as Reservation

      setReservations([...reservations, newReservation])
      toast({
        title: "Thêm đặt bàn thành công",
        description: `Đặt bàn của ${newReservation.customerName} đã được thêm.`,
      })
    }

    setShowAddEditModal(false)
    setEditingReservation(null)
  }

  // Xử lý xóa đặt bàn (soft delete)
  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (!reservationToDelete) return

    const now = new Date()

    // Soft delete
    setReservations(
      reservations.map((reservation) =>
        reservation._id === reservationToDelete._id ? { ...reservation, deleted: true, deletedAt: now } : reservation,
      ),
    )

    // Cập nhật trạng thái của các bàn đã đặt liên quan
    setReservedTables(
      reservedTables.map((reservedTable) => {
        if (
          reservationToDelete &&
          new Date(reservedTable.date).getTime() === new Date(reservationToDelete.reservationDate).getTime() &&
          reservedTable.time === reservationToDelete.reservationTime
        ) {
          return { ...reservedTable, status: "cancelled", updatedAt: now }
        }
        return reservedTable
      }),
    )

    setShowDeleteConfirm(false)
    setReservationToDelete(null)

    if (showReservationDetails) {
      setShowReservationDetails(false)
      setCurrentReservation(null)
    }

    toast({
      title: "Xóa đặt bàn thành công",
      description: `Đặt bàn của ${reservationToDelete.customerName} đã được xóa.`,
    })
  }

  // Xử lý phân bàn cho đặt bàn
  const handleAssignTables = (reservation: Reservation) => {
    setCurrentReservation(reservation)

    // Lấy danh sách bàn đã đặt cho đặt bàn này
    const assignedTableIds = reservedTables
      .filter(
        (rt) =>
          new Date(rt.date).getTime() === new Date(reservation.reservationDate).getTime() &&
          rt.time === reservation.reservationTime &&
          rt.status !== "cancelled",
      )
      .map((rt) => rt.tableId)

    setSelectedTables(assignedTableIds)
    setShowAssignTablesModal(true)
  }

  // Xử lý lưu phân bàn
  const handleSaveTableAssignments = () => {
    if (!currentReservation) return

    const now = new Date()
    const userId = users[0]._id // Giả sử người dùng hiện tại là admin

    // Lấy danh sách bàn đã đặt hiện tại cho đặt bàn này
    const existingAssignments = reservedTables.filter(
      (rt) =>
        new Date(rt.date).getTime() === new Date(currentReservation.reservationDate).getTime() &&
        rt.time === currentReservation.reservationTime,
    )

    // Danh sách bàn cần hủy (đã đặt trước đó nhưng không còn trong danh sách đã chọn)
    const tablesToCancel = existingAssignments
      .filter((rt) => !selectedTables.includes(rt.tableId) && rt.status !== "cancelled")
      .map((rt) => ({ ...rt, status: "cancelled" as const, updatedAt: now }))

    // Danh sách bàn cần thêm mới (chưa từng đặt trước đó)
    const existingTableIds = existingAssignments.map((rt) => rt.tableId)
    const tablesToAdd = selectedTables
      .filter((tableId) => !existingTableIds.includes(tableId))
      .map((tableId) => ({
        _id: `rt${reservedTables.length + Math.random().toString(36).substr(2, 5)}`,
        tableId,
        userId,
        date: currentReservation.reservationDate,
        time: currentReservation.reservationTime,
        status: "reserved" as const,
        createdAt: now,
        updatedAt: now,
      }))

    // Cập nhật danh sách bàn đã đặt
    setReservedTables([
      ...reservedTables.map((rt) => {
        const cancelledTable = tablesToCancel.find((t) => t._id === rt._id)
        return cancelledTable || rt
      }),
      ...tablesToAdd,
    ])

    setShowAssignTablesModal(false)

    toast({
      title: "Phân bàn thành công",
      description: `Đã phân ${selectedTables.length} bàn cho đặt bàn của ${currentReservation.customerName}.`,
    })
  }

  // Helper function to format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A"
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return format(date, "dd/MM/yyyy")
  }

  // Chuyển đổi ngày
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + days)
    setSelectedDate(newDate)
  }

  // Helper function to check if reservation is expired
  const isReservationExpired = (reservation: Reservation) => {
    if (!reservation.expiredAt) return false
    const expiryDate = typeof reservation.expiredAt === "string" ? new Date(reservation.expiredAt) : reservation.expiredAt
    return isPast(expiryDate)
  }

  // Helper function to get time until expiry
  const getTimeUntilExpiry = (reservation: Reservation) => {
    if (!reservation.expiredAt) return "N/A"
    const expiryDate = typeof reservation.expiredAt === "string" ? new Date(reservation.expiredAt) : reservation.expiredAt
    return formatDistanceToNow(expiryDate, { addSuffix: true })
  }

  // Show loading state while loading restaurants
  if (isLoadingRestaurants) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="reservations">Quản Lý Đặt Bàn</TabsTrigger>
          <TabsTrigger value="reserved-tables">Bàn Đã Đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Quản Lý Đặt Bàn</h1>
            <Button
              onClick={handleAddReservation}
              className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
            >
              <Users size={20} />
              <span>Thêm Đặt Bàn</span>
            </Button>
          </div>

          {/* Thanh tìm kiếm và lọc */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, số điện thoại..."
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
                <span>
                  Trạng thái:{" "}
                  {selectedStatus === "Tất cả"
                    ? selectedStatus
                    : reservationStatusLabels[selectedStatus as keyof typeof reservationStatusLabels]}
                </span>
                <ChevronDown size={16} />
              </button>

              {showStatusDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {reservationStatuses.map((status) => (
                    <div
                      key={status}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedStatus(status)
                        setShowStatusDropdown(false)
                      }}
                    >
                      {status !== "Tất cả" && reservationStatusIcons[status as keyof typeof reservationStatusIcons]}
                      {status === "Tất cả"
                        ? status
                        : reservationStatusLabels[status as keyof typeof reservationStatusLabels]}
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
                <Building size={20} />
                <span>
                  Nhà hàng:{" "}
                  {selectedRestaurant === "Tất cả"
                    ? selectedRestaurant
                    : restaurants.find((r) => r._id === selectedRestaurant)?.name}
                </span>
                <ChevronDown size={16} />
              </button>

              {showRestaurantDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedRestaurant("Tất cả")
                      setShowRestaurantDropdown(false)
                    }}
                  >
                    Tất cả
                  </div>
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedRestaurant(restaurant._id)
                        setShowRestaurantDropdown(false)
                      }}
                    >
                      {restaurant.name} - {restaurant.address}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chọn ngày */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-red-600" />
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>

              <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Bảng đặt bàn */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhà hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số người
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hết hạn
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                        <div className="text-sm text-gray-500">{reservation.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {restaurants.find((r) => r._id === reservation.restaurantId)?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={16} className="mr-1" />
                          {reservation.reservationTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users size={16} className="mr-1" />
                          {reservation.numberOfGuests} người
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reservationStatusColors[reservation.status]
                          }`}
                        >
                          {reservationStatusIcons[reservation.status]}
                          <span className="ml-1">{reservationStatusLabels[reservation.status]}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm ${isReservationExpired(reservation) ? "text-red-600" : "text-gray-500"}`}
                        >
                          {getTimeUntilExpiry(reservation)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(reservation)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleAssignTables(reservation)}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={reservation.status === "cancelled"}
                        >
                          Phân bàn
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReservations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Không có đặt bàn nào vào ngày này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reserved-tables">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Bàn Đã Đặt</h1>
          </div>

          {/* Chọn ngày */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-red-600" />
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>

              <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Bảng bàn đã đặt */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bàn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhà hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservedTables.map((reservedTable) => {
                    const table = tables.find((t) => t._id === reservedTable.tableId)
                    const restaurant = table ? restaurants.find((r) => r._id === table.restaurantId) : null
                    const reservation = reservations.find(
                      (r) =>
                        new Date(r.reservationDate).getTime() === new Date(reservedTable.date).getTime() &&
                        r.reservationTime === reservedTable.time,
                    )

                    return (
                      <tr key={reservedTable._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {table ? `Bàn ${table.tableNumber}` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {table ? `Sức chứa: ${table.capacity} người` : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{restaurant ? restaurant.name : "N/A"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={16} className="mr-1" />
                            {reservedTable.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation ? reservation.customerName : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">{reservation ? reservation.customerPhone : ""}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reservedTableStatusColors[reservedTable.status]
                            }`}
                          >
                            <span>{reservedTableStatusLabels[reservedTable.status]}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {reservedTable.status === "reserved" && (
                            <>
                              <button
                                onClick={() => {
                                  // Cập nhật trạng thái thành completed
                                  setReservedTables(
                                    reservedTables.map((rt) =>
                                      rt._id === reservedTable._id
                                        ? { ...rt, status: "completed", updatedAt: new Date() }
                                        : rt,
                                    ),
                                  )
                                  toast({
                                    title: "Cập nhật thành công",
                                    description: "Bàn đã được đánh dấu là hoàn thành.",
                                  })
                                }}
                                className="text-green-600 hover:text-green-900 mr-2"
                              >
                                Hoàn thành
                              </button>
                              <button
                                onClick={() => {
                                  // Cập nhật trạng thái thành cancelled
                                  setReservedTables(
                                    reservedTables.map((rt) =>
                                      rt._id === reservedTable._id
                                        ? { ...rt, status: "cancelled", updatedAt: new Date() }
                                        : rt,
                                    ),
                                  )
                                  toast({
                                    title: "Cập nhật thành công",
                                    description: "Bàn đã được đánh dấu là đã hủy.",
                                  })
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredReservedTables.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Không có bàn nào được đặt vào ngày này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal chi tiết đặt bàn */}
      {showReservationDetails && currentReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi Tiết Đặt Bàn</h2>
              <button onClick={() => setShowReservationDetails(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Thông tin khách hàng</h3>
                <p className="text-lg font-medium">{currentReservation.customerName}</p>
                <p className="text-sm text-gray-600">{currentReservation.customerPhone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Thông tin đặt bàn</h3>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-red-600" />
                  <p className="text-sm">{formatDate(currentReservation.reservationDate)}</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-red-600" />
                  <p className="text-sm">{currentReservation.reservationTime}</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-red-600" />
                  <p className="text-sm">{currentReservation.numberOfGuests} người</p>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-red-600" />
                  <p className="text-sm">
                    {restaurants.find((r) => r._id === currentReservation.restaurantId)?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {currentReservation.specialRequests && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ghi chú</h3>
                <p className="text-sm bg-gray-50 p-3 rounded">{currentReservation.specialRequests}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reservationStatusColors[currentReservation.status]
                    }`}
                  >
                    {reservationStatusIcons[currentReservation.status]}
                    <span className="ml-1">{reservationStatusLabels[currentReservation.status]}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Thời hạn</h3>
                <div
                  className={`flex items-center gap-2 ${
                    isReservationExpired(currentReservation) ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  <Clock3 size={16} />
                  <p className="text-sm">{getTimeUntilExpiry(currentReservation)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Người tạo</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <p className="text-sm">{users.find((u) => u._id === currentReservation.createdBy)?.name || "N/A"}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(currentReservation.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cập nhật cuối</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <p className="text-sm">{users.find((u) => u._id === currentReservation.updatedBy)?.name || "N/A"}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(currentReservation.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bàn đã đặt</h3>
              <div className="bg-gray-50 p-3 rounded">
                {reservedTables
                  .filter(
                    (rt) =>
                      new Date(rt.date).getTime() === new Date(currentReservation.reservationDate).getTime() &&
                      rt.time === currentReservation.reservationTime &&
                      rt.status !== "cancelled",
                  )
                  .map((rt) => {
                    const table = tables.find((t) => t._id === rt.tableId)
                    return (
                      <div key={rt._id} className="flex items-center justify-between py-1">
                        <span className="text-sm">
                          {table ? `Bàn ${table.tableNumber} (${table.capacity} người)` : "Bàn không xác định"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reservedTableStatusColors[rt.status]
                          }`}
                        >
                          {reservedTableStatusLabels[rt.status]}
                        </span>
                      </div>
                    )
                  })}
                {reservedTables.filter(
                  (rt) =>
                    new Date(rt.date).getTime() === new Date(currentReservation.reservationDate).getTime() &&
                    rt.time === currentReservation.reservationTime &&
                    rt.status !== "cancelled",
                ).length === 0 && <p className="text-sm text-gray-500">Chưa có bàn nào được đặt</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {currentReservation.status !== "cancelled" && (
                <Button
                  onClick={() => handleUpdateStatus(currentReservation._id, "cancelled")}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle size={16} />
                  <span>Hủy đặt bàn</span>
                </Button>
              )}

              {currentReservation.status === "pending" && (
                <Button
                  onClick={() => handleUpdateStatus(currentReservation._id, "confirmed")}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle size={16} />
                  <span>Xác nhận</span>
                </Button>
              )}

              <Button
                onClick={() => {
                  setShowReservationDetails(false)
                  handleEditReservation(currentReservation)
                }}
                className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
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
                <span>Chỉnh sửa</span>
              </Button>

              <Button
                onClick={() => {
                  setShowReservationDetails(false)
                  handleDeleteClick(currentReservation)
                }}
                className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
              >
                <Trash2 size={16} />
                <span>Xóa</span>
              </Button>

              <Button
                onClick={() => setShowReservationDetails(false)}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa đặt bàn */}
      {showAddEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingReservation._id ? "Chỉnh Sửa Đặt Bàn" : "Thêm Đặt Bàn Mới"}</h2>
              <button onClick={() => setShowAddEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                  <Input
                    type="text"
                    value={editingReservation.customerName || ""}
                    onChange={(e) => setEditingReservation({ ...editingReservation, customerName: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <Input
                    type="text"
                    value={editingReservation.customerPhone || ""}
                    onChange={(e) => setEditingReservation({ ...editingReservation, customerPhone: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt</label>
                  <Input
                    type="date"
                    value={
                      editingReservation.reservationDate instanceof Date
                        ? format(editingReservation.reservationDate, "yyyy-MM-dd")
                        : typeof editingReservation.reservationDate === "string"
                          ? format(new Date(editingReservation.reservationDate), "yyyy-MM-dd")
                          : ""
                    }
                    onChange={(e) =>
                      setEditingReservation({ ...editingReservation, reservationDate: new Date(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đặt</label>
                  <Input
                    type="time"
                    value={editingReservation.reservationTime || ""}
                    onChange={(e) => setEditingReservation({ ...editingReservation, reservationTime: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng khách</label>
                  <Input
                    type="number"
                    value={editingReservation.numberOfGuests || 0}
                    onChange={(e) =>
                      setEditingReservation({ ...editingReservation, numberOfGuests: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà hàng</label>
                  <Select
                    value={editingReservation.restaurantId || ""}
                    onValueChange={(value) => setEditingReservation({ ...editingReservation, restaurantId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn nhà hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant._id} value={restaurant._id}>
                          {restaurant.name} - {restaurant.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <Select
                  value={editingReservation.status || "pending"}
                  onValueChange={(value: "pending" | "confirmed" | "cancelled") =>
                    setEditingReservation({ ...editingReservation, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{reservationStatusLabels.pending}</SelectItem>
                    <SelectItem value="confirmed">{reservationStatusLabels.confirmed}</SelectItem>
                    <SelectItem value="cancelled">{reservationStatusLabels.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu đặc biệt</label>
                <Textarea
                  value={editingReservation.specialRequests || ""}
                  onChange={(e) => setEditingReservation({ ...editingReservation, specialRequests: e.target.value })}
                  className="w-full"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveReservation} className="bg-[#003087] hover:bg-[#002266] text-white">
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa đặt bàn */}
      {showDeleteConfirm && reservationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa đặt bàn của {reservationToDelete.customerName}?</p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Hủy
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal phân bàn cho đặt bàn */}
      {showAssignTablesModal && currentReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Phân bàn cho đặt bàn</h2>
              <button onClick={() => setShowAssignTablesModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Đặt bàn: <span className="font-medium">{currentReservation.customerName}</span> -
                {formatDate(currentReservation.reservationDate)} lúc {currentReservation.reservationTime} -
                {currentReservation.numberOfGuests} người
              </p>
              <p className="text-sm text-gray-600">
                Nhà hàng: {restaurants.find((r) => r._id === currentReservation.restaurantId)?.name || "N/A"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Chọn bàn</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {tables
                  .filter((table) => table.restaurantId === currentReservation.restaurantId)
                  .map((table) => {
                    const isSelected = selectedTables.includes(table._id)
                    return (
                      <div
                        key={table._id}
                        className={`p-3 border rounded-md cursor-pointer transition-all ${
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTables(selectedTables.filter((id) => id !== table._id))
                          } else {
                            setSelectedTables([...selectedTables, table._id])
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Bàn {table.tableNumber}</div>
                            <div className="text-sm text-gray-600">{table.capacity} người</div>
                          </div>
                          {isSelected && <CheckCircle size={16} className="text-blue-600" />}
                        </div>
                      </div>
                    )
                  })}
              </div>
              {tables.filter((table) => table.restaurantId === currentReservation.restaurantId).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Không có bàn nào trong nhà hàng này</p>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Đã chọn: <span className="font-medium">{selectedTables.length}</span> bàn
              </div>
              <Button
                onClick={() => setSelectedTables([])}
                variant="outline"
                className="text-sm"
                disabled={selectedTables.length === 0}
              >
                Bỏ chọn tất cả
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignTablesModal(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSaveTableAssignments}
                className="bg-[#003087] hover:bg-[#002266] text-white"
                disabled={selectedTables.length === 0}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
