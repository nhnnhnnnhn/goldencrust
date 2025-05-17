"use client"

import { useState, useEffect } from "react"
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
import { 
  useGetRestaurantsQuery, 
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation
} from '@/redux/api'
import {
  useGetTablesByRestaurantQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
  useGetAvailableTablesQuery,
} from '@/redux/api/tableApi'
import {
  useCreateReservedTableMutation,
  useUpdateReservedTableStatusMutation,
  useGetReservedTablesByTableQuery,
  useCheckTableAvailabilityMutation
} from '@/redux/api/reservedTableApi'

// Định nghĩa kiểu dữ liệu cho Restaurant
interface Restaurant {
  _id: string
  name: string
  description?: string
  address: string
  phone: string
  email: string
  openingHours?: {
    open: string
    close: string
  }
  status: 'open' | 'closed'
  rating?: number
  cuisine?: string[]
  images?: string[]
  deleted: boolean
  createdAt: string
  updatedAt: string
  tableNumber: number
}

interface ReservedTable {
  _id: string
  tableId: string
  userId?: string
  date: string | Date
  time: string
  status: 'reserved' | 'completed' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

interface RestaurantFormData {
  _id?: string; // Optional for new restaurants
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'open' | 'closed';
  tableNumber: number;
}

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

// Update the Table interface
interface Table {
  _id?: string
  restaurantId: string
  tableNumber: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  location: string
  customerName?: string | null
  reservationTime?: string | null
}

export default function TableManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false)
  const [currentTable, setCurrentTable] = useState<Partial<Table> | null>(null)
  const [currentRestaurant, setCurrentRestaurant] = useState<RestaurantFormData | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("")

  // API Hooks
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
  const { data: tables = [], isLoading: isLoadingTables } = useGetTablesByRestaurantQuery(selectedRestaurantId, {
    skip: !selectedRestaurantId
  })
  const [createTable] = useCreateTableMutation()
  const [updateTable] = useUpdateTableMutation()
  const [updateTableStatus] = useUpdateTableStatusMutation()
  const [deleteTable] = useDeleteTableMutation()
  const [createReservedTable] = useCreateReservedTableMutation()
  const [updateReservedTableStatus] = useUpdateReservedTableStatusMutation()
  const [checkTableAvailability] = useCheckTableAvailabilityMutation()
  const { data: reservedTables = [] } = useGetReservedTablesByTableQuery(currentTable?._id || '', {
    skip: !currentTable?._id
  })
  const [createRestaurant] = useCreateRestaurantMutation()

  // Add console logs for debugging
  useEffect(() => {
    console.log('Selected Restaurant ID:', selectedRestaurantId)
    console.log('Fetched Tables:', tables)
  }, [selectedRestaurantId, tables])

  // Set initial selected restaurant
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0]._id)
    }
  }, [restaurants, selectedRestaurantId])

  // Filtered tables with type check
  const filteredTables = Array.isArray(tables) ? tables.filter((table: Table) => {
    console.log('Filtering table:', table)
    const matchesSearch = table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.customerName && table.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === "All" || table.status === selectedStatus
    const matchesLocation = selectedLocation === "All" || table.location === selectedLocation

    return matchesSearch && matchesStatus && matchesLocation
  }) : []

  // Xử lý thêm bàn mới
  const handleAddTable = () => {
    if (!selectedRestaurantId) {
      toast({
        title: "Error",
        description: "Please select a restaurant first",
        variant: "destructive",
      })
      return
    }

    const newTable: Partial<Table> = {
      restaurantId: selectedRestaurantId,
      tableNumber: "",
      capacity: 4,
      status: "available" as const,
      location: "Main Hall",
      customerName: null,
      reservationTime: null
    }
    
    setCurrentTable(newTable)
    setShowAddEditModal(true)
  }

  // Xử lý thêm nhà hàng mới
  const handleAddRestaurant = () => {
    setCurrentRestaurant({
      name: "",
      address: "",
      phone: "",
      email: "",
      status: "closed",
      tableNumber: 0,
    })
    setShowAddRestaurantModal(true)
  }

  // Xử lý sửa bàn
  const handleEditTable = (table: Table) => {
    setCurrentTable(table)
    setShowAddEditModal(true)
  }

  // Xử lý xóa bàn
  const handleDeleteClick = async (table: Table) => {
    if (!table._id) return;
    
    if (confirm("Are you sure you want to delete this table?")) {
      try {
        await deleteTable(table._id).unwrap()
        toast({
          title: "Success",
          description: `Table ${table.tableNumber} has been deleted.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete table",
          variant: "destructive",
        })
      }
    }
  }

  // Xử lý lưu bàn (thêm mới hoặc cập nhật)
  const handleSaveTable = async () => {
    if (!currentTable || !currentTable.restaurantId || !currentTable.tableNumber || !currentTable.capacity || !currentTable.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      if (currentTable._id) {
        // Update existing table
        const { _id, ...updateData } = currentTable
        await updateTable({
          id: _id,
          data: updateData
        }).unwrap()
        toast({
          title: "Success",
          description: `Table ${currentTable.tableNumber} has been updated.`,
        })
      } else {
        // Create new table - only send required fields
        const newTableData = {
          restaurantId: currentTable.restaurantId,
          tableNumber: currentTable.tableNumber,
          capacity: Number(currentTable.capacity),
          location: currentTable.location
        }
        console.log('Creating table with data:', newTableData)
        try {
          const result = await createTable(newTableData).unwrap()
          console.log('Table created successfully:', result)
          toast({
            title: "Success",
            description: `Table ${currentTable.tableNumber} has been created.`,
          })
        } catch (error) {
          const err = error as { 
            status?: number;
            data?: { message?: string; error?: string };
            error?: string;
          }
          console.error('Error saving table:', {
            status: err?.status,
            message: err?.data?.message || err?.data?.error,
            error: err?.error,
            fullError: JSON.stringify(err, null, 2)
          })
          throw error // Re-throw to be caught by outer catch
        }
      }
      setShowAddEditModal(false)
    } catch (error) {
      const err = error as { 
        status?: number;
        data?: { message?: string; error?: string };
        error?: string;
      }
      console.error('Error saving table:', {
        status: err?.status,
        message: err?.data?.message || err?.data?.error,
        error: err?.error,
        fullError: JSON.stringify(err, null, 2)
      })
      toast({
        title: "Error",
        description: err?.data?.message || err?.data?.error || err?.error || "Failed to save table. Please check the console for details.",
        variant: "destructive",
      })
    }
  }

  // Xử lý cập nhật trạng thái bàn
  const handleUpdateStatus = async (id: string | undefined, newStatus: "available" | "occupied" | "reserved") => {
    if (!id) {
      toast({
        title: "Error",
        description: "Table ID is required",
        variant: "destructive",
      })
      return
    }

    try {
      await updateTableStatus({
        id,
        data: { status: newStatus }
      }).unwrap()

      // Nếu bàn trở thành available, kiểm tra và cập nhật trạng thái đặt bàn
      if (newStatus === "available") {
        const activeReservation = reservedTables.find((rt: ReservedTable) => rt.status === "reserved")
        if (activeReservation) {
          await updateReservedTableStatus({
            id: activeReservation._id,
            status: "completed"
          }).unwrap()
        }
      }

      toast({
        title: "Success",
        description: `Table status has been updated to ${statusLabels[newStatus]}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive",
      })
    }
  }

  // Xử lý kiểm tra tình trạng bàn
  const handleCheckAvailability = async (tableId: string, date: string, time: string) => {
    try {
      const { isAvailable, existingReservation } = await checkTableAvailability({
        tableId,
        date,
        time
      }).unwrap()

      if (!isAvailable && existingReservation) {
        toast({
          title: "Table Not Available",
          description: `This table is already reserved by ${existingReservation.userId} at ${existingReservation.time}`,
        })
      } else {
        toast({
          title: "Table Available",
          description: "This table is available for reservation",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check table availability",
        variant: "destructive",
      })
    }
  }

  // Xử lý xem chi tiết bàn
  const handleViewDetails = (table: Table) => {
    // Implement view details logic here
  }

  const handleEditRestaurant = (restaurant: Restaurant) => {
    // Implement edit restaurant logic here
  }

  // Xử lý lưu nhà hàng
  const handleSaveRestaurant = async () => {
    if (!currentRestaurant) return

    try {
      const restaurantData: Partial<Restaurant> = {
        name: currentRestaurant.name,
        address: currentRestaurant.address,
        phone: currentRestaurant.phone,
        email: currentRestaurant.email,
        status: currentRestaurant.status,
        tableNumber: currentRestaurant.tableNumber,
      }
      
      const response = await createRestaurant(restaurantData).unwrap()
      toast({
        title: "Success",
        description: "Restaurant added successfully",
      })
      
      // Tự động chọn nhà hàng mới tạo
      if (response?._id) {
        setSelectedRestaurantId(response._id)
      }
      setShowAddRestaurantModal(false)
      setCurrentRestaurant(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to add restaurant",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRestaurantClick = async (restaurant: Restaurant) => {
    // Implement delete restaurant logic here
  }

  // Xử lý in hóa đơn cho bàn
  const handlePrintTableReceipt = (table: Table) => {
    // Implement print receipt logic here
  }

  return (
    <div className="space-y-6 p-6">
      {/* Restaurant Selection */}
      <div className="flex items-center space-x-4">
        <Select
          value={selectedRestaurantId}
          onValueChange={setSelectedRestaurantId}
          disabled={isLoadingRestaurants}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddTable} disabled={!selectedRestaurantId}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Table
        </Button>
        <Button onClick={handleAddRestaurant}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Selected Restaurant Info */}
      {selectedRestaurantId && (
        <div className="bg-white p-4 rounded-lg shadow">
          {restaurants.find(r => r._id === selectedRestaurantId) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-gray-500" />
                <span className="font-medium">
                  {restaurants.find(r => r._id === selectedRestaurantId)?.name}
                </span>
      </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>
                  {restaurants.find(r => r._id === selectedRestaurantId)?.address}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restaurant Modal */}
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
                        {restaurant.name}
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

      {/* Add Restaurant Modal */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Restaurant</h2>
              <button onClick={() => setShowAddRestaurantModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <Input
                  type="text"
                  value={currentRestaurant?.name || ""}
                  onChange={(e) => setCurrentRestaurant(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  type="text"
                  value={currentRestaurant?.address || ""}
                  onChange={(e) => setCurrentRestaurant(prev => ({ ...prev!, address: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="text"
                  value={currentRestaurant?.phone || ""}
                  onChange={(e) => setCurrentRestaurant(prev => ({ ...prev!, phone: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={currentRestaurant?.email || ""}
                  onChange={(e) => setCurrentRestaurant(prev => ({ ...prev!, email: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={currentRestaurant?.status || "closed"}
                  onValueChange={(value: 'open' | 'closed') => 
                    setCurrentRestaurant(prev => ({ ...prev!, status: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables</label>
                <Input
                  type="number"
                  value={currentRestaurant?.tableNumber || 0}
                  onChange={(e) => setCurrentRestaurant(prev => ({ ...prev!, tableNumber: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddRestaurantModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRestaurant}>
                Save Restaurant
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  {status !== "All" && statusIcons[status as keyof typeof statusIcons]}
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
    </div>
  )
}