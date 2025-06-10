"use client"

import React, { useState, useEffect } from 'react';
import { useGetActiveMenuItemsQuery } from '@/redux/api/menuItems';
import { useGetActiveCategoriesQuery } from '@/redux/api/categoryApi';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from "@/lib/formatCurrency";
import { getTranslation } from '@/utils/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FiSearch } from 'react-icons/fi';

const MenuPage = () => {
  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<"en" | "vi">("en");

  // Fetch data using RTK Query
  const { data: menuItemsData, isLoading: menuLoading, error: menuError } = useGetActiveMenuItemsQuery();
  const { data: categoriesData, isLoading: categoryLoading } = useGetActiveCategoriesQuery();

  // Get language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null;
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = getTranslation(language);

  // Filter menu items based on category and search
  const filteredMenuItems = React.useMemo(() => {
    if (!menuItemsData) return [];

    let filtered = menuItemsData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [menuItemsData, selectedCategory, searchQuery]);

  if (menuLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error loading menu items. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <Image
          src="/images/meal.jpg"
          alt="Menu Banner" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white container mx-auto px-6">
          <Link href="/" className="absolute left-6 top-8 text-white hover:text-white/80 transition-colors flex items-center font-light">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {language === "en" ? "Back to Home" : "Trở về Trang chủ"}
          </Link>
          <h1 className="text-6xl font-light mb-4">{t.menu.title}</h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
          <p className="text-xl font-light max-w-2xl">{t.menu.description}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-6 -mt-12 relative z-10 pb-8">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input 
              type="text"
              placeholder={language === "en" ? "Search for dishes..." : "Tìm kiếm món ăn..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 text-white border-white/20 focus:border-white/40"
            />
          </div>

          <Tabs 
            defaultValue="all" 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-white/10 w-full overflow-x-auto flex-wrap">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
                Tất cả
              </TabsTrigger>
              {categoriesData?.categories.map((category) => (
                <TabsTrigger 
                  key={category._id} 
                  value={category._id}
                  className="data-[state=active]:bg-white/20"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-6 py-12 text-white">
        {filteredMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        {item.discountPercentage}% {language === "en" ? "OFF" : "GIẢM"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-sm text-blue-300 mb-2">
                    {categoriesData?.categories.find(cat => cat._id === item.categoryId)?.name || 'Uncategorized'}
                  </div>
                  <h3 className="text-2xl font-light mb-2">{item.title}</h3>
                  <p className="text-white/70 mb-4 flex-1">{item.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      {item.discountPercentage > 0 ? (
                        <>
                          <span className="text-2xl font-light">{formatCurrency(item.price * (1 - item.discountPercentage / 100))}</span>
                          <span className="ml-2 text-sm text-gray-400 line-through">{formatCurrency(item.price)}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-light">{formatCurrency(item.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-light mb-4">{language === "en" ? "No matching items found" : "Không tìm thấy món ăn phù hợp"}</h3>
            <p className="text-white/70 mb-6">{language === "en" ? "Please try a different search term or browse all menu items." : "Vui lòng thử từ khóa khác hoặc xem tất cả các món."}</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
            }}>
              {language === "en" ? "View All Menu Items" : "Xem tất cả món ăn"}
            </Button>
          </div>
        )}
      </div>

      {/* Dietary Information */}
      <div className="bg-white/5 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6 text-white text-center">
          <h3 className="text-2xl font-light mb-6">{language === "en" ? "Dietary Information" : "Thông tin dinh dưỡng"}</h3>
          <p className="text-white/70 mb-4 max-w-3xl mx-auto">{language === "en" ? "We offer vegan, gluten-free options and many dishes suitable for various dietary needs." : "Chúng tôi cung cấp các lựa chọn thuần chay, không chứa gluten và nhiều món ăn phù hợp với các nhu cầu dinh dưỡng khác nhau."}</p>
          <p className="text-white/70 mb-4 max-w-3xl mx-auto">{language === "en" ? "Please inform our staff about any allergies or special requirements." : "Vui lòng thông báo cho nhân viên của chúng tôi về bất kỳ dị ứng hoặc yêu cầu đặc biệt nào."}</p>
          <Button variant="link" className="text-blue-300 hover:text-blue-400">
            {language === "en" ? "Contact for more information" : "Liên hệ để biết thêm thông tin"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-6 text-white/50 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">{language === "en" ? "© 2025 Golden Crust. All rights reserved." : "© 2025 Golden Crust. Bản quyền thuộc về chúng tôi."}</p>
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            {language === "en" ? "Back to Home" : "Trở về Trang chủ"}
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default MenuPage;
