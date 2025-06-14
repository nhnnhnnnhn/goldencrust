"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronDown,
  X,
  ArrowRight,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  User,
  LogOut,
  PieChart,
  Users,
  CreditCard,
  History,
  Settings,
  ShoppingBag,
  CalendarDays,
  LayoutGrid,
  Award,
  Truck,
  MenuIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AIAssistant } from "@/components/ai-assistant"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Thêm import cho translations
import { getTranslation } from "@/utils/translations"
import { useGetRestaurantsQuery } from '@/redux/api'

// Define sections for navigation
const sections = ["home", "about", "concept", "locations", "restaurant", "menu", "gallery", "contact"] as const

export default function Home() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { data: restaurants = [] } = useGetRestaurantsQuery()

  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  // Thêm state language và hàm toggleLanguage
  const [language, setLanguage] = useState<"en" | "vi">("en")

  // Thêm biến t để lấy các chuỗi văn bản theo ngôn ngữ hiện tại
  const t = getTranslation(language)

  // Dashboard menu items based on user role
  // Cập nhật các userMenuItems và adminMenuItems để sử dụng chuỗi văn bản đa ngôn ngữ
  // Thay đổi userMenuItems
  const userMenuItems = [
    { label: t.dashboard.dashboard, href: "/dashboard", icon: <LayoutGrid className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.myOrders, href: "/dashboard/orders", icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
    {
      label: t.dashboard.myReservations,
      href: "/dashboard/reservations",
      icon: <CalendarDays className="mr-2 h-4 w-4" />,
    },
    { label: t.dashboard.myDelivery, href: "/dashboard/my-delivery", icon: <Truck className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.profile, href: "/dashboard/profile", icon: <User className="mr-2 h-4 w-4" /> },
  ]

  // Thay đổi adminMenuItems
  const adminMenuItems = [
    { label: t.dashboard.dashboard, href: "/dashboard", icon: <LayoutGrid className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.customers, href: "/dashboard/customers", icon: <Users className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.menu, href: "/dashboard/menu-management", icon: <MenuIcon className="mr-2 h-4 w-4" /> },
    {
      label: t.dashboard.reservations,
      href: "/dashboard/reservations",
      icon: <CalendarDays className="mr-2 h-4 w-4" />,
    },
    { label: t.dashboard.delivery, href: "/dashboard/delivery", icon: <Truck className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.statistics, href: "/dashboard/statistics", icon: <PieChart className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.table, href: "/dashboard/table-management", icon: <LayoutGrid className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.payment, href: "/dashboard/payment", icon: <CreditCard className="mr-2 h-4 w-4" /> },
    { label: t.dashboard.settings, href: "/dashboard/settings", icon: <Settings className="mr-2 h-4 w-4" /> },
  ]

  // Get menu items based on user role
  const getMenuItems = () => {
    if (!user) return []
    return user.role === "admin" ? adminMenuItems : userMenuItems
  }

  // Thêm hàm toggleLanguage sau hàm handleLogout

  useEffect(() => {
    // Simulate loading effect
    const timer = setTimeout(() => {
      document.getElementById("loading")?.classList.add("opacity-0")
      setTimeout(() => {
        document.getElementById("loading")?.classList.add("hidden")
      }, 500)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const pageTop = window.scrollY
      const pageBottom = pageTop + window.innerHeight
      const pageHeight = document.body.scrollHeight

      // Find the current section based on scroll position
      let newCurrentSection = 0
      sectionRefs.current.forEach((section, index) => {
        if (!section) return

        const sectionTop = section.offsetTop
        const sectionBottom = sectionTop + section.offsetHeight

        // If we're scrolled to the bottom of the page, highlight the last section
        if (pageBottom >= pageHeight - 10) {
          newCurrentSection = sectionRefs.current.length - 1
          return
        }

        // Check if the section is in view
        if (
          (sectionTop <= pageTop + 300 && sectionBottom > pageTop) ||
          (sectionTop >= pageTop && sectionTop < pageBottom - 300)
        ) {
          newCurrentSection = index
        }
      })

      setCurrentSection(newCurrentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add click outside handler for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the menu is open and the click is outside the menu and not on the menu button
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }

    // Add event listener when menu is open
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  // Thêm useEffect để lưu trữ và khôi phục ngôn ngữ đã chọn
  useEffect(() => {
    // Khôi phục ngôn ngữ đã chọn từ localStorage khi trang được tải
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  // Cập nhật hàm toggleLanguage để lưu ngôn ngữ đã chọn vào localStorage
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "vi" : "en"
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index]
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      })
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
  }

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el
  }, [])

  return (
    <>
      {/* Loading overlay */}
      <div
        id="loading"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500"
      >
        {/* Thay đổi text trong loading overlay */}
        <div className="text-4xl font-light">{t.home.loading}</div>
      </div>

      <div className="relative">
        {/* Navigation dots */}
        <div className="fixed right-6 top-1/2 z-30 -translate-y-1/2 space-y-3">
          {sections.map((section: string, index: number) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={`block h-3 w-3 rounded-full border border-white transition-all ${
                currentSection === index ? "bg-white" : "bg-transparent"
              }`}
              aria-label={`Go to section ${index + 1}`}
            />
          ))}
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-8 text-white md:px-12">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-light uppercase tracking-wider">
              GOLDEN CRUST
            </Link>
            <span className="text-sm font-light">VIETNAM</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-light">
              {/* Thay đổi các liên kết trong header */}
              <Link href="/reservation" className="hover:underline">
                {t.navigation.reservation}
              </Link>
              <Link href="/delivery" className="hover:underline">
                {t.navigation.delivery}
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-sm font-light hover:underline focus:outline-none">{user.name}</button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {getMenuItems().map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center cursor-pointer">
                          {item.icon}
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {/* Thay đổi text trong dropdown menu */}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.navigation.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Thay đổi text trong login link */}
                  <Link href="/login" className="hover:underline">
                    {t.navigation.login}
                  </Link>
                  <Link href="/register" className="hover:underline">
                    {t.navigation.register || "Register"}
                  </Link>
                </div>
              )}

              {/* Thay đổi phần hiển thị nút chuyển đổi ngôn ngữ trong phần header */}
              {/* Tìm đoạn code: */}
              {/* <div className="flex items-center gap-1">
                <span>EN</span>
                <ChevronDown className="h-4 w-4" />
              </div> */}

              {/* Thay thế bằng: */}
              <button onClick={toggleLanguage} className="flex items-center gap-1 hover:underline">
                <span>{language === "en" ? "EN" : "VI"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </nav>
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/20 backdrop-blur-sm"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <div className="space-y-1.5">
                <div className="h-0.5 w-5 bg-white"></div>
                <div className="h-0.5 w-5 bg-white"></div>
                <div className="h-0.5 w-5 bg-white"></div>
              </div>
            </button>
          </div>
        </header>

        {/* Mobile menu */}
        {menuOpen && (
          <div ref={menuRef} className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm transition-all">
            {/* Close button - explicitly added and positioned */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-8 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/20 backdrop-blur-sm"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            <div className="flex h-full flex-col items-center justify-center gap-8 text-white">
              {/* Thay đổi các liên kết trong mobile menu */}
              <Link
                href="/reservation"
                className="text-2xl font-light hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                {t.navigation.reservation}
              </Link>
              <Link href="/delivery" className="text-2xl font-light hover:underline" onClick={() => setMenuOpen(false)}>
                {t.navigation.delivery}
              </Link>


              {user ? (
                <>
                  <div className="flex flex-col items-center gap-4 max-h-[50vh] overflow-y-auto py-4">
                    {getMenuItems().map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 text-xl font-light hover:underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  {/* Thay đổi text trong logout button trong mobile menu */}
                  <button
                    onClick={() => {
                      handleLogout()
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-2 text-xl font-light text-red-400 hover:underline mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    {t.navigation.logout}
                  </button>
                </>
              ) : (
                <>
                  {/* Thay đổi text trong login link trong mobile menu */}
                  <Link
                    href="/login"
                    className="text-2xl font-light hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    LOGIN/REGISTER
                  </Link>
                </>
              )}

              {/* Thay đổi phần hiển thị nút chuyển đổi ngôn ngữ trong menu mobile */}
              {/* Tìm đoạn code: */}
              {/* <div className="flex items-center gap-2 text-2xl font-light">
                <span>EN</span>
                <ChevronDown className="h-5 w-5" />
              </div> */}

              {/* Thay thế bằng: */}
              <button onClick={toggleLanguage} className="flex items-center gap-2 text-2xl font-light hover:underline">
                <span>{language === "en" ? "EN" : "VI"}</span>
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main content - now scrollable */}
        <main className="relative z-10">
          {/* Home Section */}
          <section
            ref={setRef(0)}
            id="home"
            className="relative min-h-screen flex flex-col justify-end"
          >
            {/* Background video */}
            <div className="absolute inset-0 z-0">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/videos/demo.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </section>

          {/* About Section */}
          <section
            ref={setRef(1)}
            id="about"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/shutterstock_1218150229.jpg"
                alt="About background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl">
                {/* Thay đổi text trong about section */}
                <h2 className="text-5xl font-light mb-8">{t.about.title}</h2>
                <p className="text-xl font-light mb-6">{t.about.paragraph1}</p>
                <p className="text-xl font-light mb-10">{t.about.paragraph2}</p>
                <Link href="/our-story">
                  <Button
                    variant="outline"
                    className="border-white text-white bg-black/30 hover:bg-white hover:text-black group"
                  >
                    {t.about.learnMore}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Concept Section */}
          <section
            ref={setRef(2)}
            id="concept"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/143352-2.webp"
                alt="Farm to Table concept"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl ml-auto">
                {/* Thay đổi text trong concept section */}
                <h2 className="text-5xl font-light mb-8">{t.concept.title}</h2>
                <p className="text-xl font-light mb-6">{t.concept.paragraph1}</p>
                <p className="text-xl font-light mb-10">{t.concept.paragraph2}</p>
                <Link href="/farm-to-table">
                  <Button
                    variant="outline"
                    className="border-white text-white bg-black/30 hover:bg-white hover:text-black group"
                  >
                    {t.concept.discoverIngredients}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Locations Section */}
          <section
            ref={setRef(3)}
            id="locations"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/Hanoi.webp"
                alt="Locations background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <h2 className="text-5xl font-light mb-12">{t.locations.title}</h2>

              {restaurants.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl font-light">Loading restaurants...</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restaurants.map((restaurant) => (
                  <div
                      key={restaurant._id}
                    className="border border-white/30 p-6 backdrop-blur-sm bg-black/20 hover:bg-black/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-6 w-6 mt-1" />
                      <div>
                          <h3 className="text-2xl font-light">{restaurant.name}</h3>
                        <p className="text-white/70 mt-2">
                            {restaurant.address}
                          </p>
                          <p className="text-white/70">
                            {restaurant.phone}
                          </p>
                          <p className="text-white/70 mb-4">
                            {restaurant.email}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              restaurant.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {restaurant.status === 'open' ? t.locations.statusOpen : t.locations.statusClosed}
                            </span>
                            <span className="text-sm text-white/70">
                              {restaurant.tableNumber} {t.locations.tables}
                            </span>
                          </div>
                          <div className="mt-4">
                            <Link
                              href="/reservation"
                              className="inline-flex items-center text-sm text-white hover:text-white/80 transition-colors"
                            >
                              {t.locations.makeReservation}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </section>

          {/* Restaurant Section */}
          <section
            ref={setRef(4)}
            id="restaurant"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/atmosphere.jpg"
                alt="Restaurant interior"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl">
                {/* Thay đổi text trong restaurant section */}
                <h2 className="text-5xl font-light mb-8">{t.restaurant.title}</h2>
                <p className="text-xl font-light mb-6">{t.restaurant.paragraph1}</p>
                <p className="text-xl font-light mb-10">{t.restaurant.paragraph2}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                    {/* Thay đổi text trong restaurant features */}
                    <h3 className="text-2xl font-light mb-4">{t.restaurant.vision.title}</h3>
                    <p>{t.restaurant.vision.description}</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                    <h3 className="text-2xl font-light mb-4">{t.restaurant.values.title}</h3>
                    <p>{t.restaurant.values.description}</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                    <h3 className="text-2xl font-light mb-4">{t.restaurant.promise.title}</h3>
                    <p>{t.restaurant.promise.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section
            ref={setRef(5)}
            id="menu"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/meal.jpg"
                alt="Menu background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="text-center mb-16">
                {/* Thay đổi text trong menu section */}
                <h2 className="text-5xl font-light mb-4">{t.menu.title}</h2>
                <div className="w-20 h-1 bg-white/50 mx-auto mb-6"></div>
                <p className="text-xl font-light max-w-2xl mx-auto">{t.menu.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                {[
                  {
                    name: "Tartufo Nero",
                    description: "Truffle cream, mozzarella, wild mushrooms, arugula, shaved black truffle",
                    price: 280000,
                    image: "/images/nero.jpg",
                    category: "Signature Pizzas",
                  },
                  {
                    name: "Margherita Elegante",
                    description: "San Marzano tomato sauce, buffalo mozzarella, fresh basil, extra virgin olive oil",
                    price: 180000,
                    image: "/images/margherita.jpg",
                    category: "Classic Pizzas",
                  },
                  {
                    name: "Frutti di Mare",
                    description: "Tomato sauce, mozzarella, fresh seafood medley, lemon zest, parsley, garlic oil",
                    price: 300000,
                    image: "/images/frutti.jpg",
                    category: "Signature Pizzas",
                  },
                  {
                    name: "Tagliatelle al Tartufo",
                    description: "House-made tagliatelle, butter, parmigiano, fresh black truffle",
                    price: 280000,
                    image: "/images/tagliatelle.jpg",
                    category: "Pasta",
                  },
                ].map((item, index) => (
                  <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col">
                    <div className="relative h-64">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-sm text-blue-300 mb-2">{item.category}</div>
                      <h3 className="text-2xl font-light mb-2">{item.name}</h3>
                      <p className="text-white/70 mb-4 flex-1">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-light">{item.price.toLocaleString()} VND</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                {/* Thay đổi text trong view full menu button */}
                <Link
                  href="/menu"
                  className="inline-flex items-center border border-white px-6 py-3 rounded-full text-lg font-light bg-black/30 hover:bg-white/20 transition-all"
                >
                  {t.menu.viewFullMenu}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section
            ref={setRef(7)}
            id="contact"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/contact.jpg"
                alt="Contact background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl">
                {/* Thay đổi text trong contact section */}
                <h2 className="text-5xl font-light mb-8">{t.contact.title}</h2>

                <div className="grid gap-8 mb-12">
                  {/* Thay đổi text trong contact section */}
                  <h3 className="text-2xl font-light mb-2">{t.contact.generalInquiries}</h3>
                  <p className="text-white/70">info@goldencrust.com</p>

                  {/* Thay đổi text trong contact section */}
                  <h3 className="text-2xl font-light mb-2">{t.contact.careers}</h3>
                  <p className="text-white/70">careers@goldencrust.com</p>

                  {/* Thay đổi text trong contact section */}
                  <h3 className="text-2xl font-light mb-2">{t.contact.press}</h3>
                  <p className="text-white/70">press@goldencrust.com</p>
                </div>

                <div className="flex gap-6">
                  <Button
                    variant="outline"
                    className="border-white text-white bg-black/30 hover:bg-white hover:text-black"
                  >
                    <Instagram className="mr-2 h-5 w-5" />
                    {t.contact.instagram}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white bg-black/30 hover:bg-white hover:text-black"
                  >
                    <Facebook className="mr-2 h-5 w-5" />
                    {t.contact.facebook}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* AI Assistant Button */}
        <button
          onClick={() => setAiAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {/* AI Assistant Chat Window */}
        <AIAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
      </div>
    </>
  )
}
