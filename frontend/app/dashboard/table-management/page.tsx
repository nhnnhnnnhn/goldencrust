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
import { getTranslation } from "@/utils/translations"
import { Label } from "@/components/ui/label"

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
  const [language, setLanguage] = useState<"en" | "vi">("en")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentTable, setCurrentTable] = useState<Partial<Table> | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("")
  const [tableNumberError, setTableNumberError] = useState<string>("")
  const [tableNumberSuffix, setTableNumberSuffix] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // API Hooks
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useGetRestaurantsQuery()
  const { data: tables = [], isLoading: isLoadingTables, error: tablesError, refetch } = useGetTablesByRestaurantQuery(selectedRestaurantId, {
    skip: !selectedRestaurantId
  })
  const [createTable] = useCreateTableMutation()
  const [updateTable] = useUpdateTableMutation()
  const [updateTableStatus] = useUpdateTableStatusMutation()
  const [deleteTable] = useDeleteTableMutation()

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

  const statusLabels = {
    available: t.tableManagement.status.available,
    occupied: t.tableManagement.status.occupied,
    reserved: t.tableManagement.status.reserved,
  }

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
        title: t.tableManagement.messages.errorTitle,
        description: t.tableManagement.messages.selectRestaurantFirst,
        variant: "destructive",
      })
      return
    }
    setCurrentTable({
      restaurantId: selectedRestaurantId,
      tableNumber: "",
      capacity: 0,
      status: "available",
    })
    setTableNumberSuffix("")
    setTableNumberError("")
    setShowAddEditModal(true)
  }

  // Xử lý sửa bàn
  const handleEditTable = (table: Table) => {
    setCurrentTable(table)
    setShowAddEditModal(true)
  }

  // Xử lý xóa bàn
  const handleDeleteClick = async (table: Table) => {
    setCurrentTable(table)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!currentTable?._id) return

    try {
      await deleteTable(currentTable._id).unwrap()
      toast({
        title: t.tableManagement.messages.deleteSuccess,
      })
      setShowDeleteModal(false)
      refetch()
    } catch (error) {
      toast({
        title: t.tableManagement.messages.deleteError,
        variant: "destructive",
      })
    }
  }

  // Xử lý lưu bàn (thêm mới hoặc cập nhật)
  const handleSaveTable = async () => {
    if (!currentTable) return

    // Validate required fields
    if (!currentTable.tableNumber) {
      setTableNumberError(t.tableManagement.validation.tableNumberRequired)
      return
    }

    if (!currentTable.capacity) {
      toast({
        title: t.tableManagement.messages.errorTitle,
        description: t.tableManagement.validation.capacityRequired,
        variant: "destructive",
      })
      return
    }

    if (!currentTable.restaurantId) {
      toast({
        title: t.tableManagement.messages.errorTitle,
        description: t.tableManagement.validation.restaurantRequired,
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
          title: t.tableManagement.messages.saveSuccess,
        })
      } else {
        // Create new table
        const newTableData = {
          restaurantId: currentTable.restaurantId,
          tableNumber: currentTable.tableNumber,
          capacity: currentTable.capacity,
          status: currentTable.status || 'available'
        }
        await createTable(newTableData).unwrap()
        toast({
          title: t.tableManagement.messages.saveSuccess,
        })
      }
      setShowAddEditModal(false)
      refetch()
    } catch (error) {
      toast({
        title: t.tableManagement.messages.saveError,
        variant: "destructive",
      })
    }
  }

  // Xử lý cập nhật trạng thái bàn
  const handleUpdateStatus = async (id: string | undefined, newStatus: "available" | "occupied" | "reserved") => {
    if (!id) return

    try {
      await updateTableStatus({
        id,
        data: { status: newStatus }
      }).unwrap()
      toast({
        title: t.tableManagement.messages.saveSuccess,
      })
      refetch()
    } catch (error) {
      toast({
        title: t.tableManagement.messages.saveError,
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.tableManagement.title}</h1>
          <p className="text-gray-600">{t.tableManagement.description}</p>
        </div>
        <Button onClick={handleAddTable}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t.tableManagement.addTable}
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t.tableManagement.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRestaurantId} onValueChange={handleRestaurantChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.tableManagement.placeholders.selectRestaurant} />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-[150px]"
          >
            <Filter className="mr-2 h-4 w-4" />
            {selectedStatus === "All" ? t.tableManagement.status.all : statusLabels[selectedStatus as keyof typeof statusLabels]}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 w-[150px] bg-white border rounded-md shadow-lg z-10">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedStatus("All")
                  setShowStatusDropdown(false)
                }}
              >
                {t.tableManagement.status.all}
              </div>
              {statuses.filter(s => s !== "All").map((status) => (
                <div
                  key={status}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedStatus(status)
                    setShowStatusDropdown(false)
                  }}
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.tableManagement.fields.tableNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.tableManagement.fields.capacity}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.tableManagement.fields.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.tableManagement.fields.restaurant}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.tableManagement.actions.edit}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables.map((table) => (
                <tr key={table._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{table.tableNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{table.capacity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[table.status]}`}>
                      {statusLabels[table.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {restaurants.find(r => r._id === table.restaurantId)?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => handleEditTable(table)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {t.tableManagement.actions.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteClick(table)}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      {t.tableManagement.actions.delete}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {currentTable?._id ? t.tableManagement.editTable : t.tableManagement.addTable}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tableNumber">{t.tableManagement.fields.tableNumber}</Label>
                <Input
                  id="tableNumber"
                  value={tableNumberSuffix}
                  onChange={(e) => handleTableNumberChange(e.target.value)}
                  placeholder={t.tableManagement.placeholders.tableNumber}
                />
                {tableNumberError && (
                  <p className="text-red-500 text-sm mt-1">{tableNumberError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="capacity">{t.tableManagement.fields.capacity}</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={currentTable?.capacity || ""}
                  onChange={(e) => setCurrentTable({ ...currentTable, capacity: parseInt(e.target.value) })}
                  placeholder={t.tableManagement.placeholders.capacity}
                />
              </div>
              <div>
                <Label htmlFor="restaurant">{t.tableManagement.fields.restaurant}</Label>
                <Select
                  value={currentTable?.restaurantId || ""}
                  onValueChange={(value) => setCurrentTable({ ...currentTable, restaurantId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.tableManagement.placeholders.selectRestaurant} />
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
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                {t.tableManagement.actions.cancel}
              </Button>
              <Button onClick={handleSaveTable}>
                {t.tableManagement.actions.save}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t.tableManagement.messages.confirmDelete}</h2>
            <p className="text-gray-600 mb-6">{t.tableManagement.messages.confirmDeleteNote}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                {t.tableManagement.actions.cancel}
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                {t.tableManagement.actions.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}