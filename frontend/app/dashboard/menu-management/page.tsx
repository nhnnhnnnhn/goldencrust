"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PlusCircle, Pencil, Trash2, Search, Filter, ChevronDown, ImageIcon } from "lucide-react"
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
import { getTranslation } from "@/utils/translations"

// Định nghĩa kiểu dữ liệu cho MenuItem
interface MenuItem {
  _id: string
  title: string
  description?: string
  price: number
  discountPercentage: number
  categoryId: string
  thumbnail: string
  status: "active" | "inactive" | "out_of_stock"
  deleted?: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

interface MenuItemFormErrors {
  title?: string;
  categoryId?: string;
  price?: string;
  discountPercentage?: string;
  thumbnail?: string;
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
  const [language, setLanguage] = useState<"en" | "vi">("en")

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  // RTK Query hooks
  const { data: menuItems = [], isLoading: menuLoading } = useGetMenuItemsQuery()
  const { data: categoriesData, isLoading: categoryLoading } = useGetCategoriesQuery()
  const [createMenuItem] = useCreateMenuItemMutation()
  const [updateMenuItem] = useUpdateMenuItemMutation()
  const [deleteMenuItem] = useDeleteMenuItemMutation()
  const [updateMenuItemStatus] = useUpdateMenuItemStatusMutation()

  const [formErrors, setFormErrors] = useState<MenuItemFormErrors>({})

  useEffect(() => {
    // Get initial language
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null;
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage);
    }

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "en" || e.newValue === "vi")) {
        setLanguage(e.newValue);
      }
    }

    // Listen for custom language change event (from same tab)
    const handleLanguageChange = (e: CustomEvent<"en" | "vi">) => {
      setLanguage(e.detail);
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("languageChange", handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageChange", handleLanguageChange as EventListener);
    }
  }, []);

  const t = getTranslation(language)

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item: MenuItem) => {
    if (!item) return false;
    
    const matchesSearch = (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
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
      status: "active"
    })
    setImagePreview("")
    setShowAddEditModal(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item)
    setImagePreview(item.thumbnail)
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

  const validateForm = (data: Partial<MenuItem>): boolean => {
    const errors: MenuItemFormErrors = {};

    // Validate title
    if (!data.title?.trim()) {
      errors.title = t.menuManagement.validation.titleRequired;
    } else if (data.title.length < 3) {
      errors.title = t.menuManagement.validation.titleLength;
    } else if (data.title.length > 100) {
      errors.title = t.menuManagement.validation.titleMaxLength;
    }

    // Validate category
    if (!data.categoryId) {
      errors.categoryId = t.menuManagement.validation.categoryRequired;
    }

    // Validate price
    if (!data.price || data.price <= 0) {
      errors.price = t.menuManagement.validation.priceRequired;
    } else if (data.price > 10000000) {
      errors.price = t.menuManagement.validation.priceMax;
    }

    // Validate discount
    if (data.discountPercentage && (data.discountPercentage < 0 || data.discountPercentage > 100)) {
      errors.discountPercentage = t.menuManagement.validation.discountRange;
    }

    // Validate thumbnail for new items
    if (!data._id && !imageFile) {
      errors.thumbnail = t.menuManagement.validation.thumbnailRequired;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateImage = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t.menuManagement.messages.saveError,
        description: t.menuManagement.validation.imageType,
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: t.menuManagement.messages.saveError,
        description: t.menuManagement.validation.imageSize,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            0.7
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (validateImage(file)) {
        // Compress image before setting it
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          // Clear any existing thumbnail error
          if (formErrors.thumbnail) {
            setFormErrors(prev => ({ ...prev, thumbnail: undefined }));
          }
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch (error) {
      console.error('Error handling image:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xử lý ảnh. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      // Reset input value
      e.target.value = '';
    }
  }

  const handleSaveItem = async () => {
    if (!currentItem) return;

    // Validate all required fields
    const newErrors: MenuItemFormErrors = {};
    
    if (!currentItem.title?.trim()) {
      newErrors.title = "Vui lòng nhập tên món ăn";
    } else if (currentItem.title.length < 3) {
      newErrors.title = "Tên món ăn phải có ít nhất 3 ký tự";
    } else if (currentItem.title.length > 100) {
      newErrors.title = "Tên món ăn không được vượt quá 100 ký tự";
    }

    if (!currentItem.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }

    if (!currentItem.price || currentItem.price <= 0) {
      newErrors.price = "Vui lòng nhập giá hợp lệ";
    } else if (currentItem.price > 10000000) {
      newErrors.price = "Giá không được vượt quá 10,000,000 VNĐ";
    }

    if (currentItem.discountPercentage && (currentItem.discountPercentage < 0 || currentItem.discountPercentage > 100)) {
      newErrors.discountPercentage = "Giảm giá phải từ 0% đến 100%";
    }

    // Check thumbnail requirement for new items
    if (!currentItem._id && !imageFile && !imagePreview) {
      newErrors.thumbnail = "Vui lòng chọn hình ảnh cho món ăn";
    }

    // If there are any errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Ensure required fields are present
    if (!currentItem.title || !currentItem.price || !currentItem.categoryId) {
      toast({
        title: "Lỗi",
        description: "Thiếu thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Show loading toast
    const loadingToast = toast({
      title: currentItem._id ? "Đang cập nhật..." : "Đang thêm món...",
      description: "Vui lòng đợi trong giây lát",
    });

    // Reset form errors
    setFormErrors({});

    const formData = new FormData();
    formData.append("title", currentItem.title.trim());
    formData.append("description", currentItem.description?.trim() || "");
    formData.append("price", currentItem.price.toString());
    formData.append("discountPercentage", currentItem.discountPercentage?.toString() || "0");
    formData.append("categoryId", currentItem.categoryId);
    formData.append("status", currentItem.status || "active");

    if (imageFile) {
      formData.append("thumbnail", imageFile);
    }

    try {
      if (currentItem._id) {
        await updateMenuItem({ id: currentItem._id, menuItem: formData }).unwrap();
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật ${currentItem.title}`,
        });
      } else {
        await createMenuItem(formData).unwrap();
        toast({
          title: "Thêm món ăn thành công",
          description: `Đã thêm ${currentItem.title}`,
        });
      }
      // Dismiss loading toast
      loadingToast.dismiss();
      
      setShowAddEditModal(false);
      setCurrentItem(null);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      // Dismiss loading toast
      loadingToast.dismiss();
      
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu món ăn. Vui lòng thử lại sau.";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t.menuManagement.title}</h2>
        <Button onClick={handleAddItem}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t.menuManagement.addNewItem}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.menuManagement.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="relative w-full sm:w-[200px]">
          <Button
            variant="outline"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full justify-between"
          >
            <span className="truncate">{selectedCategory === "all" ? t.menuManagement.fields.category : getCategoryName(selectedCategory)}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
          </Button>
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
                onClick={() => {
                  setSelectedCategory("all");
                  setShowCategoryDropdown(false);
                }}
              >
                {t.menuManagement.fields.category}
              </div>
              {categoriesData?.categories.map((category) => (
                <div
                  key={category._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
                  onClick={() => {
                    setSelectedCategory(category._id);
                    setShowCategoryDropdown(false);
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
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto -mx-6 lg:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.image}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.name}
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.description}
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.category}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.price}
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.discount}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.status}
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.menuManagement.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMenuItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 relative rounded-md overflow-hidden">
                      <Image
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</div>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs line-clamp-2">{item.description}</div>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 truncate max-w-[150px]">
                      {getCategoryName(item.categoryId)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.discountPercentage > 0 ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="line-through text-gray-500">{formatPrice(item.price)}</span>
                          <span className="font-medium">
                            {formatPrice(calculateDiscountedPrice(item.price, item.discountPercentage))}
                          </span>
                        </div>
                      ) : (
                        formatPrice(item.price)
                      )}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    {item.discountPercentage > 0 ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        -{item.discountPercentage}%
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Không có</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleItemStatus(item)}
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : item.status === "inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === "active" 
                        ? "Có sẵn" 
                        : item.status === "inactive"
                        ? "Không HĐ"
                        : "Hết hàng"}
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMenuItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-6 py-4 text-center text-sm text-gray-500">
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
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                {currentItem._id ? t.menuManagement.modal.editTitle : t.menuManagement.modal.addTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên món *</label>
                <Input
                  type="text"
                  value={currentItem.title || ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    setCurrentItem({ ...currentItem, title });
                    if (formErrors.title) {
                      setFormErrors(prev => ({ ...prev, title: undefined }));
                    }
                  }}
                  className={`w-full ${formErrors.title ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
                <select
                  value={currentItem.categoryId || ""}
                  onChange={(e) => {
                    setCurrentItem({ ...currentItem, categoryId: e.target.value });
                    if (formErrors.categoryId) {
                      setFormErrors(prev => ({ ...prev, categoryId: undefined }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="" disabled>Chọn danh mục</option>
                  {categoriesData?.categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.categoryId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Giá (VNĐ) *</label>
                <Input
                  type="number"
                  value={currentItem.price || ""}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    setCurrentItem({ ...currentItem, price });
                    if (formErrors.price) {
                      setFormErrors(prev => ({ ...prev, price: undefined }));
                    }
                  }}
                  className={`w-full ${formErrors.price ? 'border-red-500' : ''}`}
                  min="0"
                  step="1000"
                  required
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Giảm giá (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={currentItem.discountPercentage || ""}
                  onChange={(e) => {
                    const discountPercentage = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                    setCurrentItem({ ...currentItem, discountPercentage });
                    if (formErrors.discountPercentage) {
                      setFormErrors(prev => ({ ...prev, discountPercentage: undefined }));
                    }
                  }}
                  className={`w-full ${formErrors.discountPercentage ? 'border-red-500' : ''}`}
                />
                {formErrors.discountPercentage && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.discountPercentage}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={currentItem.status || "active"}
                  onChange={(e) => setCurrentItem({ 
                    ...currentItem, 
                    status: e.target.value as "active" | "inactive" | "out_of_stock" 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Có sẵn</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <Textarea
                  value={currentItem.description || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hình ảnh đại diện {!currentItem._id && '*'}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className={`h-32 w-32 relative rounded-md overflow-hidden border flex-shrink-0 ${
                    formErrors.thumbnail ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 128px) 100vw, 128px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-50">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <Input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className={`w-full ${formErrors.thumbnail ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hỗ trợ JPG, PNG, WebP. Tối đa 5MB.
                    </p>
                    {formErrors.thumbnail && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.thumbnail}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)} className="w-full sm:w-auto">
                {t.menuManagement.modal.cancel}
              </Button>
              <Button onClick={handleSaveItem} className="w-full sm:w-auto">
                {t.menuManagement.modal.save}
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
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="sm:mr-2">
                  Hủy
                </Button>
                <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                  Xóa
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
