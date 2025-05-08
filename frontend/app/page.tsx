"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, X, ArrowRight, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AIAssistant } from "@/components/ai-assistant"

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("Vietnam")
  const [currentSection, setCurrentSection] = useState(0)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)

  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  // Define sections for navigation
  const sections = ["home", "about", "concept", "locations", "restaurant", "menu", "gallery", "contact"]

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

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index]
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      {/* Loading overlay */}
      <div
        id="loading"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500"
      >
        <div className="text-4xl font-light">Loading...</div>
      </div>

      <div className="relative">
        {/* Navigation dots */}
        <div className="fixed right-6 top-1/2 z-30 -translate-y-1/2 space-y-3">
          {sections.map((_, index) => (
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
              PIZZA LIÊM KHIẾT&apos;S
            </Link>
            <span className="text-sm font-light">VIETNAM</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-light">
              <Link href="/reservation" className="hover:underline">
                RESERVATION
              </Link>
              <Link href="/delivery" className="hover:underline">
                DELIVERY
              </Link>
              <Link href="#" className="hover:underline">
                CAREER
              </Link>
              <Link href="/login" className="hover:underline">
                LOGIN
              </Link>
              <div className="flex items-center gap-1">
                <span>EN</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </nav>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/20 backdrop-blur-sm"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <div className="space-y-1.5">
                  <div className="h-0.5 w-5 bg-white"></div>
                  <div className="h-0.5 w-5 bg-white"></div>
                  <div className="h-0.5 w-5 bg-white"></div>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm transition-all">
            <div className="flex h-full flex-col items-center justify-center gap-8 text-white">
              <Link
                href="/reservation"
                className="text-2xl font-light hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                RESERVATION
              </Link>
              <Link href="/delivery" className="text-2xl font-light hover:underline" onClick={() => setMenuOpen(false)}>
                DELIVERY
              </Link>
              <Link href="#" className="text-2xl font-light hover:underline" onClick={() => setMenuOpen(false)}>
                CAREER
              </Link>
              <Link href="/login" className="text-2xl font-light hover:underline" onClick={() => setMenuOpen(false)}>
                LOGIN
              </Link>
              <div className="flex items-center gap-2 text-2xl font-light">
                <span>EN</span>
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Main content - now scrollable */}
        <main className="relative z-10">
          {/* Home Section */}
          <section
            ref={(el) => (sectionRefs.current[0] = el)}
            id="home"
            className="relative min-h-screen flex flex-col justify-end"
          >
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <Image src="/vietnam-street.png" alt="Vietnam street scene" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="relative z-10 px-6 pb-20 md:px-12">
              {/* Country navigation */}
              <div className="mb-8 flex flex-col gap-2 text-white">
                {["Japan", "Vietnam", "Cambodia", "Indonesia"].map((country) => (
                  <button
                    key={country}
                    className={`text-left text-4xl font-light transition-all hover:translate-x-2 md:text-6xl ${
                      selectedCountry === country ? "text-white" : "text-white/50"
                    }`}
                    onClick={() => setSelectedCountry(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>

              {/* WOW!!! section */}
              <div className="ml-auto max-w-xs rounded-lg bg-blue-600 p-4 text-white md:max-w-sm">
                <div className="text-3xl font-bold">WOW!!!</div>
                <p className="text-sm">"WOW" is the highest satisfaction score received from all shops.</p>
                <div className="mt-1 text-xs">Since 2011~</div>
                <button className="mt-2 text-xs underline">Learn more</button>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section
            ref={(el) => (sectionRefs.current[1] = el)}
            id="about"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=About"
                alt="About background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl">
                <h2 className="text-5xl font-light mb-8">Our Story</h2>
                <p className="text-xl font-light mb-6">
                  Pizza 4P's began with a simple dream: to deliver happiness through pizza. What started as a backyard
                  pizza oven has grown into a beloved restaurant chain.
                </p>
                <p className="text-xl font-light mb-10">
                  Our name stands for "Platform of Personal Pizza for Peace" - reflecting our mission to create
                  connections between people through the universal language of food.
                </p>

                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </section>

          {/* Concept Section */}
          <section
            ref={(el) => (sectionRefs.current[2] = el)}
            id="concept"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=Farm+to+Table"
                alt="Farm to Table concept"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl ml-auto">
                <h2 className="text-5xl font-light mb-8">Farm to Table</h2>
                <p className="text-xl font-light mb-6">
                  We believe in the "Farm to Table" concept, ensuring that we use only the freshest ingredients. Many of
                  our ingredients are grown on our own farms, including our signature cheese which is made daily.
                </p>
                <p className="text-xl font-light mb-10">
                  This commitment to quality and sustainability is at the heart of everything we do, from our carefully
                  crafted pizzas to our thoughtfully designed restaurants.
                </p>

                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black group">
                  Discover Our Ingredients
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </section>

          {/* Locations Section */}
          <section
            ref={(el) => (sectionRefs.current[3] = el)}
            id="locations"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=Locations"
                alt="Locations background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <h2 className="text-5xl font-light mb-12">Our Locations</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { city: "Ho Chi Minh City", locations: 12 },
                  { city: "Hanoi", locations: 5 },
                  { city: "Da Nang", locations: 2 },
                  { city: "Nha Trang", locations: 1 },
                  { city: "Phu Quoc", locations: 1 },
                ].map((region, index) => (
                  <div
                    key={index}
                    className="border border-white/30 p-6 backdrop-blur-sm bg-black/20 hover:bg-black/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-6 w-6 mt-1" />
                      <div>
                        <h3 className="text-2xl font-light">{region.city}</h3>
                        <p className="text-white/70 mt-2">{region.locations} locations</p>
                        <Button variant="link" className="text-white p-0 mt-4 group">
                          View All
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Restaurant Section */}
          <section
            ref={(el) => (sectionRefs.current[4] = el)}
            id="restaurant"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=Our+Restaurant"
                alt="Restaurant interior"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl">
                <h2 className="text-5xl font-light mb-8">Our Restaurant</h2>
                <p className="text-xl font-light mb-6">
                  Pizza Liêm Khiết is a Michelin-starred restaurant dedicated to the art of pizza making. Our commitment
                  to quality and excellence has earned us recognition as one of the finest dining establishments in
                  Vietnam.
                </p>
                <p className="text-xl font-light mb-10">
                  Our mission is to create unforgettable dining experiences through innovative cuisine, exceptional
                  service, and a warm, inviting atmosphere. We believe that food is not just sustenance, but an art form
                  that brings people together.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                    <h3 className="text-2xl font-light mb-4">Our Vision</h3>
                    <p>
                      To redefine the art of pizza making and elevate it to the highest standards of culinary
                      excellence.
                    </p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                    <h3 className="text-2xl font-light mb-4">Our Values</h3>
                    <p>Quality, innovation, sustainability, and creating meaningful connections through food.</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                    <h3 className="text-2xl font-light mb-4">Our Promise</h3>
                    <p>An extraordinary dining experience that delights all senses and exceeds expectations.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section
            ref={(el) => (sectionRefs.current[5] = el)}
            id="menu"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=Our+Menu"
                alt="Menu background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-light mb-4">Featured Menu</h2>
                <div className="w-20 h-1 bg-white/50 mx-auto mb-6"></div>
                <p className="text-xl font-light max-w-2xl mx-auto">
                  Discover our chef's selection of signature dishes, crafted with the finest ingredients and culinary
                  expertise.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                {[
                  {
                    name: "Tartufo Nero",
                    description: "Truffle cream, mozzarella, wild mushrooms, arugula, shaved black truffle",
                    price: 28,
                    image: "/placeholder.svg?height=400&width=400&text=Tartufo+Nero",
                    category: "Signature Pizzas",
                  },
                  {
                    name: "Margherita Elegante",
                    description: "San Marzano tomato sauce, buffalo mozzarella, fresh basil, extra virgin olive oil",
                    price: 18,
                    image: "/placeholder.svg?height=400&width=400&text=Margherita+Elegante",
                    category: "Classic Pizzas",
                  },
                  {
                    name: "Frutti di Mare",
                    description: "Tomato sauce, mozzarella, fresh seafood medley, lemon zest, parsley, garlic oil",
                    price: 30,
                    image: "/placeholder.svg?height=400&width=400&text=Frutti+di+Mare",
                    category: "Signature Pizzas",
                  },
                  {
                    name: "Tagliatelle al Tartufo",
                    description: "House-made tagliatelle, butter, parmigiano, fresh black truffle",
                    price: 28,
                    image: "/placeholder.svg?height=400&width=400&text=Tagliatelle+Tartufo",
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
                        <span className="text-2xl font-light">${item.price}</span>
                        <Link
                          href="/delivery"
                          className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-sm"
                        >
                          Order Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/delivery"
                  className="inline-flex items-center border border-white px-6 py-3 rounded-full text-lg font-light hover:bg-white/10 transition-all"
                >
                  View Full Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section
            ref={(el) => (sectionRefs.current[6] = el)}
            id="gallery"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=Gallery"
                alt="Gallery background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/70" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-light mb-4">Gallery</h2>
                <div className="w-20 h-1 bg-white/50 mx-auto mb-6"></div>
                <p className="text-xl font-light max-w-2xl mx-auto">
                  Experience the ambiance and artistry of Pizza Liêm Khiết through our gallery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { src: "/placeholder.svg?height=600&width=600&text=Restaurant+Interior", alt: "Restaurant Interior" },
                  {
                    src: "/placeholder.svg?height=600&width=600&text=Chef+Preparing+Pizza",
                    alt: "Chef Preparing Pizza",
                  },
                  { src: "/placeholder.svg?height=600&width=600&text=Wood+Fired+Oven", alt: "Wood Fired Oven" },
                  { src: "/placeholder.svg?height=600&width=600&text=Dining+Experience", alt: "Dining Experience" },
                  { src: "/placeholder.svg?height=600&width=600&text=Signature+Dish", alt: "Signature Dish" },
                  { src: "/placeholder.svg?height=600&width=600&text=Wine+Selection", alt: "Wine Selection" },
                ].map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg group">
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-light text-lg">{image.alt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section
            ref={(el) => (sectionRefs.current[7] = el)}
            id="contact"
            className="relative min-h-screen flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=1080&width=1920&text=Contact"
                alt="Contact background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20 text-white">
              <div className="max-w-3xl">
                <h2 className="text-5xl font-light mb-8">Get in Touch</h2>

                <div className="grid gap-8 mb-12">
                  <div>
                    <h3 className="text-2xl font-light mb-2">General Inquiries</h3>
                    <p className="text-white/70">info@pizza4ps.com</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-light mb-2">Careers</h3>
                    <p className="text-white/70">careers@pizza4ps.com</p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-light mb-2">Press</h3>
                    <p className="text-white/70">press@pizza4ps.com</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                    <Instagram className="mr-2 h-5 w-5" />
                    Instagram
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                    <Facebook className="mr-2 h-5 w-5" />
                    Facebook
                  </Button>
                </div>
              </div>
            </div>

            <footer className="absolute bottom-0 left-0 right-0 border-t border-white/20 py-4 text-white/60 text-center text-sm backdrop-blur-sm bg-black/20">
              <div className="container mx-auto">© 2023 Pizza 4P's. All rights reserved.</div>
            </footer>
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
