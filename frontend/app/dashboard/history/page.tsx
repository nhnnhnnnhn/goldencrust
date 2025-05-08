"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Download, FileText, MapPin, RefreshCw, Search, ShoppingBag, Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"

// Mock data for order history
const MOCK_ORDER_HISTORY = [
  {
    id: "ORD-2023-05-01-002",
    date: "1 May, 2023",
    time: "19:45",
    type: "delivery",
    items: [
      { name: "Margherita Pizza", quantity: 2, price: 12.99 },
      { name: "Tiramisu", quantity: 1, price: 6.99 },
      { name: "Coca Cola", quantity: 2, price: 2.99 },
    ],
    total: 38.95,
    address: "123 Main St, Anytown, AT 12345",
    status: "delivered",
    rated: true,
    rating: 5,
  },
  {
    id: "ORD-2023-04-25-007",
    date: "25 April, 2023",
    time: "13:30",
    type: "pickup",
    items: [
      { name: "Pepperoni Pizza", quantity: 1, price: 14.99 },
      { name: "Garlic Bread", quantity: 1, price: 4.99 },
      { name: "Sprite", quantity: 1, price: 2.99 },
    ],
    total: 22.97,
    pickupLocation: "Pizza Liêm Khiết - Downtown Branch",
    status: "picked-up",
    rated: false,
  },
  {
    id: "ORD-2023-04-18-012",
    date: "18 April, 2023",
    time: "20:15",
    type: "delivery",
    items: [
      { name: "Seafood Pizza", quantity: 1, price: 16.99 },
      { name: "Caesar Salad", quantity: 1, price: 8.99 },
      { name: "Cheesecake", quantity: 1, price: 5.99 },
      { name: "Iced Tea", quantity: 2, price: 2.49 },
    ],
    total: 36.95,
    address: "123 Main St, Anytown, AT 12345",
    status: "delivered",
    rated: true,
    rating: 4,
  },
  {
    id: "ORD-2023-04-10-005",
    date: "10 April, 2023",
    time: "18:00",
    type: "delivery",
    items: [
      { name: "Vegetarian Pizza", quantity: 1, price: 13.99 },
      { name: "Buffalo Wings", quantity: 1, price: 9.99 },
      { name: "Chocolate Brownie", quantity: 1, price: 4.99 },
      { name: "Coca Cola", quantity: 1, price: 2.99 },
    ],
    total: 31.96,
    address: "123 Main St, Anytown, AT 12345",
    status: "delivered",
    rated: false,
  },
  {
    id: "ORD-2023-04-02-009",
    date: "2 April, 2023",
    time: "12:30",
    type: "pickup",
    items: [
      { name: "Hawaiian Pizza", quantity: 1, price: 14.99 },
      { name: "Mozzarella Sticks", quantity: 1, price: 7.99 },
      { name: "Sprite", quantity: 1, price: 2.99 },
    ],
    total: 25.97,
    pickupLocation: "Pizza Liêm Khiết - Downtown Branch",
    status: "picked-up",
    rated: true,
    rating: 5,
  },
  {
    id: "ORD-2023-03-25-003",
    date: "25 March, 2023",
    time: "19:15",
    type: "delivery",
    items: [
      { name: "Meat Lovers Pizza", quantity: 1, price: 16.99 },
      { name: "Garlic Bread", quantity: 1, price: 4.99 },
      { name: "Tiramisu", quantity: 1, price: 6.99 },
      { name: "Coca Cola", quantity: 2, price: 2.99 },
    ],
    total: 34.95,
    address: "123 Main St, Anytown, AT 12345",
    status: "delivered",
    rated: true,
    rating: 4,
  },
]

export default function OrderHistoryPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null)
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)

  // Filter orders based on search term
  const filteredOrders = MOCK_ORDER_HISTORY.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Handle reordering
  const handleReorder = (order) => {
    alert(`Reordering items from order ${order.id}`)
    // In a real app, this would add the items to the cart and redirect to checkout
  }

  // Handle submitting a review
  const handleSubmitReview = () => {
    if (selectedOrder) {
      alert(`Thank you for rating your order ${selectedOrder.id} with ${rating} stars!`)
      setIsReviewDialogOpen(false)
      // In a real app, this would submit the review to an API
    }
  }

  // Open review dialog
  const openReviewDialog = (order) => {
    setSelectedOrder(order)
    setRating(order.rating || 5)
    setReviewText("")
    setIsReviewDialogOpen(true)
  }

  // Open order details dialog
  const openOrderDetailsDialog = (order) => {
    setSelectedOrderForDetails(order)
    setIsOrderDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Order History</h1>
        <p className="text-gray-500">View your past orders and receipts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Filter by Date
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="pickup">Pickup</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <CardDescription>
                        {order.date} at {order.time}
                      </CardDescription>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {order.type}
                      </Badge>
                      {order.rated && (
                        <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {order.rating}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {order.items.map((item, index) => (
                        <span key={index} className="text-sm">
                          {item.quantity}x {item.name}
                          {index < order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {order.items.reduce((total, item) => total + item.quantity, 0)} items
                      </span>
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openOrderDetailsDialog(order)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>

                  <Button variant="outline" size="sm">
                    <Link href={`#receipt-${order.id}`} className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Receipt
                    </Link>
                  </Button>

                  {!order.rated && (
                    <Button variant="outline" size="sm" onClick={() => openReviewDialog(order)}>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Rate Order
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                <p className="text-gray-500 text-center mt-1">
                  {searchTerm ? `No orders matching "${searchTerm}" were found.` : "You haven't placed any orders yet."}
                </p>
                {searchTerm && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
                {!searchTerm && (
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/delivery">Order Now</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          {filteredOrders.filter((order) => order.type === "delivery").length > 0 ? (
            filteredOrders
              .filter((order) => order.type === "delivery")
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <CardDescription>
                          {order.date} at {order.time}
                        </CardDescription>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-2">
                        <Badge variant="outline">Delivery</Badge>
                        {order.rated && (
                          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {order.rating}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, index) => (
                          <span key={index} className="text-sm">
                            {item.quantity}x {item.name}
                            {index < order.items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {order.items.reduce((total, item) => total + item.quantity, 0)} items
                        </span>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openOrderDetailsDialog(order)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>

                    <Button variant="outline" size="sm">
                      <Link href={`#receipt-${order.id}`} className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Link>
                    </Button>

                    {!order.rated && (
                      <Button variant="outline" size="sm" onClick={() => openReviewDialog(order)}>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Rate Order
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Delivery Orders Found</h3>
                <p className="text-gray-500 text-center mt-1">
                  {searchTerm
                    ? `No delivery orders matching "${searchTerm}" were found.`
                    : "You haven't placed any delivery orders yet."}
                </p>
                {searchTerm && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
                {!searchTerm && (
                  <Button className="mt-4" asChild>
                    <Link href="/delivery">Order Delivery</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pickup" className="space-y-4">
          {filteredOrders.filter((order) => order.type === "pickup").length > 0 ? (
            filteredOrders
              .filter((order) => order.type === "pickup")
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <CardDescription>
                          {order.date} at {order.time}
                        </CardDescription>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-2">
                        <Badge variant="outline">Pickup</Badge>
                        {order.rated && (
                          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {order.rating}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, index) => (
                          <span key={index} className="text-sm">
                            {item.quantity}x {item.name}
                            {index < order.items.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {order.items.reduce((total, item) => total + item.quantity, 0)} items
                        </span>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openOrderDetailsDialog(order)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>

                    <Button variant="outline" size="sm">
                      <Link href={`#receipt-${order.id}`} className="flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Link>
                    </Button>

                    {!order.rated && (
                      <Button variant="outline" size="sm" onClick={() => openReviewDialog(order)}>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Rate Order
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Pickup Orders Found</h3>
                <p className="text-gray-500 text-center mt-1">
                  {searchTerm
                    ? `No pickup orders matching "${searchTerm}" were found.`
                    : "You haven't placed any pickup orders yet."}
                </p>
                {searchTerm && (
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
                {!searchTerm && (
                  <Button className="mt-4" asChild>
                    <Link href="/delivery">Order Pickup</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Order</DialogTitle>
            <DialogDescription>Share your experience with order {selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star className={`h-8 w-8 ${star <= rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Your Review (Optional)</Label>
              <Textarea
                id="review"
                placeholder="Tell us about your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} className="bg-blue-600 hover:bg-blue-700 text-white">
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsDialogOpen} onOpenChange={setIsOrderDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order {selectedOrderForDetails?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrderForDetails && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Order Items</h4>
                <ul className="space-y-2">
                  {selectedOrderForDetails.items.map((item, index) => (
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
                  {selectedOrderForDetails.type === "delivery" ? "Delivery Information" : "Pickup Information"}
                </h4>
                {selectedOrderForDetails.type === "delivery" ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>{selectedOrderForDetails.address}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span>{selectedOrderForDetails.pickupLocation}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(selectedOrderForDetails.total * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(selectedOrderForDetails.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${selectedOrderForDetails.total.toFixed(2)}</span>
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
