import { useState } from "react"
import { format } from "date-fns"
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

export function ReservationForm({
  initialData,
  restaurants,
  onSubmit,
  onCancel,
  isSubmitting
}: ReservationFormProps) {
  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || "",
    customerPhone: initialData?.customerPhone || "",
    reservationDate: initialData?.reservationDate 
      ? format(new Date(initialData.reservationDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    reservationTime: initialData?.reservationTime || "18:00",
    numberOfGuests: initialData?.numberOfGuests || 2,
    specialRequests: initialData?.specialRequests || "",
    restaurantId: initialData?.restaurantId || (restaurants[0]?._id || ""),
    status: initialData?.status || "pending"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <Input
            type="text"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className="w-full"
            required
          />
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
            <Input
              type="time"
              value={formData.reservationTime}
              onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
              className="w-full pl-10"
              required
            />
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
              min="1"
              value={formData.numberOfGuests || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1);
                setFormData({ ...formData, numberOfGuests: value });
              }}
              className="w-full pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhà hàng
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
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