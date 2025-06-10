"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ShoppingCart, Plus, Minus, X, CreditCard } from "lucide-react"
import { useAppSelector } from "@/redux/hooks"
import { useCreateCheckoutSessionMutation, useCheckPaymentStatusQuery } from "@/redux/api/stripeApi"
import { useGetMenuItemsQuery } from "@/redux/api/menuItems"
import { useGetActiveCategoriesQuery } from "@/redux/api/categoryApi"
import { useGetUserProfileQuery } from "@/redux/api/userApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

import styles from "./styles.module.css"
import { useCreateOrderMutation } from "@/redux/api/order"
import { useCreateDeliveryMutation } from "@/redux/api/deliveryApi"

interface ApiMenuItem {
  _id: string;
  title: string;
  description?: string;
  price: number;
  thumbnail: string;
  categoryId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  discountPercentage: number;
}

interface MenuItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  categoryId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  discountPercentage: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
  slug: string;
}

export default function DeliveryPage() {
  // Router and Auth hooks
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const searchParams = useSearchParams()

  // Redux API hooks
  const { data: apiMenuItems = [], isLoading: menuLoading } = useGetMenuItemsQuery()
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetActiveCategoriesQuery()
  const [createCheckoutSession] = useCreateCheckoutSessionMutation()
  const sessionId = searchParams.get("session_id")
  const { data: paymentStatusData } = useCheckPaymentStatusQuery(sessionId || '', { 
    skip: !sessionId || searchParams.get("payment") !== "success" 
  })
  const { data: userProfile } = useGetUserProfileQuery()
  const [createOrder] = useCreateOrderMutation()
  const [createDelivery] = useCreateDeliveryMutation()

  // Transform API data
  const availableCategories = categoriesResponse?.categories || []
  const menuItems: MenuItem[] = apiMenuItems.map(item => ({
    ...item,
    description: item.description || ''
  }))

  // Local state hooks
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState("")
  const [orderStep, setOrderStep] = useState(0)
  const [orderComplete, setOrderComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "cash",
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [isMenuItemOpen, setIsMenuItemOpen] = useState(false)
  const [selectedItemQuantity, setSelectedItemQuantity] = useState(1)
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [isMounted, setIsMounted] = useState(false)

  // Filter active menu items by category and status
  const filteredItems = menuItems.filter(
    (item) => item.categoryId === activeCategory && item.status === "active"
  )

  // Effect hooks
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (availableCategories.length > 0 && !activeCategory) {
      setActiveCategory(availableCategories[0]._id)
    }
  }, [availableCategories, activeCategory])

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/delivery")
    } else {
      setDeliveryInfo((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
      }))
    }
  }, [user, router])

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("deliveryCart", JSON.stringify(cart))
    }
  }, [cart])

  useEffect(() => {
    const storedCart = localStorage.getItem("deliveryCart")
    if (storedCart && cart.length === 0) {
      try {
        const parsedCart = JSON.parse(storedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCart(parsedCart)
        }
      } catch (error) {
        console.error("Error reading cart from localStorage:", error)
      }
    }
  }, [])

  useEffect(() => {
    const paymentStatus = searchParams.get("payment")
    const orderStatus = searchParams.get("order")
    const sessionId = searchParams.get("session_id")

    if (paymentStatus === "success" && sessionId) {
      if (paymentStatusData?.status === 'paid') {
        // Get pending delivery info from localStorage
        const pendingDeliveryInfo = localStorage.getItem("pendingDeliveryInfo")
        
        if (pendingDeliveryInfo) {
          // Create delivery with the stored info
          createDelivery(JSON.parse(pendingDeliveryInfo))
            .unwrap()
            .then(() => {
              // Clear cart and stored info
              localStorage.removeItem("deliveryCart")
              localStorage.removeItem("pendingDeliveryInfo")
              setCart([])
              setOrderComplete(true)
              setIsProcessing(false)
            })
            .catch((error: any) => {
              console.error('Error creating delivery after payment:', error)
              toast({
                variant: "destructive",
                title: "Delivery creation failed",
                description: "Payment was successful but there was an error creating your delivery. Please contact support.",
              })
              setIsProcessing(false)
            })
        }
      } else if (paymentStatusData) {
        // Payment not successful
        setOrderStep(1)
        setIsProcessing(false)
        toast({
          variant: "destructive",
          title: "Payment verification failed",
          description: "Please try again or choose a different payment method",
        })
      }
    } else if (paymentStatus === "failed" && sessionId) {
      setOrderStep(1)
      setIsProcessing(false)
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "Please try again or choose a different payment method",
      })
    } else if (paymentStatus === "retry") {
      setOrderStep(1)
      setIsProcessing(false)
      
      const preferredPaymentMethod = localStorage.getItem("preferredPaymentMethod")
      if (preferredPaymentMethod) {
        setDeliveryInfo(prev => ({
          ...prev,
          paymentMethod: preferredPaymentMethod
        }))
      }
      
      window.history.replaceState({}, document.title, "/delivery")
    } else if (orderStatus === "cancelled") {
      setCart([])
      localStorage.removeItem("deliveryCart")
      localStorage.removeItem("pendingDeliveryInfo")
      setOrderStep(0)
    }
  }, [searchParams, createDelivery, paymentStatusData])

  // Add this effect to filter out deleted items from cart
  useEffect(() => {
    if (apiMenuItems.length > 0 && cart.length > 0) {
      const availableMenuItemIds = new Set(apiMenuItems.map(item => item._id))
      const updatedCart = cart.filter(cartItem => availableMenuItemIds.has(cartItem._id))
      
      // Only update cart if items were removed
      if (updatedCart.length !== cart.length) {
        setCart(updatedCart)
        localStorage.setItem("deliveryCart", JSON.stringify(updatedCart))
        
        // Show toast notification if items were removed
        toast({
          title: "Cart Updated",
          description: "Some items in your cart are no longer available and have been removed.",
          variant: "default",
        })
      }
    }
  }, [apiMenuItems, cart])

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Name is required'
    }
    if (name.length < 2) {
      return 'Name must be at least 2 characters'
    }
    return ''
  }

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return 'Phone number is required'
    }
    // Basic phone validation - can be adjusted based on your requirements
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return 'Please enter a valid phone number (10-11 digits)'
    }
    return ''
  }

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      return 'Address is required'
    }
    if (address.length < 10) {
      return 'Please enter a complete address (minimum 10 characters)'
    }
    return ''
  }

  // Event handlers
  const handleInputChange = (field: string, value: string) => {
    if (!isMounted) return

    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value,
    }))

    // Validate the field
    let error = ''
    switch (field) {
      case 'name':
        error = validateName(value)
        break
      case 'phone':
        error = validatePhone(value)
        break
      case 'address':
        error = validateAddress(value)
        break
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  const isFormValid = () => {
    return !validationErrors.name && 
           !validationErrors.phone && 
           !validationErrors.address &&
           deliveryInfo.name.trim() !== '' &&
           deliveryInfo.phone.trim() !== '' &&
           deliveryInfo.address.trim() !== ''
  }

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem._id === item._id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    // Set phone and address from user profile if available
    if (userProfile) {
      setDeliveryInfo(prev => ({
        ...prev,
        phone: userProfile.phone || prev.phone,
        address: userProfile.address || prev.address
      }))
    }
    setOrderStep(1)
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    try {
      // Check if all items in cart are still available
      const availableMenuItemIds = new Set(apiMenuItems.map(item => item._id))
      const unavailableItems = cart.filter(item => !availableMenuItemIds.has(item._id))

      if (unavailableItems.length > 0) {
        // Remove unavailable items from cart
        const updatedCart = cart.filter(item => availableMenuItemIds.has(item._id))
        setCart(updatedCart)
        localStorage.setItem("deliveryCart", JSON.stringify(updatedCart))

        setIsProcessing(false)
        toast({
          title: "Cart Updated",
          description: "Some items in your cart are no longer available. Please review your order.",
          variant: "destructive",
        })
        return
      }

      if (deliveryInfo.paymentMethod === "card") {
        // Create checkout session for card payment
        const checkoutData = {
          items: cart.map(item => ({
            id: item._id,
            name: item.title,
            description: item.description,
            price: item.price,
            image: item.thumbnail,
            quantity: item.quantity
          })),
          customer: {
            name: deliveryInfo.name,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            notes: deliveryInfo.notes
          },
          deliveryFee: 5
        }

        console.log('Creating checkout session with data:', checkoutData)
        const response = await createCheckoutSession(checkoutData).unwrap()
        console.log('Checkout session response:', response)
        
        if (response.url) {
          // Store delivery info in localStorage for after payment
          const pendingDeliveryInfo = {
            userId: user?._id,
            customerName: deliveryInfo.name,
            items: cart.map(item => ({
              menuItemId: item._id,
              menuItemName: item.title,
              quantity: item.quantity,
              price: item.price,
              discountPercentage: item.discountPercentage || 0,
              total: item.price * item.quantity
            })),
            totalAmount: getTotalPrice() + 5,
            expectedDeliveryTime: new Date(Date.now() + 1000 * 60 * 30),
            notes: deliveryInfo.notes,
            deliveryAddress: deliveryInfo.address,
            deliveryPhone: deliveryInfo.phone,
            paymentMethod: "online payment" as const,
            paymentStatus: "pending" as const
          }
          
          console.log('Storing pending delivery info:', pendingDeliveryInfo)
          localStorage.setItem("pendingDeliveryInfo", JSON.stringify(pendingDeliveryInfo))
          
          // Redirect to Stripe checkout
          window.location.href = response.url
          return
        } else {
          throw new Error('No checkout URL received from server')
        }
      } else {
        // Create delivery for cash on delivery
        const deliveryData = {
          userId: user?._id,
          customerName: deliveryInfo.name,
          items: cart.map(item => ({
            menuItemId: item._id,
            menuItemName: item.title,
            quantity: item.quantity,
            price: item.price,
            discountPercentage: item.discountPercentage || 0,
            total: item.price * item.quantity
          })),
          totalAmount: getTotalPrice() + 5, // Including delivery fee
          expectedDeliveryTime: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
          notes: deliveryInfo.notes,
          deliveryAddress: deliveryInfo.address,
          deliveryPhone: deliveryInfo.phone,
          paymentMethod: "cash on delivery" as const,
          paymentStatus: "pending" as const
        }

        console.log('Creating delivery with data:', deliveryData)
        const response = await createDelivery(deliveryData).unwrap()
        console.log('Delivery creation response:', response)
        
        if (response) {
          // Clear cart and show success
          localStorage.removeItem("deliveryCart")
          setCart([])
          setOrderComplete(true)
          setIsProcessing(false)
        } else {
          throw new Error('No response received from server')
        }
      }
    } catch (error: any) {
      console.error('Error processing delivery:', error)
      console.error('Error details:', {
        status: error.status,
        data: error.data,
        message: error.message,
        error: error.error,
        originalError: error.originalError
      })
      setIsProcessing(false)
      
      // Extract error message from the error response
      let errorMessage = 'There was an error processing your delivery. Please try again.'
      
      if (error.status === 500) {
        if (error.data?.error?.details) {
          // Handle validation errors
          errorMessage = `Server error: ${error.data.error.details}`
        } else if (error.data?.error?.message) {
          // Handle specific error messages
          errorMessage = `Server error: ${error.data.error.message}`
        } else if (error.data?.message) {
          // Handle general error messages
          errorMessage = `Server error: ${error.data.message}`
        } else {
          errorMessage = 'Server error: Please try again later or contact support.'
        }
      } else if (error.data?.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.error) {
        errorMessage = error.error
      }

      // Log the full error object for debugging
      console.error('Full error object:', JSON.stringify(error, null, 2))
      
      toast({
        variant: "destructive",
        title: "Delivery failed",
        description: errorMessage,
      })
    }
  }

  const handleQuantityChange = (value: string) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '')
    // Convert to number and ensure it's at least 1
    const newQuantity = Math.max(1, parseInt(numericValue) || 1)
    setSelectedItemQuantity(newQuantity)
  }

  // Loading state
  if (menuLoading || categoriesLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading...</p>
      </div>
    )
  }

  // Not logged in
  if (!user) return null

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern} />
      <div className={styles.backgroundCircle} />
      
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>
            <ChevronLeft className={styles.backIcon} />
            Back to Home
          </Link>
        </div>
        <div className={styles.headerCenter}>
          <h1 className={styles.logo}>Golden Crust</h1>
        </div>
        <div className={styles.headerRight} />
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
                      {availableCategories.map((category) => (
                        <TabsTrigger
                          key={category._id}
                          value={category._id}
                          className={styles.categoryTab}
                          onClick={() => setActiveCategory(category._id)}
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {availableCategories.map((category) => (
                      <TabsContent key={category._id} value={category._id} className={styles.menuItems}>
                        <div className={styles.menuGrid}>
                          {filteredItems.map((item) => (
                            <div
                              key={item._id}
                              className={styles.menuItem}
                              onClick={() => {
                                setSelectedMenuItem(item)
                                setIsMenuItemOpen(true)
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className={styles.menuItemImageContainer}>
                                <Image
                                  src={item.thumbnail || "/placeholder.svg"}
                                  alt={item.title || "Menu item image"}
                                  width={300}
                                  height={300}
                                  className={styles.menuItemImage}
                                />
                              </div>
                              <div className={styles.menuItemContent}>
                                <h3 className={styles.menuItemName}>{item.title}</h3>
                                <p className={styles.menuItemDescription}>{item.description}</p>
                                <div className={styles.menuItemFooter}>
                                  <span className={styles.menuItemPrice}>${item.price.toFixed(2)}</span>
                                  <Button className={styles.addButton} onClick={e => { e.stopPropagation(); addToCart(item); }}>
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
                            className={`${styles.input} ${validationErrors.name ? styles.inputError : ''}`}
                            placeholder="Enter your full name"
                            value={deliveryInfo.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            required
                          />
                          {validationErrors.name && (
                            <div className={styles.errorMessage}>{validationErrors.name}</div>
                          )}
                        </div>
                        <div className={styles.formGroup}>
                          <Label htmlFor="phone" className={styles.formLabel}>
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            className={`${styles.input} ${validationErrors.phone ? styles.inputError : ''}`}
                            placeholder="Enter your phone number"
                            value={deliveryInfo.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            required
                          />
                          {validationErrors.phone && (
                            <div className={styles.errorMessage}>{validationErrors.phone}</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <Label htmlFor="address" className={styles.formLabel}>
                          Delivery Address
                        </Label>
                        <div className="text-xs text-gray-500 mb-1">
                          (Tip: Include "fail" or "error" in your address to simulate payment failure when using card
                          payment)
                        </div>
                        <Textarea
                          id="address"
                          className={`${styles.textarea} ${validationErrors.address ? styles.inputError : ''}`}
                          placeholder="Enter your full address"
                          value={deliveryInfo.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          required
                        />
                        {validationErrors.address && (
                          <div className={styles.errorMessage}>{validationErrors.address}</div>
                        )}
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
                          <div key={item._id} className={styles.orderItem}>
                            <div className={styles.orderItemQuantity}>{item.quantity}x</div>
                            <div className={styles.orderItemName}>{item.title}</div>
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
                        disabled={!isFormValid() || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Processing Payment...
                          </>
                        ) : (
                          "Place Order"
                        )}
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

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <button
            className={
              isCartOpen
                ? `${styles.cartButton} ${styles.cartButtonHidden}`
                : styles.cartButton
            }
            aria-label="Open cart"
          >
            <ShoppingCart className={styles.cartIcon} />
            {cart.length > 0 && (
              <span className={styles.cartBadge}>{getTotalItems()}</span>
            )}
          </button>
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
                  <div key={item._id} className={styles.cartItem}>
                    <div className={styles.cartItemImage}>
                      <Image
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        width={64}
                        height={64}
                        className={styles.itemImage}
                      />
                    </div>
                    <div className={styles.cartItemDetails}>
                      <h4 className={styles.cartItemName}>{item.title}</h4>
                      <div className={styles.cartItemControls}>
                        <div className={styles.quantityControls}>
                          <Button
                            variant="outline"
                            size="icon"
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            <Minus className={styles.quantityIcon} />
                          </Button>
                          <input
                            type="text"
                            className={styles.quantityInput}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                            min="1"
                            inputMode="numeric"
                            pattern="[0-9]*"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
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
                      onClick={() => removeFromCart(item._id)}
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

      {/* Menu Item Details Dialog */}
      <Dialog open={isMenuItemOpen} onOpenChange={setIsMenuItemOpen}>
        <DialogContent className={styles.menuItemDialog}>
          {selectedMenuItem && (
            <div className={styles.menuItemDetails}>
              <DialogHeader>
                <DialogTitle className={styles.menuItemDialogTitle}>{selectedMenuItem.title}</DialogTitle>
              </DialogHeader>
              
              <div className={styles.menuItemDialogImage}>
                <Image
                  src={selectedMenuItem.thumbnail || "/placeholder.svg"}
                  alt={selectedMenuItem.title || "Menu item image"}
                  width={400}
                  height={300}
                  className={styles.detailsImage}
                />
              </div>

              <div className={styles.menuItemDialogContent}>
                <p className={styles.menuItemDialogDescription}>{selectedMenuItem.description}</p>
                
                <div className={styles.menuItemDialogPrice}>
                  ${selectedMenuItem.price.toFixed(2)}
                </div>

                <div className={styles.menuItemDialogControls}>
                  <div className={styles.quantityControls}>
                    <Button
                      variant="outline"
                      size="icon"
                      className={styles.quantityButton}
                      onClick={() => setSelectedItemQuantity(prev => Math.max(1, prev - 1))}
                    >
                      <Minus className={styles.quantityIcon} />
                    </Button>
                    <input
                      type="text"
                      className={styles.quantityInput}
                      value={selectedItemQuantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      min="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className={styles.quantityButton}
                      onClick={() => setSelectedItemQuantity(prev => prev + 1)}
                    >
                      <Plus className={styles.quantityIcon} />
                    </Button>
                  </div>

                  <Button
                    className={styles.addToCartButton}
                    onClick={() => {
                      // Add multiple items to cart
                      for (let i = 0; i < selectedItemQuantity; i++) {
                        addToCart(selectedMenuItem)
                      }
                      setIsMenuItemOpen(false)
                      setSelectedItemQuantity(1) // Reset quantity
                    }}
                  >
                    Add to Cart - ${(selectedMenuItem.price * selectedItemQuantity).toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>GOLDEN CRUST</div>
          <div className={styles.footerDivider}></div>
          <div className={styles.footerCopyright}>© 2023 Golden Crust. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
