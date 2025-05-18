"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useGetTodayOrdersQuery } from '@/redux/api/order'
import { useGetMenuItemsQuery } from '@/redux/api/menuItems'
import { useGetRestaurantsQuery } from '@/redux/api/restaurant'
import { useCreateCheckoutSessionMutation } from "@/redux/api/stripeApi"
import { format } from 'date-fns'

interface OrderItem {
  menuItemId: string;
  quantity: number;
  total: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
  createdAt: string;
  restaurantId: string;
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { data: orders = [], isLoading } = useGetTodayOrdersQuery()
  const { data: menuItems = [] } = useGetMenuItemsQuery()
  const { data: restaurants = [] } = useGetRestaurantsQuery()
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate totals
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(order => order.status === 'pending')
  const pendingOrdersCount = pendingOrders.length
  const completedOrders = orders.filter(order => order.status === 'completed').length
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length
  const pendingAmount = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const handleBulkPayment = async () => {
    if (pendingOrders.length === 0) {
      toast({
        variant: "destructive",
        title: "No pending orders",
        description: "There are no pending orders to process payment for.",
      })
      return
    }

    setIsProcessing(true)
    try {
      if (paymentMethod === "card") {
        // Combine all pending orders into one checkout session
        const allItems = pendingOrders.flatMap(order => 
          order.items.map(item => {
            const menuItem = menuItems.find(mi => mi._id === item.menuItemId)
            return {
              id: item.menuItemId,
              name: menuItem?.title || 'Unknown Item',
              description: menuItem?.description || '',
              price: item.total / item.quantity,
              quantity: item.quantity
            }
          })
        )

        const checkoutData = {
          items: allItems,
          customer: {
            name: 'Bulk Payment',
            phone: '',
            address: '',
            notes: `Bulk payment for ${pendingOrdersCount} orders`
          },
          orderIds: pendingOrders.map(order => order._id)
        }

        const response = await createCheckoutSession(checkoutData).unwrap()
        
        if (response.url) {
          window.location.href = response.url
          return
        }
      } else {
        // Handle cash payment
        toast({
          title: "Payment Successful",
          description: "Cash payment has been recorded for all pending orders",
        })
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "Please try again or choose a different payment method",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Order Summary</h1>
            <p className="text-gray-500">Today's orders and total amount</p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {pendingOrdersCount > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Bulk Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Pending Amount:</span>
              <span className="font-bold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(pendingAmount)}
              </span>
            </div>
            
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash-bulk" />
                <Label htmlFor="cash-bulk">Cash Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card-bulk" />
                <Label htmlFor="card-bulk">Card Payment</Label>
              </div>
            </RadioGroup>

            <Button
              className="w-full"
              onClick={handleBulkPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Process All Pending Payments ({pendingOrdersCount} orders)
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Receipt className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-6">
            {orders.map(order => {
              const restaurant = restaurants.find(r => r._id === order.restaurantId)
              return (
                <Card key={order._id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{restaurant?.name || 'Unknown Restaurant'}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <Badge
                      className={
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map(item => {
                      const menuItem = menuItems.find(mi => mi._id === item.menuItemId)
                      return (
                        <div key={item.menuItemId} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {menuItem?.title || 'Unknown Item'}
                          </span>
                          <span>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.total)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 