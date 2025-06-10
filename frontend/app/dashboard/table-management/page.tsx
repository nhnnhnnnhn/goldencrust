"use client"

import { useState, useEffect } from "react"
import {
  PlusCircle,
  Search,
  Filter,
  ChevronDown,
  X,
  Users,
  CheckCircle,
  XCircle,
  Building,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useGetRestaurantsQuery } from '@/redux/api'
import {
  useGetTablesByRestaurantQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
} from '@/redux/api/tableApi'

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

interface Table {
  _id?: string
  restaurantId: string
  tableNumber: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  deleted: boolean
}

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

// Thêm mapping cho prefix của mỗi nhà hàng
const RESTAURANT_PREFIX_MAP: { [key: string]: string } = {
  "GC Dong Da": "A",
  "GC Ha Dong": "B",
  "GC Dong Anh": "N",
  "GC Quoc Oai": "L"
}

export default function TableManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentTable, setCurrentTable] = useState<Partial<Table> | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("")
  const [tableNumberError, setTableNumberError] = useState<string>("")
  const [tableNumberSuffix, setTableNumberSuffix] = useState("")

  // API Hooks
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
  const { data: tables = [], isLoading: isLoadingTables, error: tablesError, refetch } = useGetTablesByRestaurantQuery(selectedRestaurantId, {
    skip: !selectedRestaurantId
  })
  const [createTable] = useCreateTableMutation()
  const [updateTable] = useUpdateTableMutation()
  const [updateTableStatus] = useUpdateTableStatusMutation()
  const [deleteTable] = useDeleteTableMutation()

  // Add console logs for debugging
  useEffect(() => {
    console.log('Debug Info:', {
      selectedRestaurantId,
      isLoadingTables,
      tablesError,
      tablesData: tables,
      restaurantsData: restaurants,
      authToken: localStorage.getItem('token'),
      authUser: localStorage.getItem('user'),
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
      fullApiUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/tables/restaurant/${selectedRestaurantId}`
    })
  }, [selectedRestaurantId, tables, isLoadingTables, tablesError, restaurants])

  // Set initial selected restaurant
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      console.log('Setting initial restaurant:', restaurants[0])
      setSelectedRestaurantId(restaurants[0]._id)
    }
  }, [restaurants, selectedRestaurantId])

  // Filtered tables with type check
  const filteredTables = Array.isArray(tables) ? tables.filter((table: Table) => {
    console.log('Filtering table:', table)
    const matchesSearch = table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || table.status === selectedStatus

    return matchesSearch && matchesStatus
  }) : []

  // Log filtered tables
  useEffect(() => {
    console.log('Filtered Tables:', {
      originalTables: tables,
      filteredTables,
      searchTerm,
      selectedStatus
    })
  }, [tables, filteredTables, searchTerm, selectedStatus])

  // Kiểm tra trùng số bàn
  const checkDuplicateTableNumber = (tableNumber: string, excludeTableId?: string) => {
    if (!tables || !Array.isArray(tables)) return false
    
    // Lọc các bàn trong cùng nhà hàng
    const tablesInSameRestaurant = tables.filter(table => 
      table.restaurantId === currentTable?.restaurantId
    )

    // Kiểm tra trùng số bàn
    return tablesInSameRestaurant.some(table => 
      table.tableNumber === tableNumber && 
      (!excludeTableId || table._id !== excludeTableId)
    )
  }

  // Lấy prefix cho nhà hàng hiện tại
  const getCurrentRestaurantPrefix = () => {
    if (!currentTable?.restaurantId) return ""
    const currentRestaurant = restaurants.find(r => r._id === currentTable.restaurantId)
    return currentRestaurant ? RESTAURANT_PREFIX_MAP[currentRestaurant.name] || "" : ""
  }

  // Xử lý thay đổi số bàn
  const handleTableNumberChange = (value: string) => {
    if (!currentTable) return

    // Reset error
    setTableNumberError("")

    const prefix = getCurrentRestaurantPrefix()
    
    // Chỉ lấy phần sau prefix
    const newSuffix = value.slice(prefix.length)
    setTableNumberSuffix(newSuffix)
    
    const fullTableNumber = prefix + newSuffix

    // Kiểm tra trùng số bàn
    if (fullTableNumber && checkDuplicateTableNumber(fullTableNumber, currentTable._id)) {
      setTableNumberError(`Table ${fullTableNumber} already exists in ${restaurants.find(r => r._id === currentTable.restaurantId)?.name}`)
      return
    }

    setCurrentTable({ ...currentTable, tableNumber: fullTableNumber })
  }

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

    const prefix = getCurrentRestaurantPrefix()
    setTableNumberSuffix("")
    
    const newTable: Partial<Table> = {
      restaurantId: selectedRestaurantId,
      tableNumber: prefix,
      capacity: 4,
      status: "available" // Mặc định là available
    }
    
    setCurrentTable(newTable)
    setShowAddEditModal(true)
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
    if (!currentTable || !currentTable.restaurantId || !currentTable.tableNumber || !currentTable.capacity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra trùng số bàn trước khi lưu
    if (checkDuplicateTableNumber(currentTable.tableNumber, currentTable._id)) {
      const restaurantName = restaurants.find(r => r._id === currentTable.restaurantId)?.name
      toast({
        title: "Error",
        description: `Table ${currentTable.tableNumber} already exists in ${restaurantName}`,
        variant: "destructive",
      })
      return
    }

    try {
      if (currentTable._id) {
        // Update existing table
        const { _id, ...updateData } = currentTable
        // Ensure status is included in the update
        const dataToUpdate = {
          ...updateData,
          status: updateData.status || 'available'
        }
        await updateTable({
          id: _id,
          data: dataToUpdate
        }).unwrap()
        
        // Also update the table status if it has changed
        if (dataToUpdate.status) {
          await updateTableStatus({
            id: _id,
            data: { status: dataToUpdate.status }
          }).unwrap()
        }
        
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
          status: currentTable.status || 'available'
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
      // Force refetch tables after update
      refetch()
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

      toast({
        title: "Success",
        description: `Table status has been updated to ${statusLabels[newStatus]}.`,
      })
      
      // Force refetch tables after status update
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive",
      })
    }
  }

  // Xử lý xem chi tiết bàn
  const handleViewDetails = (table: Table) => {
    handleEditTable(table)
  }

  // Xử lý khi đổi nhà hàng trong modal
  const handleRestaurantChange = (value: string) => {
    if (!currentTable) return

    // Cập nhật restaurantId
    const newRestaurantId = value
    
    // Tìm prefix của nhà hàng mới
    const newRestaurant = restaurants.find(r => r._id === newRestaurantId)
    const newPrefix = newRestaurant ? RESTAURANT_PREFIX_MAP[newRestaurant.name] || "" : ""
    
    // Reset suffix khi đổi nhà hàng
    setTableNumberSuffix("")
    
    // Cập nhật currentTable với restaurantId mới và prefix mới
    setCurrentTable({
      ...currentTable,
      restaurantId: newRestaurantId,
      tableNumber: newPrefix
    })
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

      {/* Table Modal */}
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
                  onValueChange={handleRestaurantChange}
                  disabled={!!currentTable._id}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                {currentTable._id ? (
                  // Khi edit: hiển thị tên bàn đầy đủ
                  <Input
                    type="text"
                    value={currentTable.tableNumber || ""}
                    className="w-full bg-gray-100"
                    disabled={true}
                  />
                ) : (
                  // Khi thêm mới: hiển thị prefix và cho phép nhập phần sau
                  <div className="flex">
                    <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md min-w-[40px]">
                      {getCurrentRestaurantPrefix()}
                    </div>
                    <Input
                      type="text"
                      value={tableNumberSuffix}
                      onChange={(e) => handleTableNumberChange(getCurrentRestaurantPrefix() + e.target.value)}
                      className={`rounded-l-none ${
                        tableNumberError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter table number"
                    />
                  </div>
                )}
                {tableNumberError && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{tableNumberError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <Input
                  type="number"
                  value={currentTable.capacity || 0}
                  onChange={(e) => setCurrentTable({ ...currentTable, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                />
              </div>

              {/* Chỉ hiển thị status khi edit bàn */}
              {currentTable._id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={currentTable.status}
                    onValueChange={(value: "available" | "reserved" | "occupied") => {
                      setCurrentTable({ ...currentTable, status: value })
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
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTable} 
                className="bg-[#003087] hover:bg-[#002266] text-white"
                disabled={!!tableNumberError || !currentTable.tableNumber || !currentTable.capacity}
              >
                Save
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
            placeholder="Search by table number..."
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
      </div>

      {/* Hiển thị bàn dạng lưới */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoadingTables ? (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tables...</p>
          </div>
        ) : tablesError ? (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <XCircle size={48} className="mx-auto text-red-500 mb-2" />
            <p className="text-red-500">Error loading tables</p>
            <p className="text-sm text-gray-500 mt-1">{JSON.stringify(tablesError)}</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <Users size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No tables found</p>
            {selectedRestaurantId && (
              <p className="text-sm text-gray-400 mt-1">Try adding some tables to this restaurant</p>
            )}
          </div>
        ) : (
          filteredTables.map((table) => (
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}