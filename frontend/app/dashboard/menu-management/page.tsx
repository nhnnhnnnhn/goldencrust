"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, Search, Filter, ChevronDown, X } from "lucide-react"
import Image from "next/image"

// Dữ liệu mẫu cho menu
const initialMenuItems = [
  {
    id: 1,
    name: "Pizza Hải Sản Đặc Biệt",
    description: "Tôm, mực, cua, sốt cà chua đặc biệt",
    price: 189000,
    category: "Pizza",
    image: "/delicious-pizza.png",
    status: "available",
  },
  {
    id: 2,
    name: "Pizza Thịt Xông Khói",
    description: "Thịt xông khói, nấm, sốt cà chua",
    price: 159000,
    category: "Pizza",
    image: "/placeholder.svg?key=ngd5t",
    status: "available",
  },
  {
    id: 3,
    name: "Mỳ Ý Hải Sản",
    description: "Mỳ Ý với tôm, mực và sốt kem đặc biệt",
    price: 120000,
    category: "Mỳ Ý",
    image: "/seafood-pasta.png",
    status: "available",
  },
  {
    id: 4,
    name: "Salad Cá Hồi",
    description: "Rau xanh tươi với cá hồi Na Uy",
    price: 110000,
    category: "Salad",
    image: "/salmon-salad.png",
    status: "available",
  },
  {
    id: 5,
    name: "Nước Ép Cam Tươi",
    description: "Nước ép từ cam tươi nguyên chất",
    price: 45000,
    category: "Đồ Uống",
    image: "/glass-of-orange-juice.png",
    status: "available",
  },
]

// Danh sách các danh mục
const categories = ["Tất cả", "Pizza", "Mỳ Ý", "Salad", "Đồ Uống", "Tráng Miệng"]

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Lọc các mục menu dựa trên tìm kiếm và danh mục
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Tất cả" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Xử lý thêm mục menu mới
  const handleAddItem = () => {
    setCurrentItem({
      id: menuItems.length + 1,
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      image: "/diverse-food-spread.png",
      status: "available",
    })
    setImagePreview("")
    setImageFile(null)
    setShowAddEditModal(true)
  }

  // Xử lý chỉnh sửa mục menu
  const handleEditItem = (item) => {
    setCurrentItem(item)
    setImagePreview(item.image)
    setImageFile(null)
    setShowAddEditModal(true)
  }

  // Xử lý xóa mục menu
  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    setMenuItems(menuItems.filter((item) => item.id !== itemToDelete.id))
    setShowDeleteConfirm(false)
    setItemToDelete(null)
  }

  // Xử lý lưu mục menu (thêm mới hoặc cập nhật)
  const handleSaveItem = (item) => {
    // Tạo đối tượng mới với dữ liệu cập nhật
    const updatedItem = { ...item }

    // Nếu có file ảnh mới, cập nhật đường dẫn ảnh
    if (imageFile) {
      // Trong thực tế, đây là nơi bạn sẽ upload file lên server
      // và nhận về URL. Ở đây chúng ta giả định URL là từ imagePreview
      updatedItem.image = imagePreview
    }

    if (menuItems.find((i) => i.id === item.id)) {
      // Cập nhật mục hiện có
      setMenuItems(menuItems.map((i) => (i.id === item.id ? updatedItem : i)))
    } else {
      // Thêm mục mới
      setMenuItems([...menuItems, updatedItem])
    }
    setShowAddEditModal(false)
    setCurrentItem(null)
    setImageFile(null)
    setImagePreview("")
  }

  const toggleItemStatus = (item) => {
    const newStatus = item.status === "available" ? "unavailable" : "available"
    setMenuItems(menuItems.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)))
  }

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Menu</h1>
        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircle size={20} />
          <span>Thêm Món Mới</span>
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <Filter size={20} />
            <span>Danh mục: {selectedCategory}</span>
            <ChevronDown size={16} />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {categories.map((category) => (
                <div
                  key={category}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category)
                    setShowCategoryDropdown(false)
                  }}
                >
                  {category}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bảng menu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên món
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-20 w-20 relative rounded-md overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPrice(item.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleItemStatus(item)}
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === "available" ? "Có sẵn" : "Hết hàng"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditItem(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không tìm thấy món ăn nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa món ăn */}
      {showAddEditModal && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {menuItems.find((i) => i.id === currentItem.id) ? "Chỉnh Sửa Món Ăn" : "Thêm Món Ăn Mới"}
              </h2>
              <button onClick={() => setShowAddEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên món</label>
                <input
                  type="text"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  value={currentItem.category}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories
                    .filter((c) => c !== "Tất cả")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: Number.parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={currentItem.status}
                  onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="available">Có sẵn</option>
                  <option value="unavailable">Hết hàng</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={currentItem.description}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
              <div className="flex items-center space-x-4">
                <div className="h-32 w-32 relative rounded-md overflow-hidden border border-gray-300">
                  {(imagePreview || currentItem.image) && (
                    <Image src={imagePreview || currentItem.image} alt="Preview" fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveItem(currentItem)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa món "{itemToDelete.name}" khỏi menu?</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
