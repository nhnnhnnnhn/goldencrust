import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { Calendar, Clock, Users, Building, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Restaurant, type Reservation } from "@/redux/api"
import { TimePickerGrid } from "@/components/ui/time-picker"

// Update the Reservation type to include both string and Restaurant object for restaurantId
interface ReservationWithPopulatedRestaurant extends Omit<Reservation, 'restaurantId'> {
  restaurantId: string | Restaurant;
}

const timeSlots = [
  { hour: "06", minute: "00", period: "CH" },
  { hour: "07", minute: "00", period: "CH" },
  { hour: "08", minute: "00", period: "CH" },
  { hour: "09", minute: "00", period: "CH" },
  { hour: "10", minute: "00", period: "CH" },
  { hour: "11", minute: "00", period: "CH" },
  { hour: "12", minute: "00", period: "CH" },
  { hour: "13", minute: "00", period: "CH" },
  { hour: "14", minute: "00", period: "CH" },
  { hour: "15", minute: "00", period: "CH" },
  { hour: "16", minute: "00", period: "CH" },
  { hour: "17", minute: "00", period: "CH" },
  { hour: "18", minute: "00", period: "CH" },
  { hour: "19", minute: "00", period: "CH" },
  { hour: "20", minute: "00", period: "CH" },
  { hour: "21", minute: "00", period: "CH" },
];

interface ReservationFormProps {
  initialData?: ReservationWithPopulatedRestaurant
  restaurants: Restaurant[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function ReservationForm({
  initialData,
  restaurants,
  onSubmit,
  onCancel,
  isSubmitting
}: ReservationFormProps) {
  // Add debug logging at the start
  console.log('ReservationForm mount:', {
    initialData,
    restaurantId: initialData?.restaurantId,
    restaurants: restaurants.map(r => ({ id: r._id, name: r.name })),
    restaurantMatch: initialData ? restaurants.find(r => r._id === initialData.restaurantId) : null
  });

  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || "",
    customerPhone: initialData?.customerPhone || "",
    reservationDate: initialData?.reservationDate 
      ? format(new Date(initialData.reservationDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    reservationTime: initialData?.reservationTime || "18:00",
    numberOfGuests: initialData?.numberOfGuests || 2,
    specialRequests: initialData?.specialRequests || "",
    restaurantId: (typeof initialData?.restaurantId === 'string' 
      ? initialData.restaurantId 
      : initialData?.restaurantId?._id) || (restaurants[0]?._id || ""),
    status: initialData?.status || "pending"
  })

  // Add a useEffect to log when restaurants or initialData changes
  useEffect(() => {
    console.log('Data changed:', {
      restaurantId: initialData?.restaurantId,
      restaurants: restaurants.map(r => ({ id: r._id, name: r.name })),
      match: restaurants.find(r => r._id === initialData?.restaurantId)
    });
  }, [restaurants, initialData]);

  // Check if this is a past confirmed reservation
  const isPastConfirmedReservation = useMemo(() => {
    if (!initialData || initialData.status !== 'confirmed') return false;
    const reservationDateTime = new Date(`${initialData.reservationDate}T${initialData.reservationTime}`);
    return reservationDateTime < new Date();
  }, [initialData]);

  const [errors, setErrors] = useState<{
    customerName?: string;
    customerPhone?: string;
    reservationDate?: string;
    reservationTime?: string;
    restaurantId?: string;
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const now = new Date();
    const selectedDateTime = new Date(`${formData.reservationDate}T${formData.reservationTime}`);

    console.log('Validating form:', {
      formData,
      selectedDateTime,
      now,
      isPastConfirmedReservation
    });

    // If this is a past confirmed reservation, prevent any changes
    if (isPastConfirmedReservation) {
      newErrors.customerName = "Không thể chỉnh sửa đơn đặt bàn đã xác nhận trong quá khứ";
      return false;
    }

    // Validate customer name (only letters and spaces, including Vietnamese characters)
    const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Tên khách hàng không được để trống";
    } else if (!nameRegex.test(formData.customerName.trim())) {
      newErrors.customerName = "Tên khách hàng chỉ được chứa chữ cái và khoảng trắng";
    }

    // Validate phone number (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.customerPhone)) {
      newErrors.customerPhone = "Số điện thoại phải có 10-11 số";
    }

    // Validate reservation date and time
    if (selectedDateTime < now) {
      if (initialData) {
        // For editing: Don't allow changing to a past date/time
        if (formData.reservationDate !== format(new Date(initialData.reservationDate), "yyyy-MM-dd") ||
            formData.reservationTime !== initialData.reservationTime) {
          newErrors.reservationDate = "Không thể đổi thời gian đặt bàn về quá khứ";
        }
      } else {
        newErrors.reservationDate = "Thời gian đặt bàn phải là thời gian trong tương lai";
      }
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }

  // If this is a past confirmed reservation, disable all inputs
  const isInputDisabled = isPastConfirmedReservation;

  // Add a function to check if a time is valid for selection
  const isTimeDisabled = (time: string) => {
    if (isPastConfirmedReservation) return true;
    
    const selectedDateTime = new Date(`${formData.reservationDate}T${time}`);
    const now = new Date();
    
    // If editing, don't allow changing to a past time
    if (initialData) {
      if (selectedDateTime < now) {
        return true;
      }
    } else {
      // For new reservations, don't allow past times
      if (selectedDateTime < now) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isPastConfirmedReservation && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Đơn đặt bàn này đã được xác nhận và đã qua thời gian đặt. Không thể chỉnh sửa.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khách hàng
          </label>
          <Input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className={`w-full ${errors.customerName ? 'border-red-500' : ''}`}
            required
            disabled={isInputDisabled}
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
            type="text"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className={`w-full ${errors.customerPhone ? 'border-red-500' : ''}`}
            required
            disabled={isInputDisabled}
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
              onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
              className={`w-full pl-10 ${errors.reservationDate ? 'border-red-500' : ''}`}
              min={format(new Date(), "yyyy-MM-dd")}
              required
              disabled={isInputDisabled}
            />
          </div>
          {errors.reservationDate && (
            <p className="mt-1 text-sm text-red-500">{errors.reservationDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ đặt
          </label>
          <div className="relative">
            <TimePickerGrid
              value={formData.reservationTime}
              onChange={(time) => setFormData({ ...formData, reservationTime: time })}
              disabled={isInputDisabled}
              minTime="11:00"
              maxTime="21:00"
              interval={30}
              className={errors.reservationTime ? 'border-red-500' : ''}
            />
          </div>
          {errors.reservationTime && (
            <p className="mt-1 text-sm text-red-500">{errors.reservationTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số người
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input
              type="number"
              min="1"
              value={formData.numberOfGuests || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1);
                setFormData({ ...formData, numberOfGuests: value });
              }}
              className="w-full pl-10"
              required
              disabled={isInputDisabled}
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
              // If editing, show restaurant name in a disabled input
              <div className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                                {(() => {                  if (typeof initialData.restaurantId === 'string') {                    const restaurant = restaurants.find(r => r._id === initialData.restaurantId);                    return restaurant ? restaurant.name : 'Đang tải thông tin nhà hàng...';                  } else if (typeof initialData.restaurantId === 'object' && initialData.restaurantId !== null) {                    return initialData.restaurantId.name;                  }                  return 'Không tìm thấy thông tin nhà hàng';                })()}
              </div>
            ) : (
              // If creating new, show select component
              <Select
                value={formData.restaurantId}
                onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
                disabled={!!initialData || isInputDisabled}
              >
                <SelectTrigger className={`w-full pl-10 ${errors.restaurantId ? 'border-red-500' : ''}`}>
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
            {errors.restaurantId && (
              <p className="mt-1 text-sm text-red-500">{errors.restaurantId}</p>
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
          disabled={isInputDisabled}
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
          disabled={isSubmitting || isInputDisabled}
        >
          {isSubmitting ? "Đang lưu..." : (initialData ? "Cập nhật" : "Thêm mới")}
        </Button>
      </div>
    </form>
  )
} 