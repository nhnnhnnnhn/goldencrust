"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Edit, X, RefreshCw, Phone, MapPin, Clock, Package, DollarSign, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGetAllDeliveriesByUserIdQuery, useEditDeliveryMutation, useUpdateDeliveryStatusMutation, useCreateDeliveryMutation } from "@/redux/api/deliveryApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface DeliveryItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  discountPercentage: number;
  total: number;
}

interface Delivery {
  _id: string;
  deliveryStatus: 'preparing' | 'on the way' | 'delivered' | 'cancelled';
  userId: string;
  customerName: string;
  items: DeliveryItem[];
  totalAmount: number;
  expectedDeliveryTime: Date;
  notes: string;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentMethod: 'cash on delivery' | 'online payment';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const statusColors = {
  preparing: 'bg-blue-100 text-blue-800',
  'on the way': 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const MyDelivery: React.FC = () => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isCannotCancelModalOpen, setIsCannotCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Delivery | null>(null);
  const [editForm, setEditForm] = useState({
    deliveryAddress: '',
    deliveryPhone: '',
    notes: '',
  });

  // Get user ID from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || '';

  // Debug logs
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User ID:', userId);
  }, [user, userId]);

  // Fetch deliveries using RTK Query
  const { data: deliveries = [], isLoading, error, refetch } = useGetAllDeliveriesByUserIdQuery(userId, {
    skip: !userId,
  });

  // Debug logs for deliveries
  useEffect(() => {
    console.log('Deliveries data:', deliveries);
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
  }, [deliveries, isLoading, error]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login...');
      router.push('/login');
    }
  }, [user, router]);

  // Mutations
  const [editDelivery] = useEditDeliveryMutation();
  const [updateDeliveryStatus] = useUpdateDeliveryStatusMutation();
  const [createDelivery] = useCreateDeliveryMutation();

  const canCancelOrder = (order: Delivery): boolean => {
    // Check if order is on the way
    if (order.deliveryStatus === 'on the way') {
      return false;
    }

    // Check if order is older than 30 minutes
    const orderTime = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDiff = (currentTime.getTime() - orderTime.getTime()) / (1000 * 60); // difference in minutes

    return timeDiff <= 30;
  };

  const handleEditDelivery = (order: Delivery) => {
    setSelectedOrder(order);
    setEditForm({
      deliveryAddress: order.deliveryAddress,
      deliveryPhone: order.deliveryPhone,
      notes: order.notes,
    });
    setIsEditModalOpen(true);
  };

  const handleCancelDelivery = (order: Delivery) => {
    if (!canCancelOrder(order)) {
      setSelectedOrder(order);
      setIsCannotCancelModalOpen(true);
      return;
    }
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  const handleReorderClick = (order: Delivery) => {
    setSelectedOrder(order);
    setIsReorderModalOpen(true);
  };

  const confirmCancelDelivery = async () => {
    if (selectedOrder) {
      try {
        await updateDeliveryStatus({
          id: selectedOrder._id,
          status: 'cancelled'
        }).unwrap();
        toast.success('Delivery cancelled successfully');
        refetch(); // Refresh the deliveries list
      } catch (error) {
        toast.error('Failed to cancel delivery');
        console.error('Error cancelling delivery:', error);
      }
      setIsCancelModalOpen(false);
    }
  };

  const confirmReorder = async () => {
    if (selectedOrder) {
      try {
        // Create a new order based on the cancelled/delivered one
        const { _id, createdAt, updatedAt, ...newDelivery } = selectedOrder;
        const deliveryToCreate = {
          ...newDelivery,
          deliveryStatus: 'preparing' as const,
          expectedDeliveryTime: new Date(Date.now() + 45 * 60000), // 45 minutes from now
        };

        await createDelivery(deliveryToCreate).unwrap();
        toast.success('Order recreated successfully');
        refetch(); // Refresh the deliveries list
      } catch (error) {
        toast.error('Failed to recreate order');
        console.error('Error recreating order:', error);
      }
      setIsReorderModalOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder) {
      try {
        await editDelivery({
          id: selectedOrder._id,
          delivery: editForm
        }).unwrap();
        
        // Enhanced success message
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Delivery Updated Successfully!</p>
            <p className="text-sm text-gray-600">
              Your delivery details have been updated. The delivery team will be notified of these changes.
            </p>
          </div>,
          {
            duration: 5000, // Show for 5 seconds
            position: "top-center",
            style: {
              background: "#f0fdf4",
              border: "1px solid #86efac",
              color: "#166534",
            },
          }
        );
        
        refetch(); // Refresh the deliveries list
      } catch (error) {
        toast.error(
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Failed to Update Delivery</p>
            <p className="text-sm text-gray-600">
              There was an error updating your delivery. Please try again.
            </p>
          </div>,
          {
            duration: 5000,
            position: "top-center",
            style: {
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            },
          }
        );
        console.error('Error updating delivery:', error);
      }
      setIsEditModalOpen(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (!user) {
    console.log('Rendering null because no user found');
    return null; // Don't render anything while redirecting
  }

  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003087]"></div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <X size={48} className="text-red-500 mb-4" />
        <p className="text-red-500 mb-2">Error loading deliveries</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#003087] text-white rounded-md hover:bg-[#002266]"
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log('Rendering main content with deliveries:', deliveries);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Deliveries</h2>
        <Link href="/delivery">
          <Button className="bg-blue-900 hover:bg-blue-800">
            <Plus className="mr-2 h-4 w-4" />
            New Delivery
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {deliveries && deliveries.length > 0 ? (
          deliveries.map((order) => (
            <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Order #{order._id.slice(-6)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[order.deliveryStatus]} px-3 py-1`}>
                      {order.deliveryStatus.toUpperCase()}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDelivery(order)}
                        className="h-8 px-2 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(order.deliveryStatus === 'cancelled' || order.deliveryStatus === 'delivered') ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorderClick(order)}
                          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelDelivery(order)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Order Time</h4>
                        <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Expected Delivery</h4>
                        <p className="text-sm">{new Date(order.expectedDeliveryTime).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-500">Items</h4>
                    </div>
                    <ScrollArea className="h-20">
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.menuItemName}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Delivery Address</h4>
                        <p className="text-sm">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p className="text-sm">{order.deliveryPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                      <p className="text-sm font-semibold">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No deliveries found</p>
            <p className="text-sm text-gray-400 mt-2">Start by creating a new delivery</p>
          </div>
        )}
      </div>

      {/* Edit Delivery Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery</DialogTitle>
            <DialogDescription>
              Make changes to your delivery details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  value={editForm.deliveryAddress}
                  onChange={(e) => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
                  placeholder="Enter delivery address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deliveryPhone">Phone Number</Label>
                <Input
                  id="deliveryPhone"
                  value={editForm.deliveryPhone}
                  onChange={(e) => setEditForm({ ...editForm, deliveryPhone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Delivery Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Enter any special instructions or notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Delivery Confirmation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Delivery</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this delivery? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              No, Keep It
            </Button>
            <Button 
              type="button" 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmCancelDelivery}
            >
              Yes, Cancel Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cannot Cancel Modal */}
      <Dialog open={isCannotCancelModalOpen} onOpenChange={setIsCannotCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cannot Cancel Delivery</DialogTitle>
            <DialogDescription>
              {selectedOrder?.deliveryStatus === 'on the way' 
                ? "Sorry, you cannot cancel this delivery as it is already on the way."
                : "Sorry, you cannot cancel this delivery as it has been more than 30 minutes since the order was placed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              className="bg-blue-900 hover:bg-blue-800"
              onClick={() => setIsCannotCancelModalOpen(false)}
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reorder Confirmation Modal */}
      <Dialog open={isReorderModalOpen} onOpenChange={setIsReorderModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reorder Delivery</DialogTitle>
            <DialogDescription>
              Would you like to place this order again? A new order will be created with the same items and delivery details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReorderModalOpen(false)}>
              No, Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmReorder}
            >
              Yes, Reorder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDelivery; 