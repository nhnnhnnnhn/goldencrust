"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Receipt, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// Types
interface CartItem {
  _id: string;
  title: string;
  description?: string;
  price: number;
  thumbnail: string;
  categoryId: string;
  discountPercentage: number;
  quantity: number;
}

interface InvoiceDetails {
  orderType: 'dine-in' | 'takeaway' | null;
  restaurantName?: string;
  tableNumber?: string;
  items: CartItem[];
  totalAmount: number;
  orderTimestamp: string;
  status: 'pending_payment' | 'paid' | 'pending_pickup';
}

const InvoicePage = () => {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  // Load invoice from localStorage
  useEffect(() => {
    const storedInvoice = localStorage.getItem('currentInvoice');
    if (storedInvoice) {
      setInvoice(JSON.parse(storedInvoice));
    }
  }, []);

  const handlePayNow = () => {
    // In a real app, this would be connected to a payment gateway
    // For now, we'll just simulate a successful payment after 2 seconds
    setIsPaymentDialogOpen(true);
    setTimeout(() => {
      if (invoice) {
        const paidInvoice = {
          ...invoice,
          status: 'paid' as const
        };
        setInvoice(paidInvoice);
        localStorage.setItem('currentInvoice', JSON.stringify(paidInvoice));
        setIsPaymentSuccessful(true);
      }
    }, 2000);
  };

  const handleContinueShopping = () => {
    setIsPaymentDialogOpen(false);
    if (isPaymentSuccessful) {
      // Clear the invoice from localStorage
      localStorage.removeItem('currentInvoice');
      router.push('/');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-3xl font-light mb-4">No Active Invoice</h1>
          <p className="text-gray-400 mb-6">You don't have any active invoices at the moment.</p>
          <Link href="/menu">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Browse Our Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-white hover:text-white/80 transition-colors font-light">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 text-white border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Invoice</CardTitle>
                  <CardDescription className="text-gray-400">
                    Order {invoice.orderTimestamp.substring(0, 10)}
                  </CardDescription>
                </div>
                <div className="bg-primary/20 px-4 py-2 rounded-md text-primary border border-primary/30">
                  {invoice.status === 'pending_payment' ? 'Pending Payment' : 
                   invoice.status === 'paid' ? 'Paid' : 'Pending Pickup'}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm uppercase text-gray-400 font-semibold mb-1">Order Type</h3>
                    <p className="text-lg capitalize">{invoice.orderType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase text-gray-400 font-semibold mb-1">Date & Time</h3>
                    <p className="text-lg">{formatDate(invoice.orderTimestamp)}</p>
                  </div>
                </div>

                {invoice.orderType === 'dine-in' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm uppercase text-gray-400 font-semibold mb-1">Restaurant</h3>
                      <p className="text-lg">{invoice.restaurantName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm uppercase text-gray-400 font-semibold mb-1">Table Number</h3>
                      <p className="text-lg">{invoice.tableNumber}</p>
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-700 my-4" />

                <h3 className="text-xl mb-4">Order Items</h3>
                <div className="space-y-3">
                  {invoice.items.map((item) => (
                    <div key={item._id} className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <div className="h-16 w-16 relative rounded overflow-hidden">
                          <Image 
                            src={item.thumbnail} 
                            alt={item.title} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * (1 - item.discountPercentage / 100) * item.quantity)}</p>
                        {item.discountPercentage > 0 && (
                          <p className="text-gray-400 text-xs">
                            {item.discountPercentage}% off
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col mt-6">
              <Separator className="bg-gray-700 mb-4" />
              <div className="w-full flex justify-between items-center">
                <div className="text-gray-400">
                  Total Amount ({invoice.items.reduce((total, item) => total + item.quantity, 0)} items)
                </div>
                <div className="text-2xl font-semibold">{formatCurrency(invoice.totalAmount)}</div>
              </div>
              
              <div className="mt-6 w-full">
                {invoice.status === 'pending_payment' ? (
                  <Button 
                    onClick={handlePayNow} 
                    className="bg-primary hover:bg-primary/90 text-white w-full"
                    size="lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Now
                  </Button>
                ) : (
                  <div className="bg-green-900/40 text-green-500 p-4 rounded-md text-center border border-green-800 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Payment Completed
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>{isPaymentSuccessful ? "Payment Successful!" : "Processing Payment..."}</DialogTitle>
            <DialogDescription>
              {isPaymentSuccessful 
                ? "Your order has been paid successfully." 
                : "Please wait while we process your payment..."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex justify-center">
            {isPaymentSuccessful ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            )}
          </div>

          <DialogFooter>
            {isPaymentSuccessful && (
              <Button onClick={handleContinueShopping} className="w-full bg-primary">
                Continue to Home Page
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicePage;
