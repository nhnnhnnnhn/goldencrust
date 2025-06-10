import { useState, useEffect, useMemo } from "react"
import { format, startOfToday, isBefore, parseISO, isPast } from "date-fns"
import { Calendar, Clock, Users, Building } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Restaurant, type Reservation } from "@/redux/api"

interface ReservationFormProps {
  initialData?: Reservation
  restaurants: Restaurant[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting: boolean
}

// Define available time slots
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00"
]

export function ReservationForm({
  initialData,
  restaurants,
  onSubmit,
  onCancel,
  isSubmitting
}: ReservationFormProps) {
  const today = startOfToday()
  
  // Add validation states
  const [errors, setErrors] = useState({
    customerName: "",
    customerPhone: "",
    reservationTime: ""
  })
  
  // Helper function to get restaurant ID
  const getInitialRestaurantId = () => {
    if (!initialData?.restaurantId) return restaurants[0]?._id || ""
    return typeof initialData.restaurantId === 'string' 
      ? initialData.restaurantId 
      : initialData.restaurantId._id
  }
  
  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || "",
    customerPhone: initialData?.customerPhone || "",
    reservationDate: initialData?.reservationDate 
      ? format(new Date(initialData.reservationDate), "yyyy-MM-dd")
      : format(today, "yyyy-MM-dd"),
    reservationTime: initialData?.reservationTime || "18:00",
    numberOfGuests: initialData?.numberOfGuests || 2,
    specialRequests: initialData?.specialRequests || "",
    restaurantId: getInitialRestaurantId(),
    status: initialData?.status || "pending"
  })

  // Validate initial date on component mount
  useEffect(() => {
    const initialDate = formData.reservationDate
    if (isDateInPast(initialDate)) {
      setFormData(prev => ({ ...prev, reservationDate: format(today, "yyyy-MM-dd") }))
    }
  }, [])

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Vui lòng nhập tên khách hàng"
    }
    if (name.trim().length < 2) {
      return "Tên phải có ít nhất 2 ký tự"
    }
    if (!/^[\p{L}\s'-]+$/u.test(name.trim())) {
      return "Tên chỉ được chứa chữ cái và dấu"
    }
    return ""
  }

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return "Vui lòng nhập số điện thoại"
    }
    // Validate Vietnam phone number format
    const phoneRegex = /^(0|\+84)([1-9][0-9]{8}|[1-9][0-9]{9})$/
    if (!phoneRegex.test(phone.trim())) {
      return "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)"
    }
    return ""
  }

  // Handle input changes with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFormData({ ...formData, customerName: newName })
    setErrors({ ...errors, customerName: validateName(newName) })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value
    setFormData({ ...formData, customerPhone: newPhone })
    setErrors({ ...errors, customerPhone: validatePhone(newPhone) })
  }

  // Enhanced time validation
  const isTimeInPast = (date: string, time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const selectedDateTime = new Date(date)
    selectedDateTime.setHours(hours, minutes, 0, 0)
    return isPast(selectedDateTime)
  }

  // Validate initial time on component mount and when date changes
  useEffect(() => {
    const validateTime = () => {
      if (isTimeInPast(formData.reservationDate, formData.reservationTime)) {
        // If current time is in the past, set to next available time
        const now = new Date()
        const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0))
        const nextTimeSlot = format(nextHour, 'HH:mm')
        setFormData(prev => ({ ...prev, reservationTime: nextTimeSlot }))
        setErrors(prev => ({ 
          ...prev, 
          reservationTime: "Cannot select a time in the past" 
        }))
      } else {
        setErrors(prev => ({ ...prev, reservationTime: "" }))
      }
    }

    validateTime()
  }, [formData.reservationDate])

  // Filter available time slots based on selected date
  const availableTimeSlots = useMemo(() => {
    return TIME_SLOTS.filter(time => {
      if (formData.reservationDate === format(today, "yyyy-MM-dd")) {
        return !isTimeInPast(formData.reservationDate, time)
      }
      return true
    })
  }, [formData.reservationDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields before submission
    const nameError = validateName(formData.customerName)
    const phoneError = validatePhone(formData.customerPhone)
    const timeError = isTimeInPast(formData.reservationDate, formData.reservationTime) 
      ? "Cannot select a time in the past" 
      : ""
    
    setErrors({
      customerName: nameError,
      customerPhone: phoneError,
      reservationTime: timeError
    })

    // Check if there are any errors
    if (nameError || phoneError || timeError || isDateInPast(formData.reservationDate)) {
      return
    }

    onSubmit(formData)
  }

  // Enhanced date validation
  const isDateInPast = (date: string) => {
    const selectedDate = parseISO(date)
    const startOfSelectedDate = startOfToday()
    startOfSelectedDate.setHours(0, 0, 0, 0)
    return isBefore(selectedDate, startOfSelectedDate)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (!isDateInPast(newDate)) {
      setFormData({ ...formData, reservationDate: newDate })
    } else {
      // If past date is selected, reset to today
      setFormData({ ...formData, reservationDate: format(today, "yyyy-MM-dd") })
    }
  }

  // Helper function to get restaurant name
  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r._id === restaurantId)
    return restaurant ? restaurant.name : "Không tìm thấy nhà hàng"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khách hàng
          </label>
          <Input
            type="text"
            value={formData.customerName}
            onChange={handleNameChange}
            className={`w-full ${errors.customerName ? 'border-red-500' : ''}`}
            required
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <Input
            type="tel"
            value={formData.customerPhone}
            onChange={handlePhoneChange}
            className={`w-full ${errors.customerPhone ? 'border-red-500' : ''}`}
            required
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-500">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày đặt
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              type="date"
              value={formData.reservationDate}
              min={format(today, "yyyy-MM-dd")}
              onChange={handleDateChange}
              className="w-full pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ đặt
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Select
              value={formData.reservationTime}
              onValueChange={(value) => {
                if (!isTimeInPast(formData.reservationDate, value)) {
                  setFormData({ ...formData, reservationTime: value })
                  setErrors(prev => ({ ...prev, reservationTime: "" }))
                } else {
                  setErrors(prev => ({ 
                    ...prev, 
                    reservationTime: "Cannot select a time in the past" 
                  }))
                }
              }}
            >
              <SelectTrigger className={`w-full pl-10 ${errors.reservationTime ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Chọn giờ" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map((time) => (
                  <SelectItem 
                    key={time} 
                    value={time}
                    disabled={isTimeInPast(formData.reservationDate, time)}
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reservationTime && (
              <p className="mt-1 text-sm text-red-500">{errors.reservationTime}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số người
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              type="number"
              value={formData.numberOfGuests || ''}
              className="w-full pl-10 bg-gray-100 cursor-not-allowed"
              disabled
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhà hàng
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            {initialData ? (
              // If editing, show read-only restaurant name
              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {getRestaurantName(formData.restaurantId)}
              </div>
            ) : (
              // If adding new, show restaurant selection
              <Select
                value={formData.restaurantId}
                onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
              >
                <SelectTrigger className="w-full pl-10">
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
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yêu cầu đặc biệt
        </label>
        <Textarea
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          className="w-full"
          rows={4}
          placeholder="Nhập yêu cầu đặc biệt (nếu có)..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-[#003087] hover:bg-[#002266] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : (initialData ? "Cập nhật" : "Thêm mới")}
        </Button>
      </div>
    </form>
  )
} 