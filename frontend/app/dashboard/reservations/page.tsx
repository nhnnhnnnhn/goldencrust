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
import { getTranslation } from "@/utils/translations"

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
const reservationStatuses = ["all", "pending", "confirmed", "cancelled"]
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
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>(undefined)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Listen for language changes
  useEffect(() => {
    // Get initial language
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "vi")) {
        setLanguage(e.newValue)
      }
    }

    // Listen for custom language change event (from same tab)
    const handleLanguageChange = (e: CustomEvent<"en" | "vi">) => {
      setLanguage(e.detail)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("languageChange", handleLanguageChange as EventListener)
    }
  }, [])

  const t = getTranslation(language)

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
      return t.reservations.messages.noData
    }

    // If restaurantId is an object (populated), return its name directly
    if (typeof restaurantId === 'object' && 'name' in restaurantId) {
      return restaurantId.name
    }

    // If restaurantId is a string, find the restaurant in the list
    if (isLoadingRestaurants) {
      console.log('Restaurants are still loading')
      return t.reservations.messages.loading
    }

    if (!restaurants) {
      console.log('No restaurants data available')
      return t.reservations.messages.loading
    }

    if (!Array.isArray(restaurants)) {
      console.error('Restaurants data is not an array:', restaurants)
      return t.reservations.messages.error
    }

    console.log('Looking for restaurant with ID:', restaurantId)
    console.log('Available restaurants:', restaurants.map(r => ({ id: r._id, name: r.name })))
    
    const restaurant = restaurants.find(r => r._id === restaurantId)

    if (!restaurant) {
      console.log('Restaurant not found for ID:', restaurantId)
      return t.reservations.messages.noData
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
    setSelectedReservation(reservation)
    setIsEditModalOpen(true)
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
        title: t.reservations.messages.deleteSuccess,
        variant: "default",
      })
      setIsDeleteModalOpen(false)
      setSelectedReservation(undefined)
    } catch (error) {
      toast({
        title: t.reservations.messages.error,
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

  // Helper function to safely format date
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return t.reservations.messages.noData;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return t.reservations.messages.noData;
      }
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      console.error('Error formatting date:', error);
      return t.reservations.messages.noData;
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.reservations.title}</h1>
        <p className="mt-2 text-gray-600">{t.reservations.description}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.reservations.filters.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.reservations.status.all}</SelectItem>
            <SelectItem value="pending">{t.reservations.status.pending}</SelectItem>
            <SelectItem value="confirmed">{t.reservations.status.confirmed}</SelectItem>
            <SelectItem value="cancelled">{t.reservations.status.cancelled}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder={t.reservations.filters.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button onClick={() => setIsEditModalOpen(true)}>
          {t.reservations.actions.add}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.customer}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.restaurant}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.date}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.time}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.guests}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.status}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  {t.reservations.table.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t.reservations.messages.loading}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-red-500">
                    {t.reservations.messages.error}
                  </td>
                </tr>
              ) : !reservations || reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t.reservations.messages.noData}
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation._id} className="border-b">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{getRestaurantName(reservation.restaurantId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{formatDate(reservation.reservationDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.reservationTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{reservation.numberOfGuests}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ReservationStatusBadge status={reservation.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(reservation)}
                        >
                          {t.reservations.actions.view}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReservation(reservation)}
                        >
                          {t.reservations.actions.edit}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(reservation)}
                        >
                          {t.reservations.actions.delete}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {selectedReservation ? t.reservations.form.title : t.reservations.actions.add}
            </h2>
            <ReservationForm
              initialData={selectedReservation}
              onSubmit={handleSaveReservation}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedReservation(undefined)
              }}
              restaurants={restaurants || []}
              isSubmitting={isCreating}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-red-600">
              {t.reservations.messages.confirmDelete}
            </h2>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                {t.reservations.actions.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t.reservations.messages.loading : t.reservations.actions.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
