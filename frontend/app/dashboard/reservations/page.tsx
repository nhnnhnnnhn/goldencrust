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
} from "lucide-react"

// Dữ liệu mẫu cho đặt bàn
const initialReservations = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    date: "2023-05-15",
    time: "18:30",
    partySize: 4,
    status: "confirmed",
    notes: "Kỷ niệm sinh nhật, cần bánh kem",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0912345678",
    date: "2023-05-15",
    time: "19:00",
    partySize: 2,
    status: "pending",
    notes: "Yêu cầu bàn gần cửa sổ",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    email: "levanc@example.com",
    phone: "0923456789",
    date: "2023-05-16",
    time: "12:30",
    partySize: 6,
    status: "confirmed",
    notes: "Có trẻ em, cần ghế cao",
  },
  {
    id: 4,
    customerName: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "0934567890",
    date: "2023-05-16",
    time: "18:00",
    partySize: 3,
    status: "cancelled",
    notes: "",
  },
  {
    id: 5,
    customerName: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "0945678901",
    date: "2023-05-17",
    time: "19:30",
    partySize: 8,
    status: "confirmed",
    notes: "Tiệc công ty, cần không gian riêng",
  },
]

// Danh sách trạng thái
const statuses = ["Tất cả", "confirmed", "pending", "cancelled"]
const statusLabels = {
  confirmed: "Đã xác nhận",
  pending: "Chờ xác nhận",
  cancelled: "Đã hủy",
}
const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}
const statusIcons = {
  confirmed: <CheckCircle size={16} className="text-green-600" />,
  pending: <AlertCircle size={16} className="text-yellow-600" />,
  cancelled: <XCircle size={16} className="text-red-600" />,
}

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState(initialReservations)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showReservationDetails, setShowReservationDetails] = useState(false)
  const [currentReservation, setCurrentReservation] = useState(null)

  // Lọc đặt bàn dựa trên tìm kiếm, trạng thái và ngày
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm)

    const matchesStatus = selectedStatus === "Tất cả" || reservation.status === selectedStatus

    const reservationDate = new Date(reservation.date)
    const matchesDate =
      reservationDate.getDate() === selectedDate.getDate() &&
      reservationDate.getMonth() === selectedDate.getMonth() &&
      reservationDate.getFullYear() === selectedDate.getFullYear()

    return matchesSearch && matchesStatus && matchesDate
  })

  // Xử lý xem chi tiết đặt bàn
  const handleViewDetails = (reservation) => {
    setCurrentReservation(reservation)
    setShowReservationDetails(true)
  }

  // Xử lý cập nhật trạng thái đặt bàn
  const handleUpdateStatus = (id, newStatus) => {
    setReservations(
      reservations.map((reservation) => (reservation.id === id ? { ...reservation, status: newStatus } : reservation)),
    )

    if (currentReservation && currentReservation.id === id) {
      setCurrentReservation({ ...currentReservation, status: newStatus })
    }
  }

  // Định dạng ngày
  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("vi-VN", options)
  }

  // Chuyển đổi ngày
  const changeDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + days)
    setSelectedDate(newDate)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Đặt Bàn</h1>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số người
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
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                    <div className="text-sm text-gray-500">{reservation.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-1" />
                      {reservation.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users size={16} className="mr-1" />
                      {reservation.partySize} người
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reservation.status]}`}
                    >
                      {statusIcons[reservation.status]}
                      <span className="ml-1">{statusLabels[reservation.status]}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(reservation)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có đặt bàn nào vào ngày này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <p className="text-sm text-gray-600">{currentReservation.email}</p>
                <p className="text-sm text-gray-600">{currentReservation.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Thông tin đặt bàn</h3>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-red-600" />
                  <p className="text-sm">{formatDate(currentReservation.date)}</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-red-600" />
                  <p className="text-sm">{currentReservation.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-red-600" />
                  <p className="text-sm">{currentReservation.partySize} người</p>
                </div>
              </div>
            </div>

            {currentReservation.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ghi chú</h3>
                <p className="text-sm bg-gray-50 p-3 rounded">{currentReservation.notes}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[currentReservation.status]}`}
                >
                  {statusIcons[currentReservation.status]}
                  <span className="ml-1">{statusLabels[currentReservation.status]}</span>
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {currentReservation.status !== "cancelled" && (
                <button
                  onClick={() => handleUpdateStatus(currentReservation.id, "cancelled")}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Hủy đặt bàn
                </button>
              )}

              {currentReservation.status === "pending" && (
                <button
                  onClick={() => handleUpdateStatus(currentReservation.id, "confirmed")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Xác nhận
                </button>
              )}

              <button
                onClick={() => setShowReservationDetails(false)}
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
