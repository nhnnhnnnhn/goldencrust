"use client"

import { useState, useEffect, useMemo } from "react"
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
  useGetRestaurantByIdQuery,
  useGetUserByIdQuery,
  type Restaurant,
  type Reservation
} from '@/redux/api'
import { useAppSelector } from "@/redux/hooks"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { vi } from "date-fns/locale"
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

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

function RestaurantInfo({ restaurantId }: { restaurantId: string | Restaurant }) {
  // If restaurantId is actually a Restaurant object (populated data), display it directly
  if (typeof restaurantId !== 'string' && restaurantId?.name) {
    return (
      <>
        <div className="font-medium">{restaurantId.name}</div>
        <div className="text-xs text-gray-500">{restaurantId.address}</div>
        <div className="text-xs text-gray-500">{restaurantId.phone}</div>
      </>
    );
  }

  // Otherwise, fetch the restaurant data
  const { data: restaurantData, error, isLoading } = useGetRestaurantByIdQuery(
    restaurantId as string,
    {
      // Skip the query if restaurantId is not a valid string
      skip: typeof restaurantId !== 'string' || !restaurantId || restaurantId.length !== 24
    }
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-900 border-t-transparent"></div>
        <span>Loading...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    let errorMessage = 'Không thể tải thông tin nhà hàng';
    
    if ('status' in error) {
      // Handle FetchBaseQueryError
      const fetchError = error as { status: number; data?: any };
      if (fetchError.status === 404) {
        errorMessage = 'Nhà hàng không tồn tại';
      } else if (fetchError.status === 400) {
        errorMessage = 'ID nhà hàng không hợp lệ';
      } else if (fetchError.status === 401) {
        errorMessage = 'Vui lòng đăng nhập lại';
      } else if (fetchError.data?.message) {
        errorMessage = fetchError.data.message;
      }
    } else if ('message' in error) {
      // Handle SerializedError
      errorMessage = error.message || errorMessage;
    }

    console.error('Restaurant fetch error:', {
      error,
      restaurantId,
      errorMessage
    });

    return (
      <div className="text-red-600 text-sm">
        {errorMessage}
      </div>
    );
  }

  // Show not found state
  if (!restaurantData) {
    return (
      <div className="text-yellow-600 text-sm">
        {typeof restaurantId !== 'string' || !restaurantId || restaurantId.length !== 24
          ? 'ID nhà hàng không hợp lệ'
          : 'Không tìm thấy thông tin nhà hàng'
        }
      </div>
    );
  }

  // Show restaurant data
  return (
    <>
      <div className="font-medium">{restaurantData.name}</div>
      <div className="text-xs text-gray-500">{restaurantData.address}</div>
      <div className="text-xs text-gray-500">{restaurantData.phone}</div>
    </>
  );
}

function UserInfo({ userId }: { userId: string | undefined }) {
  const { data: userData, error, isLoading } = useGetUserByIdQuery(userId || '', {
    skip: !userId || userId.length !== 24
  });

  if (!userId) {
    return <span className="text-gray-500">N/A</span>;
  }

  if (isLoading) {
    return <span className="text-gray-500">Đang tải...</span>;
  }

  if (error) {
    console.error('Error fetching user:', error);
    return <span className="text-gray-500">{userId}</span>;
  }

  if (!userData) {
    return <span className="text-gray-500">{userId}</span>;
  }

  return <span>{userData.fullName || userData.email}</span>;
}

// Helper functions to check error types
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error != null && 'message' in error;
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
  const { data: restaurants, isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
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

  // Debug logs
  useEffect(() => {
    console.log('Restaurants data:', restaurants);
    console.log('Reservations data:', reservations);
    if (error) {
      console.error('Reservations error:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  }, [restaurants, reservations, error, toast]);

  // Mutations
  const [updateReservationStatus] = useUpdateReservationStatusMutation()
  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation()
  const [updateReservation] = useUpdateReservationMutation()
  const [deleteReservation, { isLoading: isDeleting }] = useDeleteReservationMutation()

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    // Implement view details modal
  }

  // Helper function to check if reservation is in the past
  const isReservationInPast = (reservation: Reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    reservationDate.setHours(
      parseInt(reservation.reservationTime.split(':')[0]),
      parseInt(reservation.reservationTime.split(':')[1]),
      0,
      0
    );
    const now = new Date();
    
    // For debugging
    console.log('Checking if reservation is in past:', {
      reservationDate: reservationDate.toISOString(),
      reservationTime: reservation.reservationTime,
      now: now.toISOString(),
      isPast: reservationDate < now
    });
    
    return reservationDate < now;
  };

  const handleUpdateStatus = async (id: string, newStatus: "pending" | "confirmed" | "cancelled") => {
    try {
      // Get the reservation details
      const reservation = selectedReservation;
      if (!reservation) return;

      // Check if reservation is in the past
      if (isReservationInPast(reservation)) {
        toast({
          title: "Không thể cập nhật trạng thái",
          description: "Không thể thay đổi trạng thái đơn đặt bàn trong quá khứ",
          variant: "destructive",
        });
        return;
      }

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
      
      let errorMessage = 'Đã có lỗi xảy ra khi cập nhật trạng thái đơn đặt bàn';
      
      // Try to get a meaningful error message
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      }
      
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
    // Check if reservation is in the past and confirmed
    const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    const now = new Date();
    
    if (reservationDateTime < now && reservation.status === 'confirmed') {
      toast({
        title: "Không thể chỉnh sửa",
        description: "Không thể chỉnh sửa đơn đặt bàn đã xác nhận trong quá khứ",
        variant: "destructive",
      });
      return;
    }

    setSelectedReservation(null); // Close details modal
    setIsEditModalOpen(true);
    setSelectedReservation(reservation); // Set the reservation to edit
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
        
        // First refetch to get updated data
        await refetch()
        
        // Then close modal and show success message
        setIsAddModalOpen(false)
        toast({
          title: "Thêm đặt bàn thành công",
          description: "Đơn đặt bàn mới đã được tạo",
        })
      } else if (isEditModalOpen && selectedReservation) {
        console.log('Updating reservation:', {
          id: selectedReservation._id,
          formData
        });
        
        const result = await updateReservation({
          id: selectedReservation._id,
          reservation: {
            ...formData,
            updatedBy: user?.id
          }
        }).unwrap()
        console.log('Update result:', result);
        
        // First refetch to get updated data
        await refetch()
        
        // Then close modal and show success message
        setIsEditModalOpen(false)
        setSelectedReservation(null) // Clear selected reservation
        toast({
          title: "Cập nhật đơn đặt bàn thành công",
          description: "Thông tin đơn đặt bàn đã được cập nhật",
        })
      }
    } catch (error: any) {
      console.error('Error saving reservation:', {
        error,
        name: error?.name,
        message: error?.message,
        status: error?.status,
        data: error?.data,
        stack: error?.stack
      });
      
      let errorMessage = 'Đã có lỗi xảy ra khi lưu đơn đặt bàn';
      
      // Try to get a meaningful error message
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedReservation) return;

    try {
      console.log('Deleting reservation:', selectedReservation._id);
      await deleteReservation(selectedReservation._id).unwrap();
      console.log('Delete successful');

      // Refetch to ensure data consistency
      await refetch();
      
      toast({
        title: "Xóa đơn đặt bàn thành công",
        description: "Đơn đặt bàn đã được xóa",
      });
      
      setIsDeleteModalOpen(false);
      setSelectedReservation(null);
    } catch (error: any) {
      console.error('Error deleting reservation:', {
        error,
        name: error?.name,
        message: error?.message,
        status: error?.status,
        data: error?.data,
        stack: error?.stack
      });
      
      let errorMessage = 'Đã có lỗi xảy ra khi xóa đơn đặt bàn';
      
      // Try to get a meaningful error message
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      }
      
      toast({
        title: "Lỗi xóa đơn đặt bàn",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Lọc reservations theo search query và status
  const displayedReservations = useMemo(() => {
    let filtered = reservations || [];
    
    console.log('Filtering reservations:', {
      total: filtered.length,
      selectedStatus,
      searchQuery,
      currentReservations: filtered.map(r => ({
        id: r._id,
        status: r.status,
        name: r.customerName
      }))
    });

    // Filter by status if not "Tất cả"
    if (selectedStatus !== "Tất cả") {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus);
      console.log('After status filter:', {
        status: selectedStatus,
        count: filtered.length,
        filtered: filtered.map(r => ({
          id: r._id,
          status: r.status,
          name: r.customerName
        }))
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        reservation =>
          reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reservation.customerPhone.includes(searchQuery)
      );
      console.log('After search filter:', {
        searchQuery,
        count: filtered.length
      });
    }

    return filtered;
  }, [reservations, selectedStatus, searchQuery]);

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

  // Show loading state while loading restaurants or reservations
  if (isLoading || isLoadingRestaurants) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error loading data
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không thể tải dữ liệu đặt bàn</h2>
          <p className="text-gray-600">Vui lòng thử lại sau hoặc liên hệ hỗ trợ</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Show error state if restaurants failed to load
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Không thể tải dữ liệu nhà hàng</h2>
          <p className="text-gray-600 mt-2">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Tabs value="reservations" className="w-full">
        <TabsContent value="reservations">
          <div className="flex justify-between items-center mb-4">
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
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={20} />
                    <span>
                      Trạng thái:{" "}
                      {selectedStatus === "Tất cả"
                        ? selectedStatus
                        : reservationStatusLabels[selectedStatus as keyof typeof reservationStatusLabels]}
                    </span>
                    <ChevronDown size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                  <div className="flex flex-col gap-1">
                    {reservationStatuses.map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          setSelectedStatus(status);
                          // Reset search when changing status
                          setSearchQuery("");
                        }}
                      >
                        {status === "Tất cả" ? (
                          status
                        ) : (
                          <div className="flex items-center gap-2">
                            {reservationStatusIcons[status as keyof typeof reservationStatusIcons]}
                            <span>{reservationStatusLabels[status as keyof typeof reservationStatusLabels]}</span>
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
                          <RestaurantInfo restaurantId={reservation.restaurantId} />
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
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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
                  <div className="text-sm">
                    <RestaurantInfo restaurantId={selectedReservation.restaurantId} />
                  </div>
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
                  <User size={16} />
                  <p className="text-sm">
                    {selectedReservation.createdBy ? (
                      <UserInfo userId={selectedReservation.createdBy} />
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(selectedReservation.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cập nhật cuối</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <p className="text-sm">
                    {selectedReservation.updatedBy ? (
                      <UserInfo userId={selectedReservation.updatedBy} />
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </p>
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
              {/* Show warning if reservation is in the past */}
              {isReservationInPast(selectedReservation) && (
                <div className="w-full bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Đơn đặt bàn này đã qua thời gian đặt. Không thể thay đổi trạng thái.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedReservation.status !== "cancelled" && (
                <Button
                  onClick={async () => {
                    await handleUpdateStatus(selectedReservation._id, "cancelled")
                    setSelectedReservation(null)
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isReservationInPast(selectedReservation)}
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
                  disabled={isReservationInPast(selectedReservation)}
                >
                  <CheckCircle size={16} />
                  <span>Xác nhận</span>
                </Button>
              )}

              <Button
                onClick={() => handleEditReservation(selectedReservation)}
                className="flex items-center gap-2 bg-[#003087] hover:bg-[#002266] text-white"
                disabled={
                  (selectedReservation.status === 'confirmed' && isReservationInPast(selectedReservation))
                }
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
