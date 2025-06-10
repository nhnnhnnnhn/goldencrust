"use client"

import React, { useState, useEffect, useMemo } from "react"
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
  User as UserIcon,
  Clock3,
  Trash2,
  Edit,
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
  type Reservation,
  useGetUserByIdQuery,
  type User as ApiUser
} from '@/redux/api'
import { useAppSelector } from "@/redux/hooks"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { vi } from "date-fns/locale"
import { useRouter } from "next/navigation"

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
const reservationStatusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  "Tất cả": "Tất cả"
}
const reservationStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
}
const reservationStatusIcons: Record<string, React.JSX.Element> = {
  pending: <AlertCircle size={12} />,
  confirmed: <CheckCircle size={12} />,
  cancelled: <XCircle size={12} />
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

// ReservationStatusBadge component
const ReservationStatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${reservationStatusColors[status]}`}>
    {reservationStatusIcons[status]}
    <span className="ml-1">{reservationStatusLabels[status]}</span>
  </span>
)

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  nickname: string;
}

export default function ReservationsManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Queries
  const { data: restaurants, isLoading: isLoadingRestaurants, error: restaurantsError } = useGetRestaurantsQuery()
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

  // Get user data for creator and updater
  const { data: creatorData } = useGetUserByIdQuery(
    selectedReservation?.createdBy as string || '',
    { skip: !selectedReservation?.createdBy }
  )
  const { data: updaterData } = useGetUserByIdQuery(
    selectedReservation?.updatedBy as string || '',
    { skip: !selectedReservation?.updatedBy }
  )

  // Debug logs
  useEffect(() => {
    console.log('Selected date:', selectedDate)
    console.log('Date query params:', {
      startDate: format(selectedDate, 'yyyy-MM-dd'),
      endDate: format(selectedDate, 'yyyy-MM-dd')
    })
    console.log('Raw reservations:', reservations)
  }, [selectedDate, reservations])

  // Mutations
  const [updateReservationStatus] = useUpdateReservationStatusMutation()
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation()
  const [updateReservation] = useUpdateReservationMutation()
  const [deleteReservation, { isLoading: isDeleting }] = useDeleteReservationMutation()

  // Helper function to get restaurant name
  const getRestaurantName = (restaurantId: string | Restaurant): string => {
    if (!restaurantId) {
      console.log('No restaurant ID provided')
      return "Không có thông tin"
    }

    // If restaurantId is an object (populated), return its name directly
    if (typeof restaurantId === 'object' && 'name' in restaurantId) {
      return restaurantId.name
    }

    // If restaurantId is a string, find the restaurant in the list
    if (isLoadingRestaurants) {
      console.log('Restaurants are still loading')
      return "Đang tải..."
    }

    if (!restaurants) {
      console.log('No restaurants data available')
      return "Đang tải..."
    }

    if (!Array.isArray(restaurants)) {
      console.error('Restaurants data is not an array:', restaurants)
      return "Lỗi dữ liệu"
    }

    console.log('Looking for restaurant with ID:', restaurantId)
    console.log('Available restaurants:', restaurants.map(r => ({ id: r._id, name: r.name })))
    
    const restaurant = restaurants.find(r => r._id === restaurantId)

    if (!restaurant) {
      console.log('Restaurant not found for ID:', restaurantId)
      return "Không tìm thấy"
    }

    console.log('Found restaurant:', restaurant)
    return restaurant.name
  }

  // Helper function to get restaurant ID as string
  const getRestaurantId = (restaurantId: string | Restaurant): string => {
    if (typeof restaurantId === 'object' && '_id' in restaurantId) {
      return restaurantId._id
    }
    return restaurantId
  }

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
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
    router.push('/reservation')
  }

  const handleEditReservation = (reservation: Reservation) => {
    // Prevent editing cancelled reservations
    if (reservation.status === "cancelled") {
      toast({
        title: "Không thể chỉnh sửa",
        description: "Không thể chỉnh sửa đơn đặt bàn đã hủy",
        variant: "destructive",
      })
      return
    }
    
    setSelectedReservation(null) // Close details modal
    setIsEditModalOpen(true)
    setSelectedReservation(reservation)
  }

  const handleSaveReservation = async (formData: any) => {
    try {
      console.log('Form data being submitted:', formData);
      if (!user?.id) {
        toast({
          title: "Lỗi",
          description: "Bạn cần đăng nhập để thực hiện thao tác này",
          variant: "destructive",
        })
        return
      }

      if (isEditModalOpen && selectedReservation) {
        // Update existing reservation
        await updateReservation({
          id: selectedReservation._id,
          reservation: {
            ...formData,
            restaurantId: getRestaurantId(formData.restaurantId)
          }
        }).unwrap()
        
        // Close edit modal first
        setIsEditModalOpen(false)
        
        // Refetch data and update UI
        await refetch()
        
        // Get the updated reservation data
        const updatedReservations = await refetch()
        const updatedReservation = updatedReservations.data?.find(
          (r) => r._id === selectedReservation._id
        )
        
        if (updatedReservation) {
          setSelectedReservation(updatedReservation)
        }
        
        toast({
          title: "Cập nhật đơn đặt bàn thành công",
          description: "Thông tin đơn đặt bàn đã được cập nhật",
        })
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

  // Filter and sort reservations
  const displayedReservations = useMemo(() => {
    console.log('Filtering reservations with status:', selectedStatus)
    console.log('Available reservations:', reservations)
    
    let result = reservations || []
    
    // Filter by status if not "Tất cả"
    if (selectedStatus !== "Tất cả") {
      result = result.filter(r => r.status === selectedStatus.toLowerCase())
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => 
        r.customerName.toLowerCase().includes(query) ||
        r.customerPhone.toLowerCase().includes(query)
      )
    }
    
    // Sort by date and time
    result = [...result].sort((a, b) => {
      const dateA = new Date(`${a.reservationDate} ${a.reservationTime}`)
      const dateB = new Date(`${b.reservationDate} ${b.reservationTime}`)
      return dateA.getTime() - dateB.getTime()
    })
    
    console.log('Filtered reservations:', result)
    return result
  }, [reservations, selectedStatus, searchQuery])

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
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Filter size={20} />
                    <span>
                      Trạng thái: {reservationStatusLabels[selectedStatus]}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {reservationStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {reservationStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-7 gap-4 p-4 border-b text-sm font-medium text-gray-500">
              <div>KHÁCH HÀNG</div>
              <div>NHÀ HÀNG</div>
              <div>THỜI GIAN</div>
              <div>SỐ NGƯỜI</div>
              <div>TRẠNG THÁI</div>
              <div className="text-right">THAO TÁC</div>
            </div>
            <div className="divide-y">
              {displayedReservations.map((reservation) => (
                <div key={reservation._id} className="grid grid-cols-7 gap-4 p-4 text-sm items-center">
                  <div>
                    <div className="font-medium">{reservation.customerName}</div>
                    <div className="text-gray-500">{reservation.customerPhone}</div>
                  </div>
                  <div>{getRestaurantName(reservation.restaurantId)}</div>
                  <div>
                    <div>{reservation.reservationTime}</div>
                    <div className="text-gray-500">{format(new Date(reservation.reservationDate), 'dd/MM/yyyy')}</div>
                  </div>
                  <div>{reservation.numberOfGuests} người</div>
                  <div>
                    <ReservationStatusBadge status={reservation.status} />
                  </div>
                  <div className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(reservation)}>
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))}
              {(!displayedReservations || displayedReservations.length === 0) && (
                <div className="col-span-7 p-4 text-center text-sm text-gray-500">
                  Không có đặt bàn nào vào ngày này
                </div>
              )}
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
                    {getRestaurantName(selectedReservation.restaurantId)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Người tạo</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon size={16} />
                  <p className="text-sm">{creatorData?.fullName || "N/A"}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cập nhật cuối</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserIcon size={16} />
                  <p className="text-sm">{updaterData?.fullName || "N/A"}</p>
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
                <>
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
                    <Edit size={16} />
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
                </>
              )}

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
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chỉnh Sửa Đặt Bàn</h2>
              <button 
                onClick={() => {
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
