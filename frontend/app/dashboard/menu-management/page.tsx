"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, Search, Filter, ChevronDown, X, Plus, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Định nghĩa kiểu dữ liệu cho MenuItem
interface MenuItem {
  _id: string
  title: string
  description: string
  price: number
  discountPercentage: number
  categoryId: string
  thumbnail: string
  images: string[]
  status: "available" | "unavailable"
  slug: string
  tags: string[]
  deleted?: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  _id: string
  name: string
  description?: string
  slug: string
  deleted?: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Dữ liệu mẫu cho danh mục
const initialCategories: Category[] = [
  {
    _id: "cat1",
    name: "Pizza",
    description: "Các loại pizza đặc trưng",
    slug: "pizza",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "cat2",
    name: "Mỳ Ý",
    description: "Các món mỳ Ý truyền thống",
    slug: "my-y",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "cat3",
    name: "Salad",
    description: "Các loại salad tươi ngon",
    slug: "salad",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "cat4",
    name: "Đồ Uống",
    description: "Các loại đồ uống",
    slug: "do-uong",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "cat5",
    name: "Tráng Miệng",
    description: "Các món tráng miệng",
    slug: "trang-mieng",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
]

// Dữ liệu mẫu cho menu
const initialMenuItems: MenuItem[] = [
  {
    _id: "item1",
    title: "Pizza Hải Sản Đặc Biệt",
    description: "Tôm, mực, cua, sốt cà chua đặc biệt",
    price: 189000,
    discountPercentage: 0,
    categoryId: "cat1",
    thumbnail: "/delicious-pizza.png",
    images: ["/delicious-pizza.png", "/placeholder.svg?height=400&width=400&text=Pizza+Hải+Sản+2"],
    status: "available",
    slug: "pizza-hai-san-dac-biet",
    tags: ["Hải sản", "Đặc biệt", "Bán chạy"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "item2",
    title: "Pizza Thịt Xông Khói",
    description: "Thịt xông khói, nấm, sốt cà chua",
    price: 159000,
    discountPercentage: 10,
    categoryId: "cat1",
    thumbnail: "/placeholder.svg?height=400&width=400&text=Pizza+Thịt+Xông+Khói",
    images: ["/placeholder.svg?height=400&width=400&text=Pizza+Thịt+Xông+Khói"],
    status: "available",
    slug: "pizza-thit-xong-khoi",
    tags: ["Thịt", "Xông khói"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "item3",
    title: "Mỳ Ý Hải Sản",
    description: "Mỳ Ý với tôm, mực và sốt kem đặc biệt",
    price: 120000,
    discountPercentage: 0,
    categoryId: "cat2",
    thumbnail: "/seafood-pasta.png",
    images: ["/seafood-pasta.png"],
    status: "available",
    slug: "my-y-hai-san",
    tags: ["Hải sản", "Mỳ Ý"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "item4",
    title: "Salad Cá Hồi",
    description: "Rau xanh tươi với cá hồi Na Uy",
    price: 110000,
    discountPercentage: 0,
    categoryId: "cat3",
    thumbnail: "/salmon-salad.png",
    images: ["/salmon-salad.png"],
    status: "available",
    slug: "salad-ca-hoi",
    tags: ["Cá hồi", "Salad", "Healthy"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    _id: "item5",
    title: "Nước Ép Cam Tươi",
    description: "Nước ép từ cam tươi nguyên chất",
    price: 45000,
    discountPercentage: 0,
    categoryId: "cat4",
    thumbnail: "/glass-of-orange-juice.png",
    images: ["/glass-of-orange-juice.png"],
    status: "available",
    slug: "nuoc-ep-cam-tuoi",
    tags: ["Nước ép", "Cam", "Đồ uống"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
]

// Hàm tạo slug từ text
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
}

export default function MenuManagement() {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null)
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState("menu")

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Lọc các mục menu dựa trên tìm kiếm và danh mục
  const filteredItems = menuItems
    .filter((item) => !item.deleted)
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
      return matchesSearch && matchesCategory
    })

  // Lọc các danh mục không bị xóa
  const activeCategories = categories.filter((category) => !category.deleted)

  // Xử lý thêm mục menu mới
  const handleAddItem = () => {
    const defaultCategoryId = activeCategories.length > 0 ? activeCategories[0]._id : ""
    setCurrentItem({
      title: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      categoryId: defaultCategoryId,
      thumbnail: "/placeholder.svg?height=400&width=400&text=New+Item",
      images: [],
      status: "available",
      slug: "",
      tags: [],
    })
    setImagePreview("/placeholder.svg?height=400&width=400&text=New+Item")
    setAdditionalImages([])
    setImageFile(null)
    setShowAddEditModal(true)
  }

  // Xử lý chỉnh sửa mục menu
  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item)
    setImagePreview(item.thumbnail)
    setAdditionalImages(item.images.filter((img) => img !== item.thumbnail))
    setImageFile(null)
    setShowAddEditModal(true)
  }

  // Xử lý xóa mục menu
  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item)
    setShowDeleteConfirm(true)
  }

  // Xác nhận xóa mục menu (soft delete)
  const confirmDelete = () => {
    if (!itemToDelete) return

    const now = new Date()
    setMenuItems(
      menuItems.map((item) =>
        item._id === itemToDelete._id ? { ...item, deleted: true, deletedAt: now, updatedAt: now } : item,
      ),
    )
    setShowDeleteConfirm(false)
    setItemToDelete(null)

    toast({
      title: "Đã xóa món ăn",
      description: `Món "${itemToDelete.title}" đã được xóa thành công.`,
    })
  }

  // Xử lý thêm danh mục mới
  const handleAddCategory = () => {
    setCurrentCategory({
      name: "",
      description: "",
      slug: "",
    })
    setShowCategoryModal(true)
  }

  // Xử lý chỉnh sửa danh mục
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category)
    setShowCategoryModal(true)
  }

  // Xử lý xóa danh mục
  const handleDeleteCategoryClick = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteCategoryConfirm(true)
  }

  // Xác nhận xóa danh mục (soft delete)
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return

    const now = new Date()
    setCategories(
      categories.map((category) =>
        category._id === categoryToDelete._id
          ? { ...category, deleted: true, deletedAt: now, updatedAt: now }
          : category,
      ),
    )
    setShowDeleteCategoryConfirm(false)
    setCategoryToDelete(null)

    toast({
      title: "Đã xóa danh mục",
      description: `Danh mục "${categoryToDelete.name}" đã được xóa thành công.`,
    })
  }

  // Xử lý thay đổi hình ảnh đại diện
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý thêm hình ảnh bổ sung
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAdditionalImages((prev) => [...prev, result])
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý xóa hình ảnh bổ sung
  const handleRemoveImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Xử lý thêm tag mới
  const handleAddTag = () => {
    if (!newTag.trim() || !currentItem) return

    setCurrentItem({
      ...currentItem,
      tags: [...(currentItem.tags || []), newTag.trim()],
    })
    setNewTag("")
  }

  // Xử lý xóa tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!currentItem) return

    setCurrentItem({
      ...currentItem,
      tags: (currentItem.tags || []).filter((tag) => tag !== tagToRemove),
    })
  }

  // Xử lý lưu mục menu (thêm mới hoặc cập nhật)
  const handleSaveItem = () => {
    if (!currentItem || !currentItem.title || !currentItem.price || !currentItem.categoryId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      })
      return
    }

    // Tạo slug từ title nếu chưa có
    const slug = currentItem.slug || createSlug(currentItem.title)

    // Tạo đối tượng mới với dữ liệu cập nhật
    const now = new Date()
    const allImages = [imagePreview, ...additionalImages].filter(
      (img) => img !== "/placeholder.svg?height=400&width=400&text=New+Item",
    )

    const updatedItem: MenuItem = {
      _id: currentItem._id || `item${Date.now()}`,
      title: currentItem.title,
      description: currentItem.description || "",
      price: currentItem.price,
      discountPercentage: currentItem.discountPercentage || 0,
      categoryId: currentItem.categoryId,
      thumbnail: imagePreview,
      images: allImages.length > 0 ? allImages : [imagePreview],
      status: (currentItem.status as "available" | "unavailable") || "available",
      slug,
      tags: currentItem.tags || [],
      createdAt: currentItem.createdAt || now,
      updatedAt: now,
    }

    if (menuItems.find((i) => i._id === currentItem._id)) {
      // Cập nhật mục hiện có
      setMenuItems(menuItems.map((i) => (i._id === currentItem._id ? updatedItem : i)))
      toast({
        title: "Đã cập nhật món ăn",
        description: `Món "${updatedItem.title}" đã được cập nhật thành công.`,
      })
    } else {
      // Thêm mục mới
      setMenuItems([...menuItems, updatedItem])
      toast({
        title: "Đã thêm món ăn mới",
        description: `Món "${updatedItem.title}" đã được thêm thành công.`,
      })
    }
    setShowAddEditModal(false)
    setCurrentItem(null)
    setImageFile(null)
    setImagePreview("")
    setAdditionalImages([])
  }

  // Xử lý lưu danh mục (thêm mới hoặc cập nhật)
  const handleSaveCategory = () => {
    if (!currentCategory || !currentCategory.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền tên danh mục.",
        variant: "destructive",
      })
      return
    }

    // Tạo slug từ name nếu chưa có
    const slug = currentCategory.slug || createSlug(currentCategory.name)

    // Tạo đối tượng mới với dữ liệu cập nhật
    const now = new Date()
    const updatedCategory: Category = {
      _id: currentCategory._id || `cat${Date.now()}`,
      name: currentCategory.name,
      description: currentCategory.description || "",
      slug,
      createdAt: currentCategory.createdAt || now,
      updatedAt: now,
    }

    if (categories.find((c) => c._id === currentCategory._id)) {
      // Cập nhật danh mục hiện có
      setCategories(categories.map((c) => (c._id === currentCategory._id ? updatedCategory : c)))
      toast({
        title: "Đã cập nhật danh mục",
        description: `Danh mục "${updatedCategory.name}" đã được cập nhật thành công.`,
      })
    } else {
      // Thêm danh mục mới
      setCategories([...categories, updatedCategory])
      toast({
        title: "Đã thêm danh mục mới",
        description: `Danh mục "${updatedCategory.name}" đã được thêm thành công.`,
      })
    }
    setShowCategoryModal(false)
    setCurrentCategory(null)
  }

  // Xử lý thay đổi trạng thái món ăn
  const toggleItemStatus = (item: MenuItem) => {
    const newStatus = item.status === "available" ? "unavailable" : "available"
    const now = new Date()
    setMenuItems(menuItems.map((i) => (i._id === item._id ? { ...i, status: newStatus, updatedAt: now } : i)))

    toast({
      title: "Đã cập nhật trạng thái",
      description: `Món "${item.title}" đã được chuyển sang trạng thái ${
        newStatus === "available" ? "có sẵn" : "hết hàng"
      }.`,
    })
  }

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Tính giá sau khi giảm giá
  const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
    if (!discountPercentage) return price
    return price - (price * discountPercentage) / 100
  }

  // Lấy tên danh mục từ ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c._id === categoryId)
    return category ? category.name : "Không xác định"
  }

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="menu">Quản lý Menu</TabsTrigger>
          <TabsTrigger value="categories">Quản lý Danh mục</TabsTrigger>
        </TabsList>
      </Tabs>

      <TabsContent value="menu" className="mt-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản Lý Menu</h1>
          <Button onClick={handleAddItem} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle size={20} />
            <span>Thêm Món Mới</span>
          </Button>
        </div>

        {/* Thanh tìm kiếm và lọc */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 w-full md:w-auto justify-between"
            >
              <Filter size={20} />
              <span>Danh mục: {selectedCategory === "all" ? "Tất cả" : getCategoryName(selectedCategory)}</span>
              <ChevronDown size={16} />
            </Button>

            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory("all")
                    setShowCategoryDropdown(false)
                  }}
                >
                  Tất cả
                </div>
                {activeCategories.map((category) => (
                  <div
                    key={category._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(category._id)
                      setShowCategoryDropdown(false)
                    }}
                  >
                    {category.name}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
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
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-20 w-20 relative rounded-md overflow-hidden">
                        <Image
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="mr-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.discountPercentage > 0 ? (
                          <>
                            <span className="line-through text-gray-500">{formatPrice(item.price)}</span>
                            <span className="ml-2 font-medium">
                              {formatPrice(calculateDiscountedPrice(item.price, item.discountPercentage))}
                            </span>
                          </>
                        ) : (
                          formatPrice(item.price)
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.discountPercentage > 0 ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          -{item.discountPercentage}%
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Không có</span>
                      )}
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
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
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
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không tìm thấy món ăn nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="categories" className="mt-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản Lý Danh Mục</h1>
          <Button
            onClick={handleAddCategory}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle size={20} />
            <span>Thêm Danh Mục Mới</span>
          </Button>
        </div>

        {/* Bảng danh mục */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{category.description || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {activeCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không có danh mục nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      {/* Modal thêm/sửa món ăn */}
      {showAddEditModal && currentItem && (
        <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {menuItems.find((i) => i._id === currentItem._id) ? "Chỉnh Sửa Món Ăn" : "Thêm Món Ăn Mới"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên món *</label>
                <Input
                  type="text"
                  value={currentItem.title || ""}
                  onChange={(e) => {
                    const title = e.target.value
                    setCurrentItem({
                      ...currentItem,
                      title,
                      slug: createSlug(title), // Tự động tạo slug từ title
                    })
                  }}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                <select
                  value={currentItem.categoryId || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Chọn danh mục
                  </option>
                  {activeCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                <Input
                  type="number"
                  value={currentItem.price || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: Number.parseInt(e.target.value) || 0 })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={currentItem.discountPercentage || ""}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      discountPercentage: Math.min(100, Math.max(0, Number.parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input
                  type="text"
                  value={currentItem.slug || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                  className="w-full"
                  placeholder="Tự động tạo từ tên món"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={currentItem.status || "available"}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, status: e.target.value as "available" | "unavailable" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Có sẵn</option>
                  <option value="unavailable">Hết hàng</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <Textarea
                value={currentItem.description || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                rows={3}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(currentItem.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Thêm tag mới"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh đại diện</label>
              <div className="flex items-center space-x-4">
                <div className="h-32 w-32 relative rounded-md overflow-hidden border border-gray-300">
                  {imagePreview && (
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh bổ sung</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                {additionalImages.map((img, index) => (
                  <div key={index} className="relative h-24 rounded-md overflow-hidden border border-gray-300">
                    <Image src={img || "/placeholder.svg"} alt={`Additional ${index}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="h-24 border border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <ImageIcon size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Thêm ảnh</span>
                    <Input type="file" accept="image/*" onChange={handleAddImage} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveItem} className="bg-blue-600 hover:bg-blue-700 text-white">
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal thêm/sửa danh mục */}
      {showCategoryModal && currentCategory && (
        <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {categories.find((c) => c._id === currentCategory._id) ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <Input
                  type="text"
                  value={currentCategory.name || ""}
                  onChange={(e) => {
                    const name = e.target.value
                    setCurrentCategory({
                      ...currentCategory,
                      name,
                      slug: createSlug(name), // Tự động tạo slug từ name
                    })
                  }}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <Textarea
                  value={currentCategory.description || ""}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input
                  type="text"
                  value={currentCategory.slug || ""}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                  className="w-full"
                  placeholder="Tự động tạo từ tên danh mục"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal xác nhận xóa món ăn */}
      {showDeleteConfirm && itemToDelete && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <p className="mb-6">Bạn có chắc chắn muốn xóa món "{itemToDelete.title}" khỏi menu?</p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Hủy
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal xác nhận xóa danh mục */}
      {showDeleteCategoryConfirm && categoryToDelete && (
        <Dialog open={showDeleteCategoryConfirm} onOpenChange={setShowDeleteCategoryConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            </DialogHeader>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete.name}"? Các món ăn thuộc danh mục này sẽ không bị
              xóa.
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteCategoryConfirm(false)}>
                Hủy
              </Button>
              <Button onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700 text-white">
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
