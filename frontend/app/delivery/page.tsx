"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ShoppingCart, Plus, Minus, X, CreditCard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import styles from "./styles.module.css"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function DeliveryPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState("pizza")
  const [orderStep, setOrderStep] = useState(0)
  const [orderComplete, setOrderComplete] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "cash",
  })

  // Check if user is logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/delivery")
    } else if (user) {
      // Pre-fill form with user data
      setDeliveryInfo((prev) => ({
        ...prev,
        name: user.name || prev.name,
      }))
    }
  }, [user, isLoading, router])

  const handleInputChange = (field: string, value: string) => {
    setDeliveryInfo({
      ...deliveryInfo,
      [field]: value,
    })
  }

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    setOrderStep(1)
  }

  const handlePlaceOrder = () => {
    setOrderComplete(true)
  }

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
      id: "p5",
      name: "Prosciutto di Parma",
      description: "Tomato sauce, mozzarella, 24-month aged prosciutto di Parma, arugula, shaved parmigiano",
      price: 26,
      image: "/placeholder.svg?height=300&width=300&text=Prosciutto+di+Parma",
      category: "pizza",
    },
    {
      id: "p6",
      name: "Frutti di Mare",
      description: "Tomato sauce, mozzarella, fresh seafood medley, lemon zest, parsley, garlic oil",
      price: 30,
      image: "/placeholder.svg?height=300&width=300&text=Frutti+di+Mare",
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
      id: "pa3",
      name: "Lasagna Tradizionale",
      description: "Layers of fresh pasta, slow-cooked ragù, béchamel, parmigiano reggiano",
      price: 24,
      image: "/placeholder.svg?height=300&width=300&text=Lasagna",
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

  const categories = [
    { id: "pizza", name: "Pizza" },
    { id: "pasta", name: "Pasta" },
    { id: "salad", name: "Salad" },
    { id: "dessert", name: "Dessert" },
    { id: "beverage", name: "Beverages" },
  ]

  const filteredItems = menuItems.filter((item) => item.category === activeCategory)

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent"></div>
      </div>
    )
  }

  // If not logged in, the useEffect will redirect to login page
  if (!user) return null

  return (
    <div className={styles.container}>
      {/* Background elements */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.backgroundCircle}></div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>
            <ChevronLeft className={styles.backIcon} />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className={styles.headerCenter}>
          <Link href="/" className={styles.logo}>
            PIZZA LIÊM KHIẾT&apos;S
          </Link>
        </div>
        <div className={styles.headerRight}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className={styles.cartButton}>
                <ShoppingCart className={styles.cartIcon} />
                {getTotalItems() > 0 && <span className={styles.cartBadge}>{getTotalItems()}</span>}
              </Button>
            </SheetTrigger>
            <SheetContent className={styles.cartSheet}>
              <SheetHeader>
                <SheetTitle className={styles.cartTitle}>Your Order</SheetTitle>
                <SheetDescription className={styles.cartDescription}>
                  {cart.length === 0 ? "Your cart is empty" : `${getTotalItems()} items in your cart`}
                </SheetDescription>
              </SheetHeader>

              {cart.length > 0 ? (
                <>
                  <div className={styles.cartItems}>
                    {cart.map((item) => (
                      <div key={item.id} className={styles.cartItem}>
                        <div className={styles.cartItemImage}>
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className={styles.itemImage}
                          />
                        </div>
                        <div className={styles.cartItemDetails}>
                          <h4 className={styles.cartItemName}>{item.name}</h4>
                          <div className={styles.cartItemControls}>
                            <div className={styles.quantityControls}>
                              <Button
                                variant="outline"
                                size="icon"
                                className={styles.quantityButton}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className={styles.quantityIcon} />
                              </Button>
                              <span className={styles.quantity}>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className={styles.quantityButton}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className={styles.quantityIcon} />
                              </Button>
                            </div>
                            <div className={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={styles.removeButton}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className={styles.removeIcon} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className={styles.cartSummary}>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Subtotal</span>
                      <span className={styles.summaryValue}>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabelSmall}>Delivery Fee</span>
                      <span className={styles.summaryValueSmall}>$5.00</span>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>Total</span>
                      <span>${(getTotalPrice() + 5).toFixed(2)}</span>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button className={styles.checkoutButton} onClick={handleCheckout}>
                          Checkout
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </div>
                </>
              ) : (
                <div className={styles.emptyCart}>
                  <ShoppingCart className={styles.emptyCartIcon} />
                  <p className={styles.emptyCartText}>Your cart is empty</p>
                  <SheetClose asChild>
                    <Button variant="outline" className={styles.continueShoppingButton}>
                      Continue Shopping
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className={styles.main}>
        {!orderComplete ? (
          <>
            {orderStep === 0 ? (
              <>
                <div className={styles.pageTitle}>
                  <h1>Gourmet Delivery</h1>
                  <div className={styles.decorativeLine}></div>
                  <p>Experience our Michelin-starred cuisine in the comfort of your home</p>
                </div>

                <div className={styles.menuContainer}>
                  <Tabs
                    defaultValue="pizza"
                    value={activeCategory}
                    onValueChange={setActiveCategory}
                    className={styles.menuTabs}
                  >
                    <TabsList className={styles.categoryTabs}>
                      {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id} className={styles.categoryTab}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {categories.map((category) => (
                      <TabsContent key={category.id} value={category.id} className={styles.menuItems}>
                        <div className={styles.menuGrid}>
                          {filteredItems.map((item) => (
                            <div key={item.id} className={styles.menuItem}>
                              <div className={styles.menuItemImageContainer}>
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={300}
                                  height={300}
                                  className={styles.menuItemImage}
                                />
                              </div>
                              <div className={styles.menuItemContent}>
                                <h3 className={styles.menuItemName}>{item.name}</h3>
                                <p className={styles.menuItemDescription}>{item.description}</p>
                                <div className={styles.menuItemFooter}>
                                  <span className={styles.menuItemPrice}>${item.price.toFixed(2)}</span>
                                  <Button className={styles.addButton} onClick={() => addToCart(item)}>
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </>
            ) : (
              <div className={styles.checkoutContainer}>
                <div className={styles.pageTitle}>
                  <h1>Checkout</h1>
                  <div className={styles.decorativeLine}></div>
                  <p>Complete your order details</p>
                </div>

                <div className={styles.checkoutGrid}>
                  <div className={styles.deliveryInfoContainer}>
                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Delivery Information</h2>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <Label htmlFor="name" className={styles.formLabel}>
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            className={styles.input}
                            placeholder="Enter your full name"
                            value={deliveryInfo.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <Label htmlFor="phone" className={styles.formLabel}>
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            className={styles.input}
                            placeholder="Enter your phone number"
                            value={deliveryInfo.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <Label htmlFor="address" className={styles.formLabel}>
                          Delivery Address
                        </Label>
                        <Textarea
                          id="address"
                          className={styles.textarea}
                          placeholder="Enter your full address"
                          value={deliveryInfo.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <Label htmlFor="notes" className={styles.formLabel}>
                          Delivery Notes (Optional)
                        </Label>
                        <Textarea
                          id="notes"
                          className={styles.textarea}
                          placeholder="Any special instructions for delivery?"
                          value={deliveryInfo.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h2 className={styles.sectionTitle}>Payment Method</h2>
                      <RadioGroup
                        value={deliveryInfo.paymentMethod}
                        onValueChange={(value) => handleInputChange("paymentMethod", value)}
                        className={styles.paymentOptions}
                      >
                        <div className={styles.paymentOption}>
                          <RadioGroupItem value="cash" id="cash" className={styles.radioItem} />
                          <Label htmlFor="cash" className={styles.paymentLabel}>
                            <CreditCard className={styles.paymentIcon} />
                            Cash on Delivery
                          </Label>
                        </div>
                        <div className={styles.paymentOption}>
                          <RadioGroupItem value="card" id="card" className={styles.radioItem} />
                          <Label htmlFor="card" className={styles.paymentLabel}>
                            <CreditCard className={styles.paymentIcon} />
                            Credit/Debit Card
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className={styles.orderSummaryContainer}>
                    <div className={styles.orderSummary}>
                      <h2 className={styles.summaryTitle}>Order Summary</h2>
                      <div className={styles.orderItems}>
                        {cart.map((item) => (
                          <div key={item.id} className={styles.orderItem}>
                            <div className={styles.orderItemQuantity}>{item.quantity}x</div>
                            <div className={styles.orderItemName}>{item.name}</div>
                            <div className={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderTotals}>
                        <div className={styles.totalRow}>
                          <span className={styles.totalLabel}>Subtotal</span>
                          <span className={styles.totalValue}>${getTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className={styles.totalRow}>
                          <span className={styles.totalLabel}>Delivery Fee</span>
                          <span className={styles.totalValue}>$5.00</span>
                        </div>
                        <div className={styles.grandTotal}>
                          <span>Total</span>
                          <span>${(getTotalPrice() + 5).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        className={styles.placeOrderButton}
                        onClick={handlePlaceOrder}
                        disabled={!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address}
                      >
                        Place Order
                      </Button>

                      <Button variant="outline" className={styles.backToMenuButton} onClick={() => setOrderStep(0)}>
                        Back to Menu
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.confirmationContainer}>
            <div className={styles.confirmationIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.checkIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={styles.confirmationTitle}>Order Confirmed</h2>
            <p className={styles.confirmationMessage}>
              Thank you for your order. We have sent a confirmation to your phone.
            </p>

            <div className={styles.orderDetails}>
              <h3 className={styles.detailsTitle}>Order Details</h3>
              <div className={styles.detailsContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Order Number:</span>
                  <span className={styles.detailValue}>#ORD-{Math.floor(Math.random() * 10000)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estimated Delivery:</span>
                  <span className={styles.detailValue}>45-60 minutes</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Delivery Address:</span>
                  <span className={styles.detailValue}>{deliveryInfo.address}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total:</span>
                  <span className={styles.detailValue}>${(getTotalPrice() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.trackingContainer}>
              <h3 className={styles.trackingTitle}>Track Your Order</h3>
              <div className={styles.trackingSteps}>
                <div className={styles.trackingStep}>
                  <div className={styles.stepIndicator}>
                    <div className={`${styles.stepDot} ${styles.completedDot}`}></div>
                    <div className={styles.stepConnector}></div>
                  </div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepName}>Order Received</div>
                    <div className={styles.stepStatus}>Completed</div>
                  </div>
                </div>
                <div className={styles.trackingStep}>
                  <div className={styles.stepIndicator}>
                    <div className={`${styles.stepDot} ${styles.activeDot}`}></div>
                    <div className={styles.stepConnector}></div>
                  </div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepName}>Preparing</div>
                    <div className={styles.stepStatus}>In Progress</div>
                  </div>
                </div>
                <div className={styles.trackingStep}>
                  <div className={styles.stepIndicator}>
                    <div className={styles.stepDot}></div>
                    <div className={styles.stepConnector}></div>
                  </div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepName}>Out for Delivery</div>
                    <div className={styles.stepStatus}>Pending</div>
                  </div>
                </div>
                <div className={styles.trackingStep}>
                  <div className={styles.stepIndicator}>
                    <div className={styles.stepDot}></div>
                  </div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepName}>Delivered</div>
                    <div className={styles.stepStatus}>Pending</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.confirmationActions}>
              <Button variant="outline" asChild className={styles.homeButton}>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>PIZZA LIÊM KHIẾT&apos;S</div>
          <div className={styles.footerDivider}></div>
          <div className={styles.footerCopyright}>© 2023 Pizza Liêm Khiết. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
