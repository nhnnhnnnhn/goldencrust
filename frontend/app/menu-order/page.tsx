"use client"

import React, { useState, useEffect } from 'react';
import { useGetMenuItemsQuery } from '@/redux/api/menuItems';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Trash2, Receipt, Utensils, Package } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FiSearch } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useGetTodayOrdersQuery } from '@/redux/api/order';

// Types
interface MenuItem {
  _id: string;
  title: string;
  description?: string;
  price: number;
  thumbnail: string;
  categoryId: string;
  discountPercentage: number;
  deleted?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  confirmed?: boolean;
}

const MenuOrderPage = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Get parameters from URL
  const urlRestaurantId = searchParams.get('restaurantId');
  const urlOrderType = searchParams.get('orderType') as 'Dine-in' | 'Takeaway';
  const urlUserId = searchParams.get('userId');

  // States for menu display
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // States for order type modal
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<'initial' | 'dineInDetails' | 'confirmed'>('confirmed'); // Set to confirmed since we have the params
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | null>(urlOrderType?.toLowerCase() as 'dine-in' | 'takeaway' | null);
  const [restaurantId, setRestaurantId] = useState<string>(urlRestaurantId || '');
  const [userId, setUserId] = useState<string>(urlUserId || '');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [tableId, setTableId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');

  // States for cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
  const [hasActiveInvoice, setHasActiveInvoice] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  // Fetch data using RTK Query
  const { data: menuItemsData, isLoading: menuLoading, error: menuError } = useGetMenuItemsQuery();
  const { data: categoriesData, isLoading: categoryLoading } = useGetCategoriesQuery();
  const { refetch: refetchOrders } = useGetTodayOrdersQuery();

  // Load cart and order info from localStorage on initial render
  useEffect(() => {
    // Load cart items
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    
    // Check if there's an active invoice
    const activeInvoice = localStorage.getItem('currentInvoice');
    setHasActiveInvoice(!!activeInvoice);
    
    // Load order type information set by the dashboard
    const storedOrderType = localStorage.getItem('orderType');
    const storedRestaurantId = localStorage.getItem('restaurantId');
    const storedRestaurantName = localStorage.getItem('restaurantName');
    const storedTableId = localStorage.getItem('tableId');
    const storedTableNumber = localStorage.getItem('tableNumber');

    if (storedOrderType) {
      setOrderType(storedOrderType as 'dine-in' | 'takeaway');
    }

    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    }

    if (storedRestaurantName) {
      setRestaurantName(storedRestaurantName);
    }

    if (storedTableId) {
      setTableId(storedTableId);
    }

    if (storedTableNumber) {
      setTableNumber(storedTableNumber);
    }

    // If we have all order information, consider the order setup to be complete
    if (
      (storedOrderType === 'dine-in' && storedRestaurantName && storedTableNumber) ||
      (storedOrderType === 'takeaway')
    ) {
      setOrderStep('confirmed');
    }

    // Set order information from URL parameters
    if (urlRestaurantId && urlOrderType && urlUserId) {
      setRestaurantId(urlRestaurantId);
      setOrderType(urlOrderType.toLowerCase() as 'dine-in' | 'takeaway');
      setUserId(urlUserId);
      setOrderStep('confirmed');
    }
  }, [urlRestaurantId, urlOrderType, urlUserId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      // Clear localStorage if cart is empty
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);

  // Load order confirmed status from localStorage
  useEffect(() => {
    const orderConfirmed = localStorage.getItem('orderConfirmed');
    if (orderConfirmed === 'true') {
      setIsOrderConfirmed(true);
    }
  }, []);

  // Save order confirmed status to localStorage whenever it changes
  useEffect(() => {
    if (isOrderConfirmed) {
      localStorage.setItem('orderConfirmed', 'true');
    }
  }, [isOrderConfirmed]);

  const t = (key: string) => {
    const translations: { [k: string]: { en: string, vi: string } } = {
      backToHome: { en: "Back to Home", vi: "Trở về Trang chủ" },
      fullMenu: { en: "Full Menu", vi: "Thực đơn đầy đủ" },
      confirmOrder: { en: "Confirm Order", vi: "Xác nhận gọi món" },
      orderConfirmation: { en: "Order Confirmed", vi: "Đã xác nhận gọi món" },
      continueOrdering: { en: "Continue Ordering", vi: "Tiếp tục gọi món" },
      proceedToPayment: { en: "Proceed to Payment", vi: "Tiến hành thanh toán" },
      yourOrderIsConfirmed: { en: "Your order is confirmed", vi: "Đơn của bạn đã được xác nhận" },
      cartTitle: { en: "Your Cart", vi: "Giỏ hàng của bạn" },
      itemsInYourCart: { en: "Items in your cart", vi: "Các món trong giỏ hàng" },
      confirmOrderPrompt: { en: "Please confirm your order", vi: "Vui lòng xác nhận đơn hàng" },
      cancel: { en: "Cancel", vi: "Hủy" },
      confirmedItem: { en: "Confirmed", vi: "Đã xác nhận" },
      unconfirmedItem: { en: "Not confirmed", vi: "Chưa xác nhận" },
      noNewItemsToConfirm: { en: "No new items to confirm", vi: "Không có món mới để xác nhận" },
      newOrder: { en: "New Order", vi: "Gọi món mới" },
      confirmedItems: { en: "Confirmed Items", vi: "Món đã gọi" },
      cannotRemoveConfirmedItem: { en: "Cannot remove confirmed item", vi: "Không thể xóa món đã xác nhận" },
      exploreMenu: { en: "Explore our diverse menu featuring dishes prepared with the freshest ingredients.", vi: "Khám phá thực đơn đa dạng với các món ăn của chúng tôi được chuẩn bị từ những nguyên liệu tươi ngon nhất." },
      searchDishes: { en: "Search for dishes...", vi: "Tìm kiếm món ăn..." },
      all: { en: "All", vi: "Tất cả" },
      addToCart: { en: "Add to Cart", vi: "Thêm vào giỏ" },
      noMatchingItems: { en: "No matching items found", vi: "Không tìm thấy món nào khớp" },
      tryDifferentSearch: { en: "Please try a different search term or browse all menu items.", vi: "Vui lòng thử một cụm từ tìm kiếm khác hoặc duyệt tất cả các mục menu." },
      viewAllMenuItems: { en: "View All Menu Items", vi: "Xem tất cả các mục menu" },
      createNewOrder: { en: "Create New Order", vi: "Tạo đơn hàng mới" },
      howWouldYouLikeToOrder: { en: "How would you like to order?", vi: "Bạn muốn đặt hàng như thế nào?" },
      dineIn: { en: "Dine-in", vi: "Ăn tại chỗ" },
      takeaway: { en: "Takeaway", vi: "Mang đi" },
      restaurantNameLabel: { en: "Restaurant Name", vi: "Tên nhà hàng" },
      tableNumberLabel: { en: "Table Number", vi: "Số bàn" },
      confirmOrderDetails: { en: "Confirm Details", vi: "Xác nhận chi tiết" },
      startOrder: { en: "Start Order", vi: "Bắt đầu đặt hàng" },
      pleaseSelectOrderType: { en: "Please select an order type.", vi: "Vui lòng chọn loại hình đặt hàng." },
      pleaseEnterRestaurantName: { en: "Please enter the restaurant name.", vi: "Vui lòng nhập tên nhà hàng." },
      pleaseEnterTableNumber: { en: "Please enter your table number.", vi: "Vui lòng nhập số bàn của bạn." },
      emptyCart: { en: "Your cart is empty.", vi: "Giỏ hàng của bạn đang trống." },
      total: { en: "Total", vi: "Tổng cộng" },
      checkout: { en: "Proceed to Checkout", vi: "Tiến hành thanh toán" },
      removeItem: { en: "Remove", vi: "Xóa" },
      quantity: { en: "Qty", vi: "SL" },
      viewCart: { en: "View Cart", vi: "Xem giỏ hàng" },
      orderSuccess: { en: "Order Confirmed!", vi: "Xác nhận đơn hàng!" },
      orderSavedMessage: { en: "Your order has been saved. You can proceed to payment after dining (for dine-in) or pick up your order (for takeaway).", vi: "Đơn hàng của bạn đã được lưu. Bạn có thể tiến hành thanh toán sau khi dùng bữa (đối với ăn tại chỗ) hoặc nhận đơn hàng (đối với mang đi)." },
      viewInvoice: { en: "View Invoice", vi: "Xem hóa đơn" },
      continueShopping: { en: "Continue Shopping", vi: "Tiếp tục mua sắm" },
    };
    return translations[key]?.en || key;
  };

  const handleOrderTypeSelection = () => {
    if (!orderType) {
      alert(t('pleaseSelectOrderType'));
      return;
    }
    if (orderType === 'dine-in') {
      setOrderStep('dineInDetails');
    } else {
      setOrderStep('confirmed');
      setIsOrderTypeModalOpen(false);
      console.log('Order Type:', orderType);
    }
  };

  const handleDineInDetailsSubmit = () => {
    if (!restaurantName.trim()) {
      alert(t('pleaseEnterRestaurantName'));
      return;
    }
    if (!tableNumber.trim()) {
      alert(t('pleaseEnterTableNumber'));
      return;
    }
    setOrderStep('confirmed');
    setIsOrderTypeModalOpen(false);
    console.log('Order Type:', orderType, 'Restaurant:', restaurantName, 'Table:', tableNumber);
  };

  const handleAddToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevItems.map(cartItem => 
          cartItem._id === item._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleConfirmOrder = async () => {
    try {
      // Validate cart items
      if (cartItems.length === 0) {
        alert(t('emptyCart'));
        return;
      }

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity * (1 - (item.discountPercentage || 0) / 100)
      }));

      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

      // Create order request
      const orderData = {
        userId,
        restaurantId,
        items: orderItems,
        orderType: orderType === 'dine-in' ? 'Dine-in' : 'Takeaway',
        totalAmount
      };

      // Make API call to create order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      // Clear cart after successful order
      setCartItems([]);
      localStorage.removeItem('cartItems');
      
      // Show success message
      alert(t('orderSuccess'));
      
      // Refetch orders to update the list
      await refetchOrders();
      
      // Redirect back to orders page
      router.push('/dashboard/orders');
      
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert(t('cartEmpty'));
      return;
    }

    if (!orderType) {
      setIsOrderTypeModalOpen(true);
      return;
    }

    // Create invoice data
    const cartTotal = cartItems.reduce((total, item) => {
      const discountPrice = item.price * (1 - item.discountPercentage / 100);
      return total + discountPrice * item.quantity;
    }, 0);

    const invoiceDetails = {
      id: uuidv4(),
      orderType,
      restaurantId: orderType === 'dine-in' ? restaurantId : undefined,
      restaurantName: orderType === 'dine-in' ? restaurantName : undefined,
      tableId: orderType === 'dine-in' ? tableId : undefined,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      items: cartItems,
      totalAmount: cartTotal,
      orderTimestamp: new Date().toISOString(),
      status: 'pending_payment' as const,
    };

    // Save invoice to localStorage
    localStorage.setItem('currentInvoice', JSON.stringify(invoiceDetails));
    setHasActiveInvoice(true);

    // Reset order confirmed status
    setIsOrderConfirmed(false);
    localStorage.removeItem('orderConfirmed');

    // Close cart modal if open
    setIsCartModalOpen(false);

    alert(`${t('orderSuccess')}\n${t('orderSavedMessage')}`);
    
    // Redirect to invoice page
    router.push('/invoice');
  };

  // Filter menu items based on category and search query
  const filteredMenuItems = menuItemsData ? menuItemsData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !item.deleted;
  }) : [];

  // Calculate cart metrics
  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const discountPrice = item.price * (1 - item.discountPercentage / 100);
    return total + discountPrice * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Order Type Info Bar - Show at the top if we have order type info */}
      {orderType && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-primary/90 text-white px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            {orderType === 'dine-in' ? (
              <>
                <Utensils className="h-4 w-4 mr-2" />
                <span>Dine-in at {restaurantName} - Table {tableNumber}</span>
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                <span>Takeaway</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Type Selection Dialog */}
      <Dialog open={isOrderTypeModalOpen} onOpenChange={setIsOrderTypeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            {orderStep === 'initial' && (
              <DialogDescription>How would you like to order?</DialogDescription>
            )}
            {orderStep === 'dineInDetails' && (
              <DialogDescription>Please enter restaurant and table details</DialogDescription>
            )}
          </DialogHeader>

          {orderStep === 'initial' && (
            <div className="grid gap-6 py-4">
              <RadioGroup value={orderType || ''} onValueChange={(value) => setOrderType(value as 'dine-in' | 'takeaway')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id="dine-in" />
                  <Label htmlFor="dine-in" className="text-base">Dine-in</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway" className="text-base">Takeaway</Label>
                </div>
              </RadioGroup>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOrderTypeModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleOrderTypeSelection} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue
                </Button>
              </DialogFooter>
            </div>
          )}

          {orderStep === 'dineInDetails' && (
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Golden Crust Downtown"
                  />
                </div>
                <div>
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. T12"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderStep('initial')}>
                  Back
                </Button>
                <Button 
                  onClick={handleDineInDetailsSubmit} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Order
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cart Dialog */}
      <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('yourCart')}</DialogTitle>
          </DialogHeader>
          
          {cartItems.length === 0 ? (
            <p className="text-center py-8 text-gray-400">{t('emptyCart')}</p>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-3 border-b border-gray-700">
                  <div className="flex items-center">
                    <Image src={item.thumbnail} alt={item.title} width={60} height={60} className="rounded object-cover" />
                    <div className="ml-4">
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">
                        {formatCurrency(item.price * (1 - item.discountPercentage / 100))}
                        {item.discountPercentage > 0 && (
                          <span className="ml-2 text-xs text-gray-400 line-through">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button size="icon" variant="ghost" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="h-8 w-8 hover:bg-gray-700">
                      -
                    </Button>
                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="h-8 w-8 hover:bg-gray-700">
                      +
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleRemoveFromCart(item._id)} className="h-8 w-8 ml-2 hover:bg-gray-700 text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {cartItems.length > 0 && (
            <DialogFooter className="mt-6 sm:justify-between items-center">
              <div className="text-xl font-semibold">
                {t('total')}: <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
              <Button onClick={handleProceedToCheckout} className="bg-primary hover:bg-primary/90 text-white">
                {t('checkout')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {(orderStep === 'confirmed' || orderType) && (
        <>
          {/* Hero Section - adjust padding-top when order type bar is present */}
          <div className={`relative h-[60vh] ${orderType ? 'pt-10' : ''}`}>
            <Image
              src="/images/meal.jpg"
              alt="Menu Banner" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white container mx-auto px-6">
              <Link href="/" className={`absolute left-6 ${orderType ? 'top-12' : 'top-8'} text-white hover:text-white/80 transition-colors flex items-center font-light`}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t('backToHome')}
              </Link>
              {hasActiveInvoice && (
                <Link href="/invoice" className={`absolute right-6 ${orderType ? 'top-12' : 'top-8'}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-white flex items-center">
                    <Receipt className="h-4 w-4 mr-2" />
                    {t('viewInvoice')}
                  </Button>
                </Link>
              )}
              <h1 className="text-4xl md:text-6xl font-light">{t('fullMenu')}</h1>
              <p className="text-lg md:text-xl font-light mt-4 max-w-2xl text-gray-300">
                {t('exploreMenu')}
              </p>
            </div>
          </div>

          {/* Menu Section */}
          <div className="container mx-auto px-6 py-12 -mt-12 relative z-10">
            {/* Search and filters */}
            <div className="mb-8">
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder={t('searchDishes')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                />
                <FiSearch className="absolute right-3 top-3 text-gray-400" />
              </div>

              <Tabs 
                defaultValue="all" 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                className="w-full"
              >
                <TabsList className="bg-white/10 p-1">
                  <TabsTrigger value="all" className="text-white data-[state=active]:bg-primary">
                    {t('all')}
                  </TabsTrigger>
                  {categoriesData && categoriesData.categories && categoriesData.categories.map(category => (
                    <TabsTrigger 
                      key={category._id} 
                      value={category._id}
                      className="text-white data-[state=active]:bg-primary"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Menu items grid */}
            {filteredMenuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredMenuItems.map((item) => (
                  <div 
                    key={item._id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.02] duration-300"
                  >
                    <div className="relative h-64">
                      <Image 
                        src={item.thumbnail} 
                        alt={item.title} 
                        fill 
                        className="object-cover" 
                      />
                      {item.discountPercentage > 0 && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                            {item.discountPercentage}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-sm text-blue-300 mb-2">
                        {categoriesData && categoriesData.categories ? 
                          categoriesData.categories.find(cat => cat._id === item.categoryId)?.name || 'Uncategorized'
                          : 'Uncategorized'}
                      </div>
                      <h3 className="text-2xl font-light mb-2 text-white">{item.title}</h3>
                      <p className="text-white/70 mb-4 flex-1">{item.description || ""}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          {item.discountPercentage > 0 ? (
                            <>
                              <span className="text-2xl font-light text-white">{formatCurrency(item.price * (1 - item.discountPercentage / 100))}</span>
                              <span className="ml-2 text-sm text-gray-400 line-through">{formatCurrency(item.price)}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-light text-white">{formatCurrency(item.price)}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-white/30 hover:bg-white/20 hover:text-white hover:border-white/50 flex items-center"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t('addToCart')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-light mb-4">{t('noMatchingItems')}</h3>
                <p className="text-white/70 mb-6">{t('tryDifferentSearch')}</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }} className="text-white border-white/30 hover:bg-white/20 hover:text-white">
                  {t('viewAllMenuItems')}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cart Summary / Floating Cart Button */}
      {!isOrderTypeModalOpen && orderStep === 'confirmed' && totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => setIsCartModalOpen(true)} 
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg flex items-center text-lg"
            size="lg"
          >
            <ShoppingCart className="h-6 w-6 mr-3" />
            {t('viewCart')} ({totalCartItems})
            <span className="ml-3 font-semibold">{formatCurrency(cartTotal)}</span>
          </Button>
        </div>
      )}

      {/* Order Confirmed Banner */}
      {isOrderConfirmed && (
        <div className="fixed top-14 left-0 right-0 z-30 bg-green-600/90 text-white px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Receipt className="h-4 w-4 mr-2" />
            <span>{t('yourOrderIsConfirmed')}</span>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black/95 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-light text-white">{t('cartTitle')}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('itemsInYourCart')}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className={`bg-white/10 rounded-lg p-4 flex justify-between ${item.confirmed ? 'border-l-4 border-green-500' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        {item.confirmed && (
                          <span className="text-xs bg-green-600/80 text-white px-2 py-0.5 rounded-full">
                            {t('confirmedItem')}
                          </span>
                        )}
                      </div>
                      <div className="text-white mt-1 text-sm">
                        {formatCurrency(item.price * (1 - item.discountPercentage / 100))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-gray-600"
                        onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        disabled={item.confirmed}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-gray-600"
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={item.confirmed}
                      >
                        +
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => handleRemoveFromCart(item._id)}
                        disabled={item.confirmed}
                        title={item.confirmed ? t('cannotRemoveConfirmedItem') : ''}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p>{t('cartEmpty')}</p>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-800 pt-4 mt-4">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>{t('total')}:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex space-x-3">
                {isOrderConfirmed ? (
                  <>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setIsCartModalOpen(false);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('newOrder')}
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleProceedToCheckout}
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      {t('proceedToPayment')}
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setIsConfirmOrderModalOpen(true)}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    {t('confirmOrder')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirm Order Modal */}
      <Dialog open={isConfirmOrderModalOpen} onOpenChange={setIsConfirmOrderModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-black/95 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-light text-white">{t('confirmOrder')}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('confirmOrderPrompt')}
            </DialogDescription>
          </DialogHeader>

          <div className="border-t border-gray-800 pt-4 space-y-6">
            <div className="max-h-[250px] overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between py-2">
                  <span className="text-white">{item.title} × {item.quantity}</span>
                  <span className="text-white">{formatCurrency(item.price * (1 - item.discountPercentage / 100) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-semibold text-lg border-t border-gray-800 pt-4">
              <span>{t('total')}:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <DialogFooter className="flex space-x-3 sm:space-x-3">
            <Button variant="outline" className="flex-1 border-gray-600" onClick={() => setIsConfirmOrderModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleConfirmOrder}>
              {t('confirmOrder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuOrderPage;