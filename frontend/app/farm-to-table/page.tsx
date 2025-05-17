"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Leaf, Droplets, Wind, CheckCircle2, ArrowRight } from "lucide-react"
import { getTranslation } from "@/utils/translations"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FarmToTablePage() {
  const [activeTab, setActiveTab] = useState("ingredients")
  const [language, setLanguage] = useState<"en" | "vi">("en")

  // Get language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)

  // Partner farms
  const farms = [
    {
      name: "Red River Organic Farm",
      description: "An organic farm providing fresh vegetables and herbs grown without pesticides or chemical fertilizers.",
      location: "Bac Ninh, Vietnam",
      image: "/images/red-river-farm.jpg",
      products: ["Leafy Greens", "Herbs", "Tomatoes"]
    },
    {
      name: "My Khanh Orchard",
      description: "A family-owned orchard providing the freshest organic fruits, harvested at the perfect moment.",
      location: "Dong Thap, Vietnam",
      image: "/images/my-khanh-orchard.jpg",
      products: ["Berries", "Seasonal Fruits"]
    },
    {
      name: "Mountain Mist Dairy",
      description: "A sustainable dairy farm with happy cows producing high-quality milk for our artisanal cheeses.",
      location: "Lam Dong, Vietnam",
      image: "/images/mountain-dairy.jpg",
      products: ["Milk", "Cheese", "Butter"]
    },
    {
      name: "Ocean Harvest Seafood",
      description: "Responsible fishing operation providing sustainably sourced seafood for our specialty dishes.",
      location: "Nha Trang, Vietnam",
      image: "/images/ocean-harvest.jpg",
      products: ["Fish", "Shrimp", "Squid"]
    }
  ]

  // Quality ingredients
  const ingredients = [
    {
      name: "00 Italian Flour",
      origin: "Italy",
      description: "Ultra-fine flour specially imported from Italy, perfect for creating authentic Neapolitan pizza crusts with the perfect balance of crispness and chewiness.",
      image: "/images/italian-flour.jpg"
    },
    {
      name: "San Marzano Tomatoes",
      origin: "Italy",
      description: "Grown in the volcanic soil near Mount Vesuvius, these tomatoes have a perfect balance of sweetness and acidity that make our sauce exceptional.",
      image: "/images/san-marzano-tomatoes.jpg"
    },
    {
      name: "Buffalo Mozzarella",
      origin: "Local, artisanal production",
      description: "Creamy, fresh mozzarella made daily from the milk of water buffaloes raised in our partner farm in the highlands.",
      image: "/images/buffalo-mozzarella.jpg"
    },
    {
      name: "Extra Virgin Olive Oil",
      origin: "Sicily, Italy",
      description: "First cold-pressed extra virgin olive oil with fruity notes that enhance the flavors of our pizzas and pastas.",
      image: "/images/olive-oil.jpg"
    },
    {
      name: "Fresh Basil",
      origin: "Local organic farm",
      description: "Aromatic basil grown locally without pesticides, adding a fresh and herbaceous note to our dishes.",
      image: "/images/fresh-basil.jpg"
    },
    {
      name: "Artisanal Sausage",
      origin: "House-made",
      description: "Made in-house using traditional Italian recipes with locally sourced pork and our special blend of spices.",
      image: "/images/artisanal-sausage.jpg"
    }
  ]

  // Sustainability initiatives
  const sustainabilityInitiatives = [
    {
      title: "Zero Food Waste",
      description: "We compost all organic waste and have implemented portion control systems to minimize food waste. Excess prepared food is donated to local shelters.",
      icon: <Leaf className="h-8 w-8 text-green-400" />
    },
    {
      title: "Water Conservation",
      description: "Our kitchens use water-efficient fixtures and we collect rainwater for our herb garden. We've reduced water consumption by 30% in the last two years.",
      icon: <Droplets className="h-8 w-8 text-blue-400" />
    },
    {
      title: "Renewable Energy",
      description: "We've installed solar panels that provide 40% of our energy needs and use energy-efficient appliances throughout our restaurants.",
      icon: <Wind className="h-8 w-8 text-amber-400" />
    },
    {
      title: "Packaging Reduction",
      description: "All our takeout containers are compostable, and we've eliminated single-use plastics from our operations. Customers receive discounts for bringing their own containers.",
      icon: <CheckCircle2 className="h-8 w-8 text-emerald-400" />
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Back to Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center text-amber-300 hover:text-amber-200 transition-colors bg-black/50 px-4 py-2 rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
      
      {/* Hero Banner */}
      <div className="relative h-[60vh]">
        <Image
          src="/images/farm-vegetables.jpg"
          alt="Farm to Table" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white container mx-auto px-6">
          <h1 className="text-6xl font-light mb-4">Farm to Table</h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
          <p className="text-xl font-light max-w-2xl">Our commitment to quality starts with the finest ingredients, sourced directly from local farms and quality suppliers.</p>
        </div>
      </div>
      
      {/* Main Content with Tabs */}
      <div className="bg-white/5 pt-8">
        <div className="container mx-auto px-6">
          <Tabs 
            defaultValue="ingredients" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-4xl mx-auto"
          >
            <TabsList className="bg-white/10 w-full flex mb-12 rounded-md overflow-hidden">
              <TabsTrigger 
                value="ingredients"
                className="data-[state=active]:bg-white/20 py-2 px-4 flex-1 whitespace-nowrap text-sm md:text-base font-light"
              >
                Ingredients
              </TabsTrigger>
              <TabsTrigger 
                value="partners"
                className="data-[state=active]:bg-white/20 py-2 px-4 flex-1 whitespace-nowrap text-sm md:text-base font-light"
              >
                Partners
              </TabsTrigger>
              <TabsTrigger 
                value="sustainability"
                className="data-[state=active]:bg-white/20 py-2 px-4 flex-1 whitespace-nowrap text-sm md:text-base font-light"
              >
                Sustainability
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="text-white pb-20">
              <h2 className="text-4xl font-light mb-8 text-center">Premium Quality Ingredients</h2>
              <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col h-full">
                    <div className="relative h-56">
                      <Image 
                        src={ingredient.image} 
                        alt={ingredient.name} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-light mb-1">{ingredient.name}</h3>
                      <div className="text-green-300 text-sm mb-3">{ingredient.origin}</div>
                      <p className="text-white/70">{ingredient.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="partners" className="text-white pb-20">
              <h2 className="text-4xl font-light mb-8 text-center">Local Partners</h2>
              <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {farms.map((farm, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col h-full">
                    <div className="relative h-56">
                      <Image 
                        src={farm.image} 
                        alt={farm.name} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-light mb-1">{farm.name}</h3>
                      <div className="text-amber-300 text-sm mb-3">{farm.location}</div>
                      <p className="text-white/70 mb-4">{farm.description}</p>
                      <div className="mt-auto">
                        <div className="text-sm font-medium text-white/50 mb-2">Products:</div>
                        <div className="flex flex-wrap gap-2">
                          {farm.products.map((product, idx) => (
                            <span 
                              key={idx} 
                              className="bg-white/20 px-3 py-1 rounded-full text-xs"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="sustainability" className="text-white pb-20">
              <h2 className="text-4xl font-light mb-8 text-center">Sustainability Initiatives</h2>
              <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
              
              <div className="max-w-3xl mx-auto">
                <p className="text-xl font-light mb-12 text-center">
                  At Golden Crust, we're committed to responsible and sustainable practices that minimize our environmental impact while supporting our community.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {sustainabilityInitiatives.map((initiative, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="mb-4">
                        {initiative.icon}
                      </div>
                      <h3 className="text-2xl font-light mb-3">{initiative.title}</h3>
                      <p className="text-white/70">{initiative.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Commitment Statement */}
      <div className="bg-green-900/30 py-20 text-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-light mb-6">Our Commitment</h2>
          <p className="text-xl font-light mb-8">
            From farm to fork, we strive to bring you the most authentic flavors while respecting our environment and supporting local communities. This commitment to quality and sustainability is at the heart of everything we do.
          </p>
          <Button 
            variant="outline" 
            className="border-white/40 bg-white/10 text-white hover:bg-white/30 transition-colors shadow-md"
          >
            Learn About Our Sourcing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}