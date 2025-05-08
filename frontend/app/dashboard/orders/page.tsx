"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock data for active orders
const MOCK_ACTIVE_ORDERS = [
  {
    id: "ORD-2023-05-15-001",
    date: "15 May, 2023",
    time: "19:30",
    status: "preparing",
    type: "delivery",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 12.99 },
      { name: "Pepperoni Pizza", quantity: 1, price: 14.99 },
      { name: "Garlic Bread", quantity: 1, price: 4.99 },
      { name: "Coca Cola", quantity: 2, price: 2.99 },
    ],
    total: 38.95,
    address: "123 Main St, Anytown, AT 12345",
    estimatedDelivery: "20:15",
    paymentMethod: "Credit Card",
    deliveryPerson: "Nguyen Van A",
    trackingUrl: "#",
  },
  {
    id: "ORD-2023-05-14-003",
    date: "14 May, 2023",
    time: "12:45",
    status: "on-the-way",
    type: "delivery",
    items: [
      { name: "Seafood Pizza", quantity: 1, price: 16.99 },
      { name: "Caesar Salad", quantity: 1, price: 8.99 },
      { name: "Sprite", quantity: 1, price: 2.99 },
    ],
    total: 28.97,
    address: "456 Oak St, Anytown, AT 12345",
    estimatedDelivery: "13:15",
    paymentMethod: "Cash on Delivery",
    deliveryPerson: "Tran Van B",
    trackingUrl: "#",
  },
  {
    id: "ORD-2023-05-13-007",
    date: "13 May, 2023",
    time: "18:15",
    status: "ready-for-pickup",
    type: "pickup",
    items: [
      { name: "Vegetarian Pizza", quantity: 1, price: 13.99 },
      { name: "Buffalo Wings", quantity: 1, price: 9.99 },
      { name: "Tiramisu", quantity: 1, price: 6.99 },
    ],
    total: 30.97,
    pickupLocation: "Pizza Liêm Khiết - Downtown Branch",
    pickupTime: "18:45",
    paymentMethod: "Paid Online",
  },
]

// Status mapping for visual elements
const STATUS_MAP = {
  placed: {
    label: "Order Placed",
    color: "bg-blue-100 text-blue-800",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  confirmed: {
    label: "Order Confirmed",
    color: "bg-indigo-100 text-indigo-800",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  preparing: {
    label: "Preparing",
    color: "bg-amber-100 text-amber-800",
    icon: <Clock className="h-5 w-5" />,
  },
  "ready-for-pickup": {
    label: "Ready for Pickup",
    color: "bg-green-100 text-green-800",
    icon: <Package className="h-5 w-5" />,
  },
  "on-the-way": {
    label: "On the Way",
    color: "bg-purple-100 text-purple-800",
    icon: <Truck className="h-5 w-5" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  "picked-up": {
    label: "Picked Up",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-5 w-5" />,
  },
  issue: {
    label: "Issue Reported",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-5 w-5" />,
  },
}

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)

  // Handle order cancellation
  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      alert(`Order ${orderId} has been cancelled.`)
      // In a real app, this would call an API to cancel the order
    }
  }

  // Open order details dialog
  const openOrderDetailsDialog = (order) => {
    setSelectedOrder(order)
    setIsOrderDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
        <p className="text-gray-500">View and manage your current orders</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {MOCK_ACTIVE_ORDERS.length > 0 ? (
            MOCK_ACTIVE_ORDERS.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <CardDescription>
                        {order.date} at {order.time}
                      </CardDescription>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <Badge className={`${STATUS_MAP[order.status].color} flex items-center gap-1 px-3 py-1`}>
                        {STATUS_MAP[order.status].icon}
                        {STATUS_MAP[order.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      {order.type === "delivery" ? (
                        <>
                          <Truck className="h-5 w-5 text-blue-900" />
                          <span>Delivery</span>
                        </>
                      ) : (
                        <>
                          <Package className="h-5 w-5 text-blue-900" />
                          <span>Pickup</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-semibold">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => openOrderDetailsDialog(order)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {order.status !== "cancelled" && (
                    <>
                      {order.type === "delivery" && order.status === "on-the-way" && (
                        <Button variant="outline" className="w-full sm:w-auto" asChild>
                          <Link href={order.trackingUrl}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Track Order
                          </Link>
                        </Button>
                      )}

                      {["placed", "confirmed"].includes(order.status) && (
                        <Button
                          variant="destructive"
                          className="w-full sm:w-auto"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      )}

                      {order.status === "ready-for-pickup" && (
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Pickup
                        </Button>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Active Orders</h3>
                <p className="text-gray-500 text-center mt-1">You don't have any active orders at the moment.</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href="/delivery">Order Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Clock className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Scheduled Orders</h3>
              <p className="text-gray-500 text-center mt-1">You don't have any scheduled orders at the moment.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href="/delivery">Schedule an Order</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsDialogOpen} onOpenChange={setIsOrderDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order {selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={`${STATUS_MAP[selectedOrder.status].color} flex items-center gap-1 px-3 py-1`}>
                  {STATUS_MAP[selectedOrder.status].icon}
                  {STATUS_MAP[selectedOrder.status].label}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedOrder.type}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Order Items</h4>
                <ul className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-medium mb-2">
                  {selectedOrder.type === "delivery" ? "Delivery Information" : "Pickup Information"}
                </h4>
                {selectedOrder.type === "delivery" ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>{selectedOrder.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>Estimated delivery by {selectedOrder.estimatedDelivery}</span>
                    </div>
                    {selectedOrder.deliveryPerson && (
                      <div className="flex items-start gap-2">
                        <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                        <span>Delivery by: {selectedOrder.deliveryPerson}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>{selectedOrder.pickupLocation}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>Ready for pickup at {selectedOrder.pickupTime}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(selectedOrder.total * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(selectedOrder.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsOrderDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
