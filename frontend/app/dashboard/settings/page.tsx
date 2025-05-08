"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  ImageIcon,
  Info,
  LayoutGrid,
  Save,
  Settings,
  Upload,
  Plus,
} from "lucide-react"

// Dữ liệu mẫu cho trang chủ
const initialPageData = {
  // Phần Hero
  hero: {
    title: "Authentic Vietnamese Pizza",
    subtitle: "Experience the perfect blend of Vietnamese flavors and Italian tradition",
    buttonText: "Order Now",
    backgroundImage: "/vietnam-street.png",
    visible: true,
  },
  // Phần About
  about: {
    title: "Our Story",
    description:
      'Pizza 4P\'s began with a simple dream: to deliver happiness through pizza. What started as a backyard pizza oven has grown into a beloved restaurant chain. Our name stands for "Platform of Personal Pizza for Peace" - reflecting our mission to create connections between people through the universal language of food.',
    buttonText: "Learn More",
    image: "/diverse-food-spread.png",
    visible: true,
  },
  // Phần Concept
  concept: {
    title: "Farm to Table",
    description:
      'We believe in the "Farm to Table" concept, ensuring that we use only the freshest ingredients. Many of our ingredients are grown on our own farms, including our signature cheese which is made daily. This commitment to quality and sustainability is at the heart of everything we do, from our carefully crafted pizzas to our thoughtfully designed restaurants.',
    buttonText: "Discover Our Ingredients",
    image: "/placeholder.svg?height=1080&width=1920&text=Farm+to+Table",
    visible: true,
  },
  // Phần Locations
  locations: {
    title: "Our Locations",
    description: "Find us in these cities across Vietnam",
    cities: [
      { city: "Ho Chi Minh City", locations: 12 },
      { city: "Hanoi", locations: 5 },
      { city: "Da Nang", locations: 2 },
      { city: "Nha Trang", locations: 1 },
      { city: "Phu Quoc", locations: 1 },
    ],
    visible: true,
  },
  // Phần Restaurant
  restaurant: {
    title: "Our Restaurant",
    description:
      "Pizza Liêm Khiết is a Michelin-starred restaurant dedicated to the art of pizza making. Our commitment to quality and excellence has earned us recognition as one of the finest dining establishments in Vietnam.",
    additionalText:
      "Our mission is to create unforgettable dining experiences through innovative cuisine, exceptional service, and a warm, inviting atmosphere. We believe that food is not just sustenance, but an art form that brings people together.",
    features: [
      {
        title: "Our Vision",
        description:
          "To redefine the art of pizza making and elevate it to the highest standards of culinary excellence.",
      },
      {
        title: "Our Values",
        description: "Quality, innovation, sustainability, and creating meaningful connections through food.",
      },
      {
        title: "Our Promise",
        description: "An extraordinary dining experience that delights all senses and exceeds expectations.",
      },
    ],
    image: "/placeholder.svg?height=1080&width=1920&text=Our+Restaurant",
    visible: true,
  },
  // Phần Menu
  menu: {
    title: "Featured Menu",
    description:
      "Discover our chef's selection of signature dishes, crafted with the finest ingredients and culinary expertise.",
    items: [
      {
        name: "Tartufo Nero",
        description: "Truffle cream, mozzarella, wild mushrooms, arugula, shaved black truffle",
        price: 28,
        image: "/placeholder.svg?height=400&width=400&text=Tartufo+Nero",
        category: "Signature Pizzas",
      },
      {
        name: "Margherita Elegante",
        description: "San Marzano tomato sauce, buffalo mozzarella, fresh basil, extra virgin olive oil",
        price: 18,
        image: "/placeholder.svg?height=400&width=400&text=Margherita+Elegante",
        category: "Classic Pizzas",
      },
      {
        name: "Frutti di Mare",
        description: "Tomato sauce, mozzarella, fresh seafood medley, lemon zest, parsley, garlic oil",
        price: 30,
        image: "/placeholder.svg?height=400&width=400&text=Frutti+di+Mare",
        category: "Signature Pizzas",
      },
      {
        name: "Tagliatelle al Tartufo",
        description: "House-made tagliatelle, butter, parmigiano, fresh black truffle",
        price: 28,
        image: "/placeholder.svg?height=400&width=400&text=Tagliatelle+Tartufo",
        category: "Pasta",
      },
    ],
    visible: true,
  },
  // Phần Gallery
  gallery: {
    title: "Gallery",
    description: "Experience the ambiance and artistry of Pizza Liêm Khiết through our gallery.",
    images: [
      { src: "/placeholder.svg?height=600&width=600&text=Restaurant+Interior", alt: "Restaurant Interior" },
      { src: "/placeholder.svg?height=600&width=600&text=Chef+Preparing+Pizza", alt: "Chef Preparing Pizza" },
      { src: "/placeholder.svg?height=600&width=600&text=Wood+Fired+Oven", alt: "Wood Fired Oven" },
      { src: "/placeholder.svg?height=600&width=600&text=Dining+Experience", alt: "Dining Experience" },
      { src: "/placeholder.svg?height=600&width=600&text=Signature+Dish", alt: "Signature Dish" },
      { src: "/placeholder.svg?height=600&width=600&text=Wine+Selection", alt: "Wine Selection" },
    ],
    visible: true,
  },
  // Phần Contact
  contact: {
    title: "Get in Touch",
    email: {
      general: "info@pizza4ps.com",
      careers: "careers@pizza4ps.com",
      press: "press@pizza4ps.com",
    },
    socialMedia: {
      instagram: "https://instagram.com/pizza4ps",
      facebook: "https://facebook.com/pizza4ps",
    },
    visible: true,
  },
}

export default function SettingsPage() {
  const [pageData, setPageData] = useState(initialPageData)
  const [activeTab, setActiveTab] = useState("hero")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editingItemType, setEditingItemType] = useState("")
  const [editingItemIndex, setEditingItemIndex] = useState(-1)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSectionVisibilityChange = (section: string, visible: boolean) => {
    setPageData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        visible,
      },
    }))
  }

  const handleTextChange = (section: string, field: string, value: string) => {
    setPageData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleImageUpload = (section: string, field: string) => {
    // Trong ứng dụng thực tế, đây sẽ là nơi tải lên hình ảnh
    // Hiện tại chỉ giả lập thay đổi URL hình ảnh
    const newImageUrl = `/uploaded-${section}-${Date.now()}.png`
    setPageData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: newImageUrl,
      },
    }))
    alert(`Đã tải lên hình ảnh mới cho phần ${section}`)
  }

  const handleEditItem = (type: string, item: any, index: number) => {
    setEditingItem(JSON.parse(JSON.stringify(item)))
    setEditingItemType(type)
    setEditingItemIndex(index)
  }

  const handleUpdateItem = () => {
    if (!editingItem || editingItemIndex === -1) return

    if (editingItemType === "menuItem") {
      setPageData((prev) => {
        const updatedMenu = { ...prev.menu }
        updatedMenu.items[editingItemIndex] = editingItem
        return { ...prev, menu: updatedMenu }
      })
    } else if (editingItemType === "location") {
      setPageData((prev) => {
        const updatedLocations = { ...prev.locations }
        updatedLocations.cities[editingItemIndex] = editingItem
        return { ...prev, locations: updatedLocations }
      })
    } else if (editingItemType === "feature") {
      setPageData((prev) => {
        const updatedRestaurant = { ...prev.restaurant }
        updatedRestaurant.features[editingItemIndex] = editingItem
        return { ...prev, restaurant: updatedRestaurant }
      })
    } else if (editingItemType === "galleryImage") {
      setPageData((prev) => {
        const updatedGallery = { ...prev.gallery }
        updatedGallery.images[editingItemIndex] = editingItem
        return { ...prev, gallery: updatedGallery }
      })
    }

    setEditingItem(null)
    setEditingItemType("")
    setEditingItemIndex(-1)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditingItemType("")
    setEditingItemIndex(-1)
  }

  const handleMoveItem = (type: string, index: number, direction: "up" | "down") => {
    if (type === "menuItem") {
      setPageData((prev) => {
        const items = [...prev.menu.items]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= items.length) return prev

        const temp = items[index]
        items[index] = items[newIndex]
        items[newIndex] = temp

        return { ...prev, menu: { ...prev.menu, items } }
      })
    } else if (type === "location") {
      setPageData((prev) => {
        const cities = [...prev.locations.cities]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= cities.length) return prev

        const temp = cities[index]
        cities[index] = cities[newIndex]
        cities[newIndex] = temp

        return { ...prev, locations: { ...prev.locations, cities } }
      })
    } else if (type === "feature") {
      setPageData((prev) => {
        const features = [...prev.restaurant.features]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= features.length) return prev

        const temp = features[index]
        features[index] = features[newIndex]
        features[newIndex] = temp

        return { ...prev, restaurant: { ...prev.restaurant, features } }
      })
    } else if (type === "galleryImage") {
      setPageData((prev) => {
        const images = [...prev.gallery.images]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= images.length) return prev

        const temp = images[index]
        images[index] = images[newIndex]
        images[newIndex] = temp

        return { ...prev, gallery: { ...prev.gallery, images } }
      })
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }

  const renderEditItemDialog = () => {
    if (!editingItem) return null

    if (editingItemType === "menuItem") {
      return (
        <AlertDialog open={!!editingItem} onOpenChange={() => editingItem && handleCancelEdit()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chỉnh sửa món ăn</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên món</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Danh mục</Label>
                <Input
                  id="edit-category"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Giá ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={editingItem.image || "/placeholder.svg"}
                      alt={editingItem.name}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-10">
                    <Upload className="mr-2 h-4 w-4" />
                    Thay đổi ảnh
                  </Button>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelEdit}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateItem}>Lưu thay đổi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    if (editingItemType === "location") {
      return (
        <AlertDialog open={!!editingItem} onOpenChange={() => editingItem && handleCancelEdit()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chỉnh sửa địa điểm</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Thành phố</Label>
                <Input
                  id="edit-city"
                  value={editingItem.city}
                  onChange={(e) => setEditingItem({ ...editingItem, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-locations">Số chi nhánh</Label>
                <Input
                  id="edit-locations"
                  type="number"
                  value={editingItem.locations}
                  onChange={(e) => setEditingItem({ ...editingItem, locations: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelEdit}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateItem}>Lưu thay đổi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    if (editingItemType === "feature") {
      return (
        <AlertDialog open={!!editingItem} onOpenChange={() => editingItem && handleCancelEdit()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chỉnh sửa đặc điểm</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-feature-title">Tiêu đề</Label>
                <Input
                  id="edit-feature-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-feature-description">Mô tả</Label>
                <Textarea
                  id="edit-feature-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelEdit}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateItem}>Lưu thay đổi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    if (editingItemType === "galleryImage") {
      return (
        <AlertDialog open={!!editingItem} onOpenChange={() => editingItem && handleCancelEdit()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chỉnh sửa hình ảnh</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-image-alt">Mô tả hình ảnh</Label>
                <Input
                  id="edit-image-alt"
                  value={editingItem.alt}
                  onChange={(e) => setEditingItem({ ...editingItem, alt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <div className="relative h-40 w-full">
                    <Image
                      src={editingItem.src || "/placeholder.svg"}
                      alt={editingItem.alt}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <div className="flex justify-end bg-gray-50 p-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Thay đổi ảnh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelEdit}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateItem}>Lưu thay đổi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tùy chỉnh trang chủ</h1>
          <p className="text-gray-500">Chỉnh sửa nội dung và hình ảnh cho từng phần trên trang chủ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowHelpDialog(true)} size="sm">
            <Info className="mr-2 h-4 w-4" />
            Hướng dẫn
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)} size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {showSuccess && (
        <div className="flex items-center rounded-md bg-green-50 p-4 text-green-700">
          <Check className="mr-2 h-5 w-5" />
          <span>Đã lưu thay đổi thành công!</span>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar với các phần của trang */}
        <div className="w-64 space-y-2">
          <div className="rounded-md bg-gray-100 p-3">
            <h3 className="mb-2 font-medium">Các phần trang chủ</h3>
            <div className="space-y-1">
              {Object.keys(pageData).map((section) => (
                <button
                  key={section}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    activeTab === section ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(section)}
                >
                  <span className="capitalize">{section}</span>
                  <Switch
                    checked={pageData[section as keyof typeof pageData].visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange(section, checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-7"
                    thumbClassName="h-3 w-3"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md bg-gray-100 p-3">
            <h3 className="mb-2 font-medium">Cài đặt chung</h3>
            <div className="space-y-1">
              <button
                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => (window.location.href = "/dashboard/settings/general")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Thông tin cơ bản</span>
              </button>
              <button
                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => (window.location.href = "/dashboard/settings/appearance")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Giao diện</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1">
          {/* Hero Section */}
          {activeTab === "hero" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần giới thiệu (Hero)</h2>
                  <Switch
                    checked={pageData.hero.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("hero", checked)}
                  />
                </div>

                <div className="mb-6 overflow-hidden rounded-md border border-gray-200">
                  <div className="relative h-64 w-full">
                    <Image
                      src={pageData.hero.backgroundImage || "/placeholder.svg"}
                      alt="Hero Background"
                      className="object-cover"
                      fill
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-6 text-center text-white">
                      <h1 className="mb-2 text-3xl font-bold">{pageData.hero.title}</h1>
                      <p className="mb-4 text-lg">{pageData.hero.subtitle}</p>
                      <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                        {pageData.hero.buttonText}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end bg-gray-50 p-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Thay đổi ảnh nền
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={() => handleImageUpload("hero", "backgroundImage")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-title">Tiêu đề chính</Label>
                    <Input
                      id="hero-title"
                      value={pageData.hero.title}
                      onChange={(e) => handleTextChange("hero", "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">Tiêu đề phụ</Label>
                    <Input
                      id="hero-subtitle"
                      value={pageData.hero.subtitle}
                      onChange={(e) => handleTextChange("hero", "subtitle", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-button">Nút nhấn</Label>
                    <Input
                      id="hero-button"
                      value={pageData.hero.buttonText}
                      onChange={(e) => handleTextChange("hero", "buttonText", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Section */}
          {activeTab === "about" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần giới thiệu (About)</h2>
                  <Switch
                    checked={pageData.about.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("about", checked)}
                  />
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="about-title">Tiêu đề</Label>
                      <Input
                        id="about-title"
                        value={pageData.about.title}
                        onChange={(e) => handleTextChange("about", "title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about-description">Mô tả</Label>
                      <Textarea
                        id="about-description"
                        value={pageData.about.description}
                        onChange={(e) => handleTextChange("about", "description", e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about-button">Nút nhấn</Label>
                      <Input
                        id="about-button"
                        value={pageData.about.buttonText}
                        onChange={(e) => handleTextChange("about", "buttonText", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hình ảnh</Label>
                    <div className="overflow-hidden rounded-md border border-gray-200">
                      <div className="relative h-64 w-full">
                        <Image
                          src={pageData.about.image || "/placeholder.svg"}
                          alt="About Image"
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="flex justify-end bg-gray-50 p-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Thay đổi ảnh
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={() => handleImageUpload("about", "image")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Concept Section */}
          {activeTab === "concept" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần Concept</h2>
                  <Switch
                    checked={pageData.concept.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("concept", checked)}
                  />
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="concept-title">Tiêu đề</Label>
                      <Input
                        id="concept-title"
                        value={pageData.concept.title}
                        onChange={(e) => handleTextChange("concept", "title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="concept-description">Mô tả</Label>
                      <Textarea
                        id="concept-description"
                        value={pageData.concept.description}
                        onChange={(e) => handleTextChange("concept", "description", e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="concept-button">Nút nhấn</Label>
                      <Input
                        id="concept-button"
                        value={pageData.concept.buttonText}
                        onChange={(e) => handleTextChange("concept", "buttonText", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hình ảnh</Label>
                    <div className="overflow-hidden rounded-md border border-gray-200">
                      <div className="relative h-64 w-full">
                        <Image
                          src={pageData.concept.image || "/placeholder.svg"}
                          alt="Concept Image"
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="flex justify-end bg-gray-50 p-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Thay đổi ảnh
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={() => handleImageUpload("concept", "image")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locations Section */}
          {activeTab === "locations" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần Địa điểm</h2>
                  <Switch
                    checked={pageData.locations.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("locations", checked)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="locations-title">Tiêu đề</Label>
                    <Input
                      id="locations-title"
                      value={pageData.locations.title}
                      onChange={(e) => handleTextChange("locations", "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locations-description">Mô tả</Label>
                    <Input
                      id="locations-description"
                      value={pageData.locations.description}
                      onChange={(e) => handleTextChange("locations", "description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Danh sách địa điểm</Label>
                    <div className="rounded-md border border-gray-200">
                      <div className="p-4">
                        {pageData.locations.cities.map((city, index) => (
                          <div
                            key={index}
                            className="mb-2 flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
                          >
                            <div>
                              <div className="font-medium">{city.city}</div>
                              <div className="text-sm text-gray-500">{city.locations} chi nhánh</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleMoveItem("location", index, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                                <span className="sr-only">Di chuyển lên</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleMoveItem("location", index, "down")}
                                disabled={index === pageData.locations.cities.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Di chuyển xuống</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditItem("location", city, index)}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Chỉnh sửa</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end bg-gray-50 p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCity = { city: "Thành phố mới", locations: 1 }
                            setPageData((prev) => ({
                              ...prev,
                              locations: {
                                ...prev.locations,
                                cities: [...prev.locations.cities, newCity],
                              },
                            }))
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm địa điểm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restaurant Section */}
          {activeTab === "restaurant" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần Nhà hàng</h2>
                  <Switch
                    checked={pageData.restaurant.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("restaurant", checked)}
                  />
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-title">Tiêu đề</Label>
                      <Input
                        id="restaurant-title"
                        value={pageData.restaurant.title}
                        onChange={(e) => handleTextChange("restaurant", "title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="restaurant-description">Mô tả</Label>
                      <Textarea
                        id="restaurant-description"
                        value={pageData.restaurant.description}
                        onChange={(e) => handleTextChange("restaurant", "description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="restaurant-additional">Nội dung bổ sung</Label>
                      <Textarea
                        id="restaurant-additional"
                        value={pageData.restaurant.additionalText}
                        onChange={(e) => handleTextChange("restaurant", "additionalText", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hình ảnh</Label>
                    <div className="overflow-hidden rounded-md border border-gray-200">
                      <div className="relative h-64 w-full">
                        <Image
                          src={pageData.restaurant.image || "/placeholder.svg"}
                          alt="Restaurant Image"
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="flex justify-end bg-gray-50 p-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Thay đổi ảnh
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={() => handleImageUpload("restaurant", "image")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Đặc điểm</Label>
                  <div className="rounded-md border border-gray-200">
                    <div className="p-4">
                      {pageData.restaurant.features.map((feature, index) => (
                        <div
                          key={index}
                          className="mb-2 flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
                        >
                          <div>
                            <div className="font-medium">{feature.title}</div>
                            <div className="text-sm text-gray-500">{feature.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveItem("feature", index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                              <span className="sr-only">Di chuyển lên</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveItem("feature", index, "down")}
                              disabled={index === pageData.restaurant.features.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Di chuyển xuống</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditItem("feature", feature, index)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Chỉnh sửa</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end bg-gray-50 p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFeature = { title: "Đặc điểm mới", description: "Mô tả đặc điểm mới" }
                          setPageData((prev) => ({
                            ...prev,
                            restaurant: {
                              ...prev.restaurant,
                              features: [...prev.restaurant.features, newFeature],
                            },
                          }))
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm đặc điểm
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Section */}
          {activeTab === "menu" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần Menu</h2>
                  <Switch
                    checked={pageData.menu.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("menu", checked)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="menu-title">Tiêu đề</Label>
                    <Input
                      id="menu-title"
                      value={pageData.menu.title}
                      onChange={(e) => handleTextChange("menu", "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="menu-description">Mô tả</Label>
                    <Textarea
                      id="menu-description"
                      value={pageData.menu.description}
                      onChange={(e) => handleTextChange("menu", "description", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Món ăn nổi bật</Label>
                    <div className="rounded-md border border-gray-200">
                      <div className="p-4">
                        {pageData.menu.items.map((item, index) => (
                          <div
                            key={index}
                            className="mb-2 flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="object-cover"
                                  fill
                                />
                              </div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.category} - ${item.price}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleMoveItem("menuItem", index, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                                <span className="sr-only">Di chuyển lên</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleMoveItem("menuItem", index, "down")}
                                disabled={index === pageData.menu.items.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Di chuyển xuống</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditItem("menuItem", item, index)}
                              >
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Chỉnh sửa</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between bg-gray-50 p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.href = "/dashboard/menu-management")}
                        >
                          Quản lý Menu
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newItem = {
                              name: "Món ăn mới",
                              description: "Mô tả món ăn mới",
                              price: 15,
                              image: "/placeholder.svg?height=400&width=400&text=New+Dish",
                              category: "Món mới",
                            }
                            setPageData((prev) => ({
                              ...prev,
                              menu: {
                                ...prev.menu,
                                items: [...prev.menu.items, newItem],
                              },
                            }))
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm món ăn
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Section */}
          {activeTab === "gallery" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần Thư viện ảnh</h2>
                  <Switch
                    checked={pageData.gallery.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("gallery", checked)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gallery-title">Tiêu đề</Label>
                    <Input
                      id="gallery-title"
                      value={pageData.gallery.title}
                      onChange={(e) => handleTextChange("gallery", "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery-description">Mô tả</Label>
                    <Input
                      id="gallery-description"
                      value={pageData.gallery.description}
                      onChange={(e) => handleTextChange("gallery", "description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hình ảnh</Label>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {pageData.gallery.images.map((image, index) => (
                        <div key={index} className="overflow-hidden rounded-md border border-gray-200">
                          <div className="relative h-40 w-full">
                            <Image
                              src={image.src || "/placeholder.svg"}
                              alt={image.alt}
                              className="object-cover"
                              fill
                            />
                          </div>
                          <div className="flex justify-between bg-gray-50 p-2">
                            <span className="text-sm text-gray-500 truncate max-w-[120px]">{image.alt}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditItem("galleryImage", image, index)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Chỉnh sửa</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div
                        className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-gray-400"
                        onClick={() => {
                          const newImage = {
                            src: "/placeholder.svg?height=600&width=600&text=New+Image",
                            alt: "Hình ảnh mới",
                          }
                          setPageData((prev) => ({
                            ...prev,
                            gallery: {
                              ...prev.gallery,
                              images: [...prev.gallery.images, newImage],
                            },
                          }))
                        }}
                      >
                        <ImageIcon className="mb-2 h-10 w-10 text-gray-400" />
                        <span className="text-sm text-gray-500">Thêm hình ảnh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Section */}
          {activeTab === "contact" && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Phần Liên hệ</h2>
                  <Switch
                    checked={pageData.contact.visible}
                    onCheckedChange={(checked) => handleSectionVisibilityChange("contact", checked)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-title">Tiêu đề</Label>
                    <Input
                      id="contact-title"
                      value={pageData.contact.title}
                      onChange={(e) => handleTextChange("contact", "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email liên hệ</Label>
                    <div className="space-y-4 rounded-md border border-gray-200 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-email-general">Email chung</Label>
                        <Input
                          id="contact-email-general"
                          value={pageData.contact.email.general}
                          onChange={(e) =>
                            setPageData((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                email: {
                                  ...prev.contact.email,
                                  general: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email-careers">Email tuyển dụng</Label>
                        <Input
                          id="contact-email-careers"
                          value={pageData.contact.email.careers}
                          onChange={(e) =>
                            setPageData((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                email: {
                                  ...prev.contact.email,
                                  careers: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email-press">Email báo chí</Label>
                        <Input
                          id="contact-email-press"
                          value={pageData.contact.email.press}
                          onChange={(e) =>
                            setPageData((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                email: {
                                  ...prev.contact.email,
                                  press: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mạng xã hội</Label>
                    <div className="space-y-4 rounded-md border border-gray-200 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-social-instagram">Instagram</Label>
                        <Input
                          id="contact-social-instagram"
                          value={pageData.contact.socialMedia.instagram}
                          onChange={(e) =>
                            setPageData((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                socialMedia: {
                                  ...prev.contact.socialMedia,
                                  instagram: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-social-facebook">Facebook</Label>
                        <Input
                          id="contact-social-facebook"
                          value={pageData.contact.socialMedia.facebook}
                          onChange={(e) =>
                            setPageData((prev) => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                socialMedia: {
                                  ...prev.contact.socialMedia,
                                  facebook: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog chỉnh sửa item */}
      {renderEditItemDialog()}

      {/* Dialog hướng dẫn */}
      <AlertDialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hướng dẫn tùy chỉnh trang chủ</AlertDialogTitle>
            <AlertDialogDescription>
              Dưới đây là một số hướng dẫn giúp bạn tùy chỉnh trang chủ một cách dễ dàng
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[60vh] space-y-6 overflow-auto py-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Chọn phần cần chỉnh sửa</h3>
              <p className="text-sm text-gray-600">
                Chọn phần bạn muốn chỉnh sửa từ menu bên trái. Mỗi phần tương ứng với một khu vực trên trang chủ.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">2. Bật/tắt hiển thị</h3>
              <p className="text-sm text-gray-600">
                Sử dụng công tắc bên cạnh tên phần để bật hoặc tắt hiển thị phần đó trên trang chủ.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">3. Chỉnh sửa nội dung</h3>
              <p className="text-sm text-gray-600">
                Mỗi phần có các trường văn bản khác nhau mà bạn có thể chỉnh sửa. Chỉ cần nhập nội dung mới vào các
                trường tương ứng.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">4. Thay đổi hình ảnh</h3>
              <p className="text-sm text-gray-600">
                Nhấn vào nút "Thay đổi ảnh" để tải lên hình ảnh mới cho phần tương ứng. Hình ảnh nên có chất lượng cao
                và kích thước phù hợp.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">5. Quản lý danh sách</h3>
              <p className="text-sm text-gray-600">
                Một số phần có danh sách các mục (như món ăn, địa điểm, đặc điểm). Bạn có thể thêm, xóa, di chuyển hoặc
                chỉnh sửa từng mục trong danh sách này.
              </p>
              <ul className="ml-6 list-disc text-sm text-gray-600">
                <li>
                  <strong>Thêm mục:</strong> Nhấn vào nút "Thêm..." ở cuối danh sách để thêm mục mới.
                </li>
                <li>
                  <strong>Chỉnh sửa mục:</strong> Nhấn vào biểu tượng bút chì để chỉnh sửa thông tin của mục.
                </li>
                <li>
                  <strong>Di chuyển mục:</strong> Sử dụng các mũi tên lên/xuống để thay đổi thứ tự hiển thị.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">6. Xem trước và lưu thay đổi</h3>
              <p className="text-sm text-gray-600">
                Sau khi chỉnh sửa, bạn có thể nhấn "Xem trước" để xem trước thay đổi trước khi áp dụng. Khi hài lòng với
                các thay đổi, nhấn "Lưu thay đổi" để cập nhật trang chủ.
              </p>
            </div>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-medium">Mẹo:</p>
              <p className="mt-1">
                Hãy đảm bảo rằng nội dung và hình ảnh phù hợp với nhau và truyền tải thông điệp nhất quán về nhà hàng
                của bạn. Nội dung ngắn gọn, súc tích và hình ảnh chất lượng cao sẽ tạo ấn tượng tốt với khách hàng.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xem trước */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-6xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xem trước trang chủ</AlertDialogTitle>
            <AlertDialogDescription>
              Dưới đây là bản xem trước trang chủ với các thay đổi của bạn
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="h-[70vh] overflow-auto rounded-md border border-gray-200">
            {/* Hero Section Preview */}
            {pageData.hero.visible && (
              <div className="relative min-h-[50vh]">
                <div className="absolute inset-0">
                  <Image
                    src={pageData.hero.backgroundImage || "/placeholder.svg"}
                    alt="Hero Background"
                    className="object-cover"
                    fill
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="relative z-10 flex min-h-[50vh] flex-col items-center justify-center p-6 text-center text-white">
                  <h1 className="mb-4 text-4xl font-bold">{pageData.hero.title}</h1>
                  <p className="mb-6 text-xl">{pageData.hero.subtitle}</p>
                  <button className="rounded-md bg-blue-600 px-6 py-3 text-white">{pageData.hero.buttonText}</button>
                </div>
              </div>
            )}

            {/* About Section Preview */}
            {pageData.about.visible && (
              <div className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="grid gap-12 md:grid-cols-2">
                    <div className="flex flex-col justify-center">
                      <h2 className="mb-6 text-3xl font-bold">{pageData.about.title}</h2>
                      <p className="mb-8 text-gray-600">{pageData.about.description}</p>
                      <button className="flex w-fit items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        {pageData.about.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative h-64 overflow-hidden rounded-lg md:h-auto">
                      <Image
                        src={pageData.about.image || "/placeholder.svg"}
                        alt="About"
                        className="object-cover"
                        fill
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Concept Section Preview */}
            {pageData.concept.visible && (
              <div className="bg-gray-50 py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="grid gap-12 md:grid-cols-2">
                    <div className="relative h-64 overflow-hidden rounded-lg md:h-auto md:order-2">
                      <Image
                        src={pageData.concept.image || "/placeholder.svg"}
                        alt="Concept"
                        className="object-cover"
                        fill
                      />
                    </div>
                    <div className="flex flex-col justify-center md:order-1">
                      <h2 className="mb-6 text-3xl font-bold">{pageData.concept.title}</h2>
                      <p className="mb-8 text-gray-600">{pageData.concept.description}</p>
                      <button className="flex w-fit items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                        {pageData.concept.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Locations Section Preview */}
            {pageData.locations.visible && (
              <div className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold">{pageData.locations.title}</h2>
                    <p className="mx-auto max-w-2xl text-gray-600">{pageData.locations.description}</p>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pageData.locations.cities.map((city, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                      >
                        <h3 className="mb-2 text-xl font-semibold">{city.city}</h3>
                        <p className="mb-4 text-gray-500">{city.locations} chi nhánh</p>
                        <Link href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                          Xem tất cả
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Restaurant Section Preview */}
            {pageData.restaurant.visible && (
              <div className="bg-gray-50 py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="mb-12">
                    <h2 className="mb-4 text-3xl font-bold">{pageData.restaurant.title}</h2>
                    <p className="mb-4 max-w-3xl text-gray-600">{pageData.restaurant.description}</p>
                    <p className="max-w-3xl text-gray-600">{pageData.restaurant.additionalText}</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    {pageData.restaurant.features.map((feature, index) => (
                      <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Section Preview */}
            {pageData.menu.visible && (
              <div className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold">{pageData.menu.title}</h2>
                    <p className="mx-auto max-w-2xl text-gray-600">{pageData.menu.description}</p>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    {pageData.menu.items.map((item, index) => (
                      <div key={index} className="flex overflow-hidden rounded-lg border border-gray-200">
                        <div className="relative h-auto w-1/3">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover" fill />
                        </div>
                        <div className="w-2/3 p-4">
                          <div className="text-sm text-blue-600">{item.category}</div>
                          <h3 className="mb-2 text-xl font-semibold">{item.name}</h3>
                          <p className="mb-4 text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">${item.price}</span>
                            <button className="rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200">
                              Đặt ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Section Preview */}
            {pageData.gallery.visible && (
              <div className="bg-gray-50 py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold">{pageData.gallery.title}</h2>
                    <p className="mx-auto max-w-2xl text-gray-600">{pageData.gallery.description}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {pageData.gallery.images.map((image, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fill
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span>{image.alt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section Preview */}
            {pageData.contact.visible && (
              <div className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-6">
                  <h2 className="mb-8 text-3xl font-bold">{pageData.contact.title}</h2>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 text-xl font-semibold">Liên hệ chung</h3>
                        <p className="text-gray-600">{pageData.contact.email.general}</p>
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-semibold">Tuyển dụng</h3>
                        <p className="text-gray-600">{pageData.contact.email.careers}</p>
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-semibold">Báo chí</h3>
                        <p className="text-gray-600">{pageData.contact.email.press}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-4 text-xl font-semibold">Theo dõi chúng tôi</h3>
                      <div className="flex gap-4">
                        <a
                          href={pageData.contact.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                        >
                          Instagram
                        </a>
                        <a
                          href={pageData.contact.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>Lưu thay đổi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Input file ẩn cho việc tải lên hình ảnh */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
    </div>
  )
}
