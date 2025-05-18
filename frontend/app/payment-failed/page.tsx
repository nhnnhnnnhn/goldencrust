"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, AlertTriangle, CreditCard, ArrowRight, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import styles from "./styles.module.css"

export default function PaymentFailedPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  // Định nghĩa kiểu dữ liệu cho item trong giỏ hàng
  interface CartItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    quantity: number;
  }

  // State để lưu trữ thông tin đơn hàng
  const [orderDetails, setOrderDetails] = useState({
    id: "ORD-" + Math.floor(Math.random() * 10000),
    total: 0,
    items: [] as CartItem[],
    deliveryFee: 5,
  })

  // Lấy dữ liệu giỏ hàng từ localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("deliveryCart")
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart) as CartItem[]
        const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)

        setOrderDetails({
          ...orderDetails,
          items: cartItems,
          total: subtotal + orderDetails.deliveryFee,
        })
      } catch (error) {
        console.error("Error parsing cart data:", error)
      }
    }
  }, [orderDetails.deliveryFee])

  const handleRetryPayment = () => {
    setIsProcessing(true)

    if (paymentMethod === "cash") {
      // Chuyển sang phương thức thanh toán tiền mặt
      localStorage.setItem("preferredPaymentMethod", "cash")
      router.push("/delivery?payment=retry&method=cash")
    } else {
      // Vẫn sử dụng thẻ tín dụng, quay lại trang delivery để tạo Stripe Checkout Session mới
      localStorage.setItem("preferredPaymentMethod", "card")
      router.push("/delivery?payment=retry&method=card")
    }
  }

  const handleCancelOrder = () => {
    // In a real app, this would call an API to cancel the order
    router.push("/delivery?order=cancelled")
  }

  return (
    <div className={styles.container}>
      {/* Background elements */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.backgroundCircle}></div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/delivery" className={styles.backLink}>
            <ChevronLeft className={styles.backIcon} />
            <span>Back to Delivery</span>
          </Link>
        </div>
        <div className={styles.headerCenter}>
          <Link href="/" className={styles.logo}>
            GOLDEN CRUST
          </Link>
        </div>
        <div className={styles.headerRight}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.paymentFailedContainer}>
          <div className={styles.failedIcon}>
            <AlertTriangle className={styles.alertIcon} />
          </div>
          <h2 className={styles.failedTitle}>Payment Failed</h2>
          <p className={styles.failedMessage}>
            We were unable to process your payment. Your order has been saved, but not confirmed.
          </p>

          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.orderItems}>
              {orderDetails.items.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.orderItemQuantity}>{item.quantity}x</div>
                  <div className={styles.orderItemName}>{item.name}</div>
                  <div className={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className={styles.orderTotals}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Subtotal</span>
                <span className={styles.totalValue}>
                  ${orderDetails.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Delivery Fee</span>
                <span className={styles.totalValue}>${orderDetails.deliveryFee.toFixed(2)}</span>
              </div>
              <div className={styles.grandTotal}>
                <span>Total</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={styles.paymentOptions}>
            <h3 className={styles.optionsTitle}>Payment Options</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className={styles.paymentMethods}>
              <div className={styles.paymentMethod}>
                <RadioGroupItem value="card" id="card" className={styles.radioItem} />
                <Label htmlFor="card" className={styles.paymentLabel}>
                  <CreditCard className={styles.paymentIcon} />
                  <div>
                    <div className={styles.methodName}>Credit/Debit Card</div>
                    <div className={styles.methodDescription}>Retry with the same or a different card</div>
                  </div>
                </Label>
              </div>
              <div className={styles.paymentMethod}>
                <RadioGroupItem value="cash" id="cash" className={styles.radioItem} />
                <Label htmlFor="cash" className={styles.paymentLabel}>
                  <CreditCard className={styles.paymentIcon} />
                  <div>
                    <div className={styles.methodName}>Cash on Delivery</div>
                    <div className={styles.methodDescription}>Pay with cash when your order arrives</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className={styles.helpSection}>
            <Accordion type="single" collapsible className={styles.helpAccordion}>
              <AccordionItem value="reasons">
                <AccordionTrigger className={styles.accordionTrigger}>Why did my payment fail?</AccordionTrigger>
                <AccordionContent className={styles.accordionContent}>
                  <ul className={styles.reasonsList}>
                    <li>Insufficient funds in your account</li>
                    <li>Incorrect card details entered</li>
                    <li>Your card may have expired</li>
                    <li>Your bank may have declined the transaction</li>
                    <li>There might be a temporary issue with our payment processor</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="help">
                <AccordionTrigger className={styles.accordionTrigger}>Need help with your payment?</AccordionTrigger>
                <AccordionContent className={styles.accordionContent}>
                  <p>
                    If you continue to experience issues, please contact our customer support at{" "}
                    <a href="mailto:support@pizzaliemkhiet.com" className={styles.supportLink}>
                      support@pizzaliemkhiet.com
                    </a>{" "}
                    or call us at +84 123 456 789.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className={styles.actionButtons}>
            <Button
              variant="outline"
              className={styles.cancelButton}
              onClick={handleCancelOrder}
              disabled={isProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
            <Button className={styles.retryButton} onClick={handleRetryPayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  Retry Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

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
