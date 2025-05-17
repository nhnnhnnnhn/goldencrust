"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Star, Users, Clock, ChevronRight } from "lucide-react"
import { getTranslation } from "@/utils/translations"
import { Button } from "@/components/ui/button"

export default function OurStoryPage() {
  const [language, setLanguage] = useState<"en" | "vi">("en")

  // Get language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "vi" | null
    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = getTranslation(language)

  // Timeline milestones
  const timeline = [
    { 
      year: "2005", 
      title: "The Beginning", 
      description: "Golden Crust started as a small pizza shop in the city center, with a stone oven and passion for Italian cuisine.",
      image: "/placeholder.svg?height=200&width=300&text=2005"
    },
    { 
      year: "2009", 
      title: "Expansion", 
      description: "After initial success, we opened our second location and began developing our menu with signature dishes.",
      image: "/placeholder.svg?height=200&width=300&text=2009"
    },
    { 
      year: "2013", 
      title: "Quality Commitment", 
      description: "We began partnering with local farms to ensure fresh, clean ingredients for all our dishes.",
      image: "/placeholder.svg?height=200&width=300&text=2013"
    },
    { 
      year: "2018", 
      title: "International Recognition", 
      description: "Golden Crust was honored in the 'Top 50 Pizza Restaurants in the World' list and received numerous culinary awards.",
      image: "/placeholder.svg?height=200&width=300&text=2018"
    },
    { 
      year: "2023", 
      title: "Present Day", 
      description: "Today, Golden Crust has 15 locations nationwide and continues to uphold its commitment to quality and sustainability.",
      image: "/placeholder.svg?height=200&width=300&text=2023"
    },
  ]

  // Key team members
  const team = [
    {
      name: "Antonio Rossi",
      title: "Founder & Executive Chef",
      bio: "With over 25 years of experience in Italian cuisine, Antonio brings his family's secret recipes to every dish at Golden Crust.",
      image: "/placeholder.svg?height=300&width=300&text=Antonio"
    },
    {
      name: "Maria Bianchi",
      title: "Head of Culinary Innovation",
      bio: "Trained in Florence, Maria is responsible for developing new menu items and ensuring each dish delivers an authentic taste experience.",
      image: "/placeholder.svg?height=300&width=300&text=Maria"
    },
    {
      name: "Luca Esposito",
      title: "Sustainability Director",
      bio: "Luca works with local suppliers to ensure all ingredients are produced sustainably and ethically, maintaining our commitment to the environment.",
      image: "/placeholder.svg?height=300&width=300&text=Luca"
    }
  ]

  // Awards
  const awards = [
    { 
      year: "2023", 
      title: "Best Fine Dining Experience", 
      organization: "Urban Food Awards" 
    },
    { 
      year: "2022", 
      title: "Sustainability Excellence", 
      organization: "Green Restaurant Association" 
    },
    { 
      year: "2021", 
      title: "Best Authentic Italian Restaurant", 
      organization: "Culinary Excellence Awards" 
    },
    { 
      year: "2020", 
      title: "Chef of the Year - Antonio Rossi", 
      organization: "International Culinary Institute" 
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <Image
          src="/images/shutterstock_1218150229.jpg" 
          alt="Our Story Banner" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white container mx-auto px-6">
          <Link href="/" className="absolute left-6 top-8 text-white hover:text-white/80 transition-colors flex items-center font-light">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Trở về Trang chủ
          </Link>
          <h1 className="text-6xl font-light mb-4">Câu chuyện của chúng tôi</h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
          <p className="text-xl font-light max-w-2xl">Khám phá hành trình của Golden Crust, từ nguồn gốc khiêm tốn đến vị thế là một trong những thương hiệu pizza được yêu thích nhất.</p>
        </div>
      </div>

      {/* Our Beginning */}
      <div className="container mx-auto px-6 py-20 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light mb-8 text-center">Khởi nguồn</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <Image 
                src="/placeholder.svg?height=400&width=500&text=Our+Beginnings" 
                alt="Our Beginnings" 
                width={500} 
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-xl font-light mb-6">
                Golden Crust bắt đầu từ một ước mơ đơn giản - mang đến hương vị chân thực của ẩm thực Ý đến với mọi người.
              </p>
              <p className="text-lg font-light mb-6">
                Năm 2005, Antonio Rossi, một đầu bếp người Ý đã quyết định mở một tiệm pizza nhỏ với một lò nướng đá truyền thống và những công thức gia truyền. Với tầm nhìn rõ ràng và niềm đam mê ẩm thực, Antonio đã tạo nên một thương hiệu pizza không chỉ đơn thuần là thức ăn, mà còn là một trải nghiệm.
              </p>
              <p className="text-lg font-light">
                Ông tin rằng bí quyết của một chiếc pizza hoàn hảo nằm ở sự đơn giản, chất lượng nguyên liệu và tâm huyết của người làm. Qua từng năm, Golden Crust đã phát triển nhưng vẫn giữ nguyên những giá trị cốt lõi này.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/5 py-20">
        <div className="container mx-auto px-6 text-white">
          <h2 className="text-4xl font-light mb-8 text-center">Hành trình của chúng tôi</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/20"></div>
            
            {/* Timeline items */}
            {timeline.map((item, index) => (
              <div key={index} className="relative z-10 mb-16 last:mb-0">
                <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                  <div className="md:w-1/2 text-center md:text-left">
                    <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                      <span className="text-xl font-light">{item.year}</span>
                    </div>
                    <h3 className="text-2xl font-light mb-4">{item.title}</h3>
                    <p className="text-white/70">{item.description}</p>
                  </div>
                  
                  <div className="md:w-1/2">
                    <div className="relative h-64 w-full overflow-hidden rounded-lg">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill
                        className="object-cover transition-transform hover:scale-105 duration-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Center dot */}
                <div className="absolute left-1/2 top-12 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 border-4 border-black"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container mx-auto px-6 py-20 text-white">
        <h2 className="text-4xl font-light mb-8 text-center">Những người sáng lập</h2>
        <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {team.map((member, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="relative h-72">
                <Image 
                  src={member.image} 
                  alt={member.name} 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-light mb-1">{member.name}</h3>
                <div className="text-blue-300 mb-4">{member.title}</div>
                <p className="text-white/70">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awards and Recognition */}
      <div className="bg-gradient-to-b from-amber-900/20 to-amber-950/20 py-20">
        <div className="container mx-auto px-6 text-white">
          <h2 className="text-4xl font-light mb-8 text-center">Giải thưởng & Vinh danh</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl flex items-start">
                  <div className="mr-4 mt-1">
                    <Star className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light mb-2">{award.title}</h3>
                    <p className="text-amber-300 mb-1">{award.organization}</p>
                    <p className="text-white/50 text-sm">{award.year}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-lg font-light text-white/70 mb-6">We are proud of our journey and will continue to bring our customers the most authentic culinary experiences.</p>
              <Button
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/30 transition-colors">
                Book a Table Today
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto px-6 py-20 text-white">
        <h2 className="text-4xl font-light mb-8 text-center">Core Values</h2>
        <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/50 mb-6">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-light mb-4">Quality</h3>
            <p className="text-white/70">We never compromise on quality. From ingredients to service, excellence is our standard.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/50 mb-6">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-light mb-4">Community</h3>
            <p className="text-white/70">We believe in building strong relationships with our local community, from farmers and suppliers to customers.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/50 mb-6">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-light mb-4">Tradition</h3>
            <p className="text-white/70">We respect Italian culinary traditions, preserving classic techniques while constantly innovating.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=500&width=1920&text=Visit+Us" 
            alt="Visit us"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-white text-center">
          <h2 className="text-4xl font-light mb-6">Become Part of Our Story</h2>
          <p className="text-xl font-light mb-8 max-w-2xl mx-auto">Visit Golden Crust to experience authentic Italian flavors and become part of our journey.</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
              <Calendar className="h-5 w-5 mr-2" />
              Book a Table
            </Button>
            <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/30 transition-colors shadow-md">
              <Clock className="h-5 w-5 mr-2" />
              View Opening Hours
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-6 text-white/50 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">© 2025 Golden Crust. All rights reserved.</p>
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
