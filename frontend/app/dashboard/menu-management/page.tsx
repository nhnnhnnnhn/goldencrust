"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PlusCircle, Pencil, Trash2, Search, Filter, ChevronDown, X, Plus, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  useGetMenuItemsQuery, 
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUpdateMenuItemStatusMutation
} from "@/redux/api/menuItems"
import { useGetCategoriesQuery } from "@/redux/api/categoryApi"
import type { Category } from "@/redux/api/categoryApi"

// Định nghĩa kiểu dữ liệu cho MenuItem
interface MenuItem {
  _id: string
  title: string
  description?: string
  price: number
  discountPercentage: number
  categoryId: string
  thumbnail: string
  images: string[]
  status: "active" | "inactive" | "out_of_stock"
  tags: string[]
  deleted?: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export default function MenuManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // RTK Query hooks
  const { data: menuItems = [], isLoading: menuLoading } = useGetMenuItemsQuery()
  const { data: categoriesData, isLoading: categoryLoading } = useGetCategoriesQuery()
  const [createMenuItem] = useCreateMenuItemMutation()
  const [updateMenuItem] = useUpdateMenuItemMutation()
  const [deleteMenuItem] = useDeleteMenuItemMutation()
  const [updateMenuItemStatus] = useUpdateMenuItemStatusMutation()

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item: MenuItem) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory && !item.deleted
  })

  const handleAddItem = () => {
    setCurrentItem({
      title: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      categoryId: "",
      thumbnail: "",
      images: [],
      status: "active",
      tags: []
    })
    setImagePreview("")
    setAdditionalImages([])
    setShowAddEditModal(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item)
    setImagePreview(item.thumbnail)
    setAdditionalImages(item.images)
    setShowAddEditModal(true)
  }

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await deleteMenuItem(itemToDelete._id).unwrap()
      toast({
        title: "Xóa món ăn thành công",
        description: `Đã xóa ${itemToDelete.title}`,
      })
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa món ăn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAdditionalImages([...additionalImages, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (newTag.trim() && currentItem) {
      const updatedTags = [...(currentItem.tags || []), newTag.trim()]
      setCurrentItem({ ...currentItem, tags: updatedTags })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (currentItem) {
      const updatedTags = currentItem.tags?.filter(tag => tag !== tagToRemove) || []
      setCurrentItem({ ...currentItem, tags: updatedTags })
    }
  }

  const handleSaveItem = async () => {
    if (!currentItem) return

    const formData = new FormData()
    formData.append("title", currentItem.title || "")
    formData.append("description", currentItem.description || "")
    formData.append("price", currentItem.price?.toString() || "0")
    formData.append("discountPercentage", currentItem.discountPercentage?.toString() || "0")
    formData.append("categoryId", currentItem.categoryId || "")
    formData.append("status", currentItem.status || "active")
    formData.append("tags", JSON.stringify(currentItem.tags || []))

    if (imageFile) {
      formData.append("thumbnail", imageFile)
    }

    try {
      if (currentItem._id) {
        // Update existing item
        await updateMenuItem({ id: currentItem._id, menuItem: formData }).unwrap()
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật ${currentItem.title}`,
        })
      } else {
        // Create new item
        await createMenuItem(formData).unwrap()
        toast({
          title: "Thêm món ăn thành công",
          description: `Đã thêm ${currentItem.title}`,
        })
      }
      setShowAddEditModal(false)
      setCurrentItem(null)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu món ăn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const toggleItemStatus = async (item: MenuItem) => {
    try {
      const newStatus = item.status === "active" ? "inactive" : "active"
      await updateMenuItemStatus({ id: item._id, status: newStatus }).unwrap()
      toast({
        title: "Cập nhật trạng thái thành công",
        description: `Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} ${item.title}`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price)
  }

  const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
    if (!discountPercentage) return price
    const discount = price * (discountPercentage / 100)
    return price - discount
  }

  const getCategoryName = (categoryId: string) => {
    return categoriesData?.categories.find(cat => cat._id === categoryId)?.name || "Không có danh mục"
  }

  if (menuLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
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
              {categoriesData?.categories.map((category) => (
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
              {filteredMenuItems.map((item) => (
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
                        item.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === "active" ? "Có sẵn" : "Hết hàng"}
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
              {filteredMenuItems.length === 0 && (
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

      {/* Modal thêm/sửa món ăn */}
      {showAddEditModal && currentItem && (
        <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {menuItems.find((i) => i._id === currentItem._id) ? "Chỉnh Sửa Món Ăn" : "Thêm Món Ăn Mới"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên món *</label>
                <Input
                  type="text"
                  value={currentItem.title || ""}
                  onChange={(e) => {
                    const title = e.target.value
                    setCurrentItem({
                      ...currentItem,
                      title,
                    })
                  }}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
                <select
                  value={currentItem.categoryId || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Chọn danh mục
                  </option>
                  {categoriesData?.categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Giá (VNĐ) *</label>
                <Input
                  type="number"
                  value={currentItem.price || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: Number.parseInt(e.target.value) || 0 })}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Giảm giá (%)</label>
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={currentItem.status || "active"}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, status: e.target.value as "active" | "inactive" | "out_of_stock" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Có sẵn</option>
                  <option value="inactive">Hết hàng</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <Textarea
                value={currentItem.description || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                rows={3}
                className="w-full"
              />
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
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

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Hình ảnh đại diện</label>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="h-32 w-32 relative rounded-md overflow-hidden border border-gray-300 flex-shrink-0">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
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

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Hình ảnh bổ sung</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {additionalImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-300">
                    <Image src={img} alt={`Additional ${index}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="aspect-square border border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <ImageIcon size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Thêm ảnh</span>
                    <Input type="file" accept="image/*" onChange={handleAddImage} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowAddEditModal(false)} className="sm:mr-2">
                  Hủy
                </Button>
                <Button onClick={handleSaveItem} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Lưu
                </Button>
              </div>
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
    </div>
  )
}
