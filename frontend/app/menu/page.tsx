"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, X } from "lucide-react"
import { getTranslation } from "@/utils/translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define menu item categories
const categories = [
  "all",
  "signature-pizzas",
  "classic-pizzas",
  "pasta",
  "appetizers",
  "desserts",
  "beverages"
]

// Mock data for menu items
const menuItems = [
  {
    id: 1,
    name: "Tartufo Nero",
    description: "Truffle cream, mozzarella, wild mushrooms, arugula, shaved black truffle",
    price: 28,
    image: "/placeholder.svg?height=400&width=400&text=Tartufo+Nero",
    category: "signature-pizzas",
    featured: true,
  },
  {
    id: 2,
    name: "Margherita Elegante",
    description: "San Marzano tomato sauce, buffalo mozzarella, fresh basil, extra virgin olive oil",
    price: 18,
    image: "/placeholder.svg?height=400&width=400&text=Margherita+Elegante",
    category: "classic-pizzas",
    featured: true,
  },
  {
    id: 3,
    name: "Frutti di Mare",
    description: "Tomato sauce, mozzarella, fresh seafood medley, lemon zest, parsley, garlic oil",
    price: 30,
    image: "/placeholder.svg?height=400&width=400&text=Frutti+di+Mare",
    category: "signature-pizzas",
    featured: true,
  },
  {
    id: 4,
    name: "Tagliatelle al Tartufo",
    description: "House-made tagliatelle, butter, parmigiano, fresh black truffle",
    price: 28,
    image: "/placeholder.svg?height=400&width=400&text=Tagliatelle+Tartufo",
    category: "pasta",
    featured: true,
  },
  {
    id: 5,
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, parmigiano, fontina, honey drizzle, walnuts",
    price: 24,
    image: "/placeholder.svg?height=400&width=400&text=Quattro+Formaggi",
    category: "signature-pizzas",
    featured: false,
  },
  {
    id: 6,
    name: "Diavola",
    description: "Tomato sauce, mozzarella, spicy salami, chili oil",
    price: 20,
    image: "/placeholder.svg?height=400&width=400&text=Diavola",
    category: "classic-pizzas",
    featured: false,
  },
  {
    id: 7,
    name: "Burrata Caprese",
    description: "Fresh burrata, heirloom tomatoes, basil, balsamic glaze, sea salt",
    price: 16,
    image: "/placeholder.svg?height=400&width=400&text=Burrata+Caprese",
    category: "appetizers",
    featured: false,
  },
  {
    id: 8,
    name: "Arancini Siciliani",
    description: "Crispy risotto balls filled with peas, mozzarella and saffron",
    price: 14,
    image: "/placeholder.svg?height=400&width=400&text=Arancini+Siciliani",
    category: "appetizers",
    featured: false,
  },
  {
    id: 9,
    name: "Tiramisu",
    description: "Classic Italian dessert with mascarpone, espresso, and cocoa",
    price: 12,
    image: "/placeholder.svg?height=400&width=400&text=Tiramisu",
    category: "desserts",
    featured: false,
  },
  {
    id: 10,
    name: "Panna Cotta",
    description: "Vanilla bean panna cotta with seasonal berry compote",
    price: 10,
    image: "/placeholder.svg?height=400&width=400&text=Panna+Cotta",
    category: "desserts",
    featured: false,
  },
  {
    id: 11,
    name: "Craft Italian Sodas",
    description: "House-made sodas in various flavors - blood orange, lemon basil, or berry",
    price: 6,
    image: "/placeholder.svg?height=400&width=400&text=Italian+Sodas",
    category: "beverages",
    featured: false,
  },
  {
    id: 12,
    name: "Artisanal Wine Selection",
    description: "Selection of premium wines from Italian vineyards - glass or bottle",
    price: 14,
    image: "/placeholder.svg?height=400&width=400&text=Wine+Selection",
    category: "beverages",
    featured: false,
  },
]

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [language, setLanguage] = useState<"en" | "vi">("en")

  // Get language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)

  // Filter menu items based on category and search term
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // Get category labels from translations
  const getCategoryLabel = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      "all": "Tất cả",
      "signature-pizzas": "Pizza Đặc biệt",
      "classic-pizzas": "Pizza Cổ điển",
      "pasta": "Mì Ý",
      "appetizers": "Món khai vị",
      "desserts": "Tráng miệng",
      "beverages": "Đồ uống"
    }
    return categoryMap[category] || category
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <Image
          src="/images/meal.jpg"
          alt="Menu Banner" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white container mx-auto px-6">
          <Link href="/" className="absolute left-6 top-8 text-white hover:text-white/80 transition-colors flex items-center font-light">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Trở về Trang chủ
          </Link>
          <h1 className="text-6xl font-light mb-4">Thực đơn đầy đủ</h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
          <p className="text-xl font-light max-w-2xl">Khám phá thực đơn đa dạng với các món ăn của chúng tôi được chuẩn bị từ những nguyên liệu tươi ngon nhất.</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-6 -mt-12 relative z-10 pb-8">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input 
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 text-white border-white/20 focus:border-white/40"
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Tabs 
            defaultValue="all" 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-white/10 w-full overflow-x-auto flex-wrap">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-white/20"
                >
                  {getCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-6 py-12 text-white">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.02] duration-300"
              >
                <div className="relative h-64">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                  {item.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-amber-600/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        Nổi bật
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-sm text-blue-300 mb-2">
                    {getCategoryLabel(item.category)}
                  </div>
                  <h3 className="text-2xl font-light mb-2">{item.name}</h3>
                  <p className="text-white/70 mb-4 flex-1">{item.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-2xl font-light">${item.price}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-white/30 hover:bg-white/20 hover:text-white hover:border-white/50"
                    >
                      Đặt ngay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-light mb-4">Không tìm thấy món ăn phù hợp</h3>
            <p className="text-white/70 mb-6">Vui lòng thử từ khóa tìm kiếm khác hoặc xem tất cả các món ăn.</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
            }}>
              Xem tất cả các món ăn
            </Button>
          </div>
        )}
      </div>

      {/* Dietary Information */}
      <div className="bg-white/5 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6 text-white text-center">
          <h3 className="text-2xl font-light mb-6">Thông tin dinh dưỡng</h3>
          <p className="text-white/70 mb-4 max-w-3xl mx-auto">Chúng tôi có các lựa chọn thuần chay, không gluten và nhiều món phù hợp với các chế độ ăn uống khác nhau.</p>
          <p className="text-white/70 mb-4 max-w-3xl mx-auto">Vui lòng thông báo cho nhân viên phục vụ về bất kỳ dị ứng hoặc yêu cầu đặc biệt nào.</p>
          <Button variant="link" className="text-blue-300 hover:text-blue-400">
            Liên hệ để biết thêm thông tin
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-6 text-white/50 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">© 2025 Golden Crust. Đã đăng ký bản quyền.</p>
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            Trở về Trang chủ
          </Link>
        </div>
      </footer>
    </div>
  )
}
