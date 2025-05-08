"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Plus, Minus, ShoppingBag, Check, X, Clock, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Định nghĩa các kiểu dữ liệu
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface OrderItem extends MenuItem {
  quantity: number
  notes?: string
}

interface Order {
  id: string
  tableId: string
  tableNumber: string
  items: OrderItem[]
  status: "pending" | "preparing" | "served" | "completed" | "cancelled"
  totalAmount: number
  createdAt: Date
  notes?: string
}

// Dữ liệu mẫu cho menu
const menuItems: MenuItem[] = [
  {
    id: "p1",
    name: "Margherita Elegante",
    description: "San Marzano tomato sauce, buffalo mozzarella, fresh basil, extra virgin olive oil",
    price: 18,
    image: "/placeholder.svg?height=300&width=300&text=Margherita+Elegante",
    category: "pizza",
  },
  {
    id: "p2",
    name: "Tartufo Nero",
    description: "Truffle cream, mozzarella, wild mushrooms, arugula, shaved black truffle",
    price: 28,
    image: "/placeholder.svg?height=300&width=300&text=Tartufo+Nero",
    category: "pizza",
  },
  {
    id: "p3",
    name: "Giardino Mediterraneo",
    description: "Tomato sauce, mozzarella, grilled zucchini, eggplant, bell peppers, cherry tomatoes, basil pesto",
    price: 22,
    image: "/placeholder.svg?height=300&width=300&text=Giardino+Mediterraneo",
    category: "pizza",
  },
  {
    id: "p4",
    name: "Quattro Formaggi Superiore",
    description: "Mozzarella, gorgonzola DOP, aged parmigiano reggiano, smoked scamorza, honey drizzle, walnuts",
    price: 24,
    image: "/placeholder.svg?height=300&width=300&text=Quattro+Formaggi",
    category: "pizza",
  },
  {
    id: "pa1",
    name: "Spaghetti alla Carbonara",
    description: "Artisanal spaghetti, guanciale, egg yolks, pecorino romano, black pepper",
    price: 22,
    image: "/placeholder.svg?height=300&width=300&text=Carbonara",
    category: "pasta",
  },
  {
    id: "pa2",
    name: "Tagliatelle al Tartufo",
    description: "House-made tagliatelle, butter, parmigiano, fresh black truffle",
    price: 28,
    image: "/placeholder.svg?height=300&width=300&text=Tagliatelle+Tartufo",
    category: "pasta",
  },
  {
    id: "s1",
    name: "Insalata Cesare",
    description: "Romaine hearts, house-made caesar dressing, sourdough croutons, aged parmigiano",
    price: 16,
    image: "/placeholder.svg?height=300&width=300&text=Insalata+Cesare",
    category: "salad",
  },
  {
    id: "s2",
    name: "Caprese di Bufala",
    description: "Heirloom tomatoes, buffalo mozzarella, basil, aged balsamic, Sicilian olive oil",
    price: 18,
    image: "/placeholder.svg?height=300&width=300&text=Caprese",
    category: "salad",
  },
  {
    id: "d1",
    name: "Tiramisu Classico",
    description: "Mascarpone cream, espresso-soaked savoiardi, cocoa powder",
    price: 14,
    image: "/placeholder.svg?height=300&width=300&text=Tiramisu",
    category: "dessert",
  },
  {
    id: "d2",
    name: "Panna Cotta ai Frutti di Bosco",
    description: "Vanilla bean panna cotta, wild berry compote, mint",
    price: 12,
    image: "/placeholder.svg?height=300&width=300&text=Panna+Cotta",
    category: "dessert",
  },
  {
    id: "b1",
    name: "Acqua Panna",
    description: "Still mineral water, 750ml",
    price: 6,
    image: "/placeholder.svg?height=300&width=300&text=Acqua+Panna",
    category: "beverage",
  },
  {
    id: "b2",
    name: "San Pellegrino",
    description: "Sparkling mineral water, 750ml",
    price: 6,
    image: "/placeholder.svg?height=300&width=300&text=San+Pellegrino",
    category: "beverage",
  },
  {
    id: "b3",
    name: "Barolo DOCG",
    description: "Premium Italian red wine, 750ml",
    price: 65,
    image: "/placeholder.svg?height=300&width=300&text=Barolo",
    category: "beverage",
  },
]

// Danh sách các danh mục
const categories = [
  { id: "pizza", name: "Pizza" },
  { id: "pasta", name: "Pasta" },
  { id: "salad", name: "Salad" },
  { id: "dessert", name: "Dessert" },
  { id: "beverage", name: "Beverages" },
]

// Dữ liệu mẫu cho các đơn hàng hiện tại của bàn
const sampleOrders: Order[] = [
  {
    id: "ord-1",
    tableId: "1",
    tableNumber: "A1",
    items: [
      {
        ...menuItems[0],
        quantity: 1,
      },
      {
        ...menuItems[4],
        quantity: 2,
        notes: "Extra cheese please",
      },
    ],
    status: "served",
    totalAmount: 62,
    createdAt: new Date(Date.now() - 45 * 60000), // 45 phút trước
  },
]

export default function TableOrderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tableId = params.tableId as string
  const tableNumber = searchParams.get("tableNumber") || "Unknown"

  const [activeCategory, setActiveCategory] = useState("pizza")
  const [cart, setCart] = useState<OrderItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")
  const [showItemModal, setShowItemModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [existingOrders, setExistingOrders] = useState<Order[]>([])

  // Lấy các đơn hàng hiện tại của bàn
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    // Ở đây chúng ta sử dụng dữ liệu mẫu
    const filteredOrders = sampleOrders.filter((order) => order.tableId === tableId)
    setExistingOrders(filteredOrders)
  }, [tableId])

  // Lọc các món ăn theo danh mục
  const filteredItems = menuItems.filter((item) => item.category === activeCategory)

  // Thêm món vào giỏ hàng
  const addToCart = (item: MenuItem) => {
    setCurrentItem({
      ...item,
      quantity: 1,
      notes: "",
    })
    setShowItemModal(true)
  }

  // Lưu món vào giỏ hàng
  const saveItemToCart = () => {
    if (!currentItem) return

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === currentItem.id)
      if (existingItemIndex >= 0) {
        // Cập nhật món đã có
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = currentItem
        return updatedCart
      } else {
        // Thêm món mới
        return [...prevCart, currentItem]
      }
    })

    setShowItemModal(false)
    setCurrentItem(null)
  }

  // Xóa món khỏi giỏ hàng
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  // Cập nhật số lượng món
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  // Tính tổng số món
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Tính tổng tiền
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Xử lý đặt món
  const handlePlaceOrder = () => {
    // Trong thực tế, bạn sẽ gửi dữ liệu đến API
    // Ở đây chúng ta chỉ mô phỏng thành công
    setTimeout(() => {
      setOrderSuccess(true)
      // Thêm đơn hàng mới vào danh sách đơn hàng hiện tại
      const newOrder: Order = {
        id: `ord-${Math.floor(Math.random() * 1000)}`,
        tableId,
        tableNumber,
        items: [...cart],
        status: "pending",
        totalAmount: getTotalPrice(),
        createdAt: new Date(),
        notes: orderNotes,
      }
      setExistingOrders((prev) => [...prev, newOrder])
      // Xóa giỏ hàng
      setCart([])
      setOrderNotes("")
      setShowConfirmModal(false)
    }, 1500)
  }

  // Xử lý in hóa đơn
  const handlePrintReceipt = (order) => {
    // Tạo cửa sổ mới để in
    const printWindow = window.open("", "_blank")

    // Tạo nội dung hóa đơn
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn - Pizza Liêm Khiết</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
          }
          .receipt {
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .info {
            margin-bottom: 15px;
          }
          .info p {
            margin: 5px 0;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 15px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total {
            font-weight: bold;
            text-align: right;
            margin-bottom: 15px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
          }
          @media print {
            body {
              width: 80mm;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">Pizza Liêm Khiết</div>
            <div>123 Nguyễn Huệ, Quận 1, TP.HCM</div>
            <div>SĐT: 028-1234-5678</div>
          </div>
          
          <div class="info">
            <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
            <p><strong>Bàn:</strong> ${order.tableNumber}</p>
            <p><strong>Ngày:</strong> ${new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
            <p><strong>Giờ:</strong> ${new Date(order.createdAt).toLocaleTimeString("vi-VN")}</p>
          </div>
          
          <div class="items">
            ${order.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              ${item.notes ? `<div style="font-size: 12px; margin-left: 10px; margin-bottom: 5px;">Note: ${item.notes}</div>` : ""}
            `,
              )
              .join("")}
          </div>
          
          <div class="total">
            <div>Tổng cộng: $${order.totalAmount.toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
            <p>www.pizzaliemkhiet.com</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            In hóa đơn
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Đóng
          </button>
        </div>
      </body>
      </html>
    `

    // Ghi nội dung vào cửa sổ mới
    printWindow.document.open()
    printWindow.document.write(receiptContent)
    printWindow.document.close()

    // Tự động in sau khi tải xong
    printWindow.onload = () => {
      // Chờ một chút để đảm bảo CSS được áp dụng
      setTimeout(() => {
        printWindow.focus()
        // Không tự động in để người dùng có thể xem trước
        // printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/table-management`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
            <span>Back to Tables</span>
          </Link>
          <h1 className="text-xl font-bold">
            Table {tableNumber} <span className="text-gray-500">| Order Menu</span>
          </h1>
        </div>

        {cart.length > 0 && (
          <Button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ShoppingBag size={18} />
            <span>Place Order ({getTotalItems()})</span>
          </Button>
        )}
      </header>

      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Hiển thị các đơn hàng hiện tại của bàn */}
        {existingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Current Orders for Table {tableNumber}
            </h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {existingOrders.map((order) => (
                <div key={order.id} className="p-4 border-b last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Order #{order.id}</span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            order.status === "served"
                              ? "bg-green-100 text-green-800"
                              : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "pending"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${item.id}-${index}`} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                          {item.notes && <div className="text-xs text-gray-500 ml-5">Note: {item.notes}</div>}
                        </div>
                        <div>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Printer size={16} />
                      <span>In hóa đơn</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Tabs defaultValue="pizza" value={activeCategory} onValueChange={setActiveCategory}>
            <div className="border-b">
              <TabsList className="flex w-full h-auto bg-transparent p-0">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="p-0 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <span className="font-semibold">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                        <Button
                          onClick={() => addToCart(item)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus size={16} />
                          Add to Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Giỏ hàng */}
        {cart.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Current Order</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.notes && <p className="text-sm text-gray-600 mt-1">Note: {item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label htmlFor="order-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <Textarea
                  id="order-notes"
                  placeholder="Any special instructions for the kitchen?"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowConfirmModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingBag size={18} />
                <span>Place Order</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa món */}
      {showItemModal && currentItem && (
        <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{currentItem.name}</DialogTitle>
              <DialogDescription>${currentItem.price.toFixed(2)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: Math.max(1, currentItem.quantity - 1),
                      })
                    }
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="text-xl font-medium w-8 text-center">{currentItem.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: currentItem.quantity + 1,
                      })
                    }
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div>
                <label htmlFor="item-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <Textarea
                  id="item-notes"
                  placeholder="Any special requests for this item?"
                  value={currentItem.notes || ""}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      notes: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowItemModal(false)}>
                Cancel
              </Button>
              <Button onClick={saveItemToCart} className="bg-blue-600 hover:bg-blue-700 text-white">
                Add to Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal xác nhận đặt món */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              You are about to place an order for Table {tableNumber} with {getTotalItems()} items.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                    {item.notes && <div className="text-xs text-gray-500 ml-5">Note: {item.notes}</div>}
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} className="bg-blue-600 hover:bg-blue-700 text-white">
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal thông báo đặt món thành công */}
      <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Order Placed Successfully</h2>
            <p className="text-center text-gray-600 mb-6">
              Your order for Table {tableNumber} has been sent to the kitchen.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/table-management">Back to Tables</Link>
              </Button>
              <Button onClick={() => setOrderSuccess(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Place Another Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
