"use client"

import { useState } from "react"
import {
  Calendar as CalendarIcon,
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
import { ReservationForm } from "@/components/forms/ReservationForm"
import { 
  useGetRestaurantsQuery,
  useGetReservationsQuery,
  useUpdateReservationStatusMutation,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
  useGetReservationsByDateRangeQuery,
  useGetReservationsByStatusQuery,
  type Restaurant,
  type Reservation
} from '@/redux/api'
import { useAppSelector } from "@/redux/hooks"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { vi } from "date-fns/locale"

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
  const { user } = useAppSelector((state) => state.auth)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAssignTablesModalOpen, setIsAssignTablesModalOpen] = useState(false)

  // Queries
  const { data: restaurants } = useGetRestaurantsQuery()
  const { data: reservations, isLoading, error, refetch } = useGetReservationsByDateRangeQuery({
    startDate: format(selectedDate, 'yyyy-MM-dd'),
    endDate: format(selectedDate, 'yyyy-MM-dd')
  }, {
    refetchOnMountOrArgChange: true
  })
  const { data: filteredReservations } = useGetReservationsByStatusQuery(
    selectedStatus as 'pending' | 'confirmed' | 'cancelled',
    { skip: selectedStatus === 'Tất cả' }
  )

  // Mutations
  const [updateReservationStatus] = useUpdateReservationStatusMutation()
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation()
  const [updateReservation] = useUpdateReservationMutation()
  const [deleteReservation, { isLoading: isDeleting }] = useDeleteReservationMutation()

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    // Implement view details modal
  }

  const handleUpdateStatus = async (id: string, newStatus: "pending" | "confirmed" | "cancelled") => {
    try {
      console.log('Updating status:', { id, newStatus });
      const result = await updateReservationStatus({ 
        id, 
        status: newStatus
      }).unwrap();
      console.log('Update result:', result);
      
      // Update the local state immediately
      if (selectedReservation) {
        setSelectedReservation({
          ...selectedReservation,
          status: newStatus
        });
      }
      
      // Refetch to ensure data consistency
      await refetch();
      
      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Đơn đặt bàn đã được chuyển sang trạng thái ${reservationStatusLabels[newStatus]}`,
      });
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error updating reservation status:', {
        error,
        name: error?.name,
        message: error?.message,
        status: error?.status,
        data: error?.data,
        stack: error?.stack
      });
      
      // Try to get a meaningful error message
      const errorMessage = error?.data?.message 
        || error?.message 
        || "Đã có lỗi xảy ra khi cập nhật trạng thái đơn đặt bàn";
      
      toast({
        title: "Lỗi cập nhật trạng thái",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAddReservation = () => {
    setIsAddModalOpen(true)
  }

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(null) // Close details modal
    setIsEditModalOpen(true)
    setSelectedReservation(reservation) // Set the reservation to edit
  }

  const handleSaveReservation = async (formData: any) => {
    try {
      console.log('Form data being submitted:', formData);
      if (isAddModalOpen) {
        if (!user?.id) {
          toast({
            title: "Lỗi",
            description: "Bạn cần đăng nhập để thực hiện thao tác này",
            variant: "destructive",
          })
          return
        }

        const result = await createReservation({
          ...formData,
          createdBy: user.id,
          updatedBy: user.id
        }).unwrap()
        console.log('Create reservation response:', result);
        toast({
          title: "Thêm đặt bàn thành công",
          description: "Đơn đặt bàn mới đã được tạo",
        })
        setIsAddModalOpen(false)
      } else if (isEditModalOpen && selectedReservation) {
        await updateReservation({
          id: selectedReservation._id,
          reservation: formData
        }).unwrap()
        toast({
          title: "Cập nhật đơn đặt bàn thành công",
          description: "Thông tin đơn đặt bàn đã được cập nhật",
        })
        setIsEditModalOpen(false)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi lưu đơn đặt bàn",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedReservation) return

    try {
      await deleteReservation(selectedReservation._id).unwrap()
      toast({
        title: "Xóa đơn đặt bàn thành công",
        description: "Đơn đặt bàn đã được xóa",
      })
      setIsDeleteModalOpen(false)
      setSelectedReservation(null)
    } catch (error) {
      toast({
        title: "Lỗi xóa đơn đặt bàn",
        description: "Đã có lỗi xảy ra khi xóa đơn đặt bàn",
        variant: "destructive",
      })
    }
  }

  // Lọc reservations theo search query
  const displayedReservations = (selectedStatus === "Tất cả" ? reservations : filteredReservations)?.filter(
    (reservation) =>
      reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.customerPhone.includes(searchQuery)
  ) || []

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
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Tabs value="reservations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="reservations">Quản Lý Đặt Bàn</TabsTrigger>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="relative">
              <button
                onClick={() => setSelectedStatus(selectedStatus === "Tất cả" ? "Tất cả" : selectedStatus)}
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
            </div>
          </div>

          {/* Chọn ngày */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal hover:bg-gray-50 py-6 text-lg border-2 border-gray-100"
                    >
                      <CalendarIcon className="mr-3 h-6 w-6 text-red-600" />
                      <span className="text-gray-700 font-medium">{format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="rounded-lg shadow-lg bg-white"
                      classNames={{
                        months: "space-y-4 px-5 py-5",
                        month: "space-y-3",
                        caption: "flex justify-center pt-1 relative items-center mb-4",
                        caption_label: "text-base font-semibold text-gray-900",
                        nav: "flex items-center gap-1",
                        nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-full transition-all duration-200 inline-flex items-center justify-center",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "flex border-b border-gray-100",
                        head_cell: "text-gray-500 w-10 font-medium text-[0.8rem] pb-3",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm relative p-0 hover:bg-gray-50 rounded-full focus-within:relative focus-within:z-20 transition-colors duration-200",
                        day: "h-10 w-10 p-0 font-normal hover:bg-gray-50 rounded-full transition-colors duration-200 inline-flex items-center justify-center",
                        day_selected: "bg-red-600 text-white hover:bg-red-700 hover:text-white focus:bg-red-700 focus:text-white font-semibold",
                        day_today: "bg-gray-50 text-red-600 font-semibold",
                        day_outside: "text-gray-400 opacity-50 cursor-default",
                        day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                        day_hidden: "invisible",
                      }}
                      components={{
                        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                  {displayedReservations.map((reservation) => (
                    <tr key={reservation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                        <div className="text-sm text-gray-500">{reservation.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {restaurants?.find((r) => r._id === reservation.restaurantId)?.name || "N/A"}
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
                      </td>
                    </tr>
                  ))}
                  {displayedReservations.length === 0 && (
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
      </Tabs>

      {/* Modal chi tiết đặt bàn */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi Tiết Đặt Bàn</h2>
              <button onClick={() => setSelectedReservation(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Thông tin khách hàng</h3>
                <p className="text-lg font-medium">{selectedReservation.customerName}</p>
                <p className="text-sm text-gray-600">{selectedReservation.customerPhone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Thông tin đặt bàn</h3>
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon size={16} className="text-red-600" />
                  <p className="text-sm">{formatDate(selectedReservation.reservationDate)}</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-red-600" />
                  <p className="text-sm">{selectedReservation.reservationTime}</p>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-red-600" />
                  <p className="text-sm">{selectedReservation.numberOfGuests} người</p>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-red-600" />
                  <p className="text-sm">
                    {restaurants?.find((r) => r._id === selectedReservation.restaurantId)?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {selectedReservation.specialRequests && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ghi chú</h3>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedReservation.specialRequests}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reservationStatusColors[selectedReservation.status]
                    }`}
                  >
                    {reservationStatusIcons[selectedReservation.status]}
                    <span className="ml-1">{reservationStatusLabels[selectedReservation.status]}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Thời hạn</h3>
                <div
                  className={`flex items-center gap-2 ${
                    isReservationExpired(selectedReservation) ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  <Clock3 size={16} />
                  <p className="text-sm">{getTimeUntilExpiry(selectedReservation)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Người tạo</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <p className="text-sm">{restaurants?.find((u) => u._id === selectedReservation.createdBy)?.name || "N/A"}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cập nhật cuối</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <p className="text-sm">{restaurants?.find((u) => u._id === selectedReservation.updatedBy)?.name || "N/A"}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(selectedReservation.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bàn đã đặt</h3>
              <div className="bg-gray-50 p-3 rounded">
                {/* Implementation of reservedTables component */}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {selectedReservation.status !== "cancelled" && (
                <Button
                  onClick={async () => {
                    await handleUpdateStatus(selectedReservation._id, "cancelled")
                    setSelectedReservation(null)
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle size={16} />
                  <span>Hủy đặt bàn</span>
                </Button>
              )}

              {selectedReservation.status === "pending" && (
                <Button
                  onClick={async () => {
                    await handleUpdateStatus(selectedReservation._id, "confirmed")
                    setSelectedReservation(null)
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle size={16} />
                  <span>Xác nhận</span>
                </Button>
              )}

              <Button
                onClick={() => handleEditReservation(selectedReservation)}
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
                  setSelectedReservation(null)
                  handleDeleteClick(selectedReservation)
                }}
                className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
              >
                <Trash2 size={16} />
                <span>Xóa</span>
              </Button>

              <Button
                onClick={() => setSelectedReservation(null)}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa đặt bàn */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{isAddModalOpen ? "Thêm Đặt Bàn Mới" : "Chỉnh Sửa Đặt Bàn"}</h2>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  setSelectedReservation(null)
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <ReservationForm
              restaurants={restaurants || []}
              onSubmit={handleSaveReservation}
              onCancel={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedReservation(null)
              }}
              isSubmitting={isCreating}
              initialData={selectedReservation || undefined}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa đặt bàn */}
      {isDeleteModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa đặt bàn của {selectedReservation.customerName}?</p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
