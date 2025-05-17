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
      name: "Trang trại hữu cơ Sông Hồng",
      description: "Trang trại hữu cơ cung cấp rau xanh và thảo mộc tươi trồng không thuốc trừ sâu hay phân bón hóa học.",
      location: "Bắc Ninh, Việt Nam",
      image: "/placeholder.svg?height=300&width=400&text=Song+Hong+Farm",
      products: ["Rau xanh", "Thảo mộc", "Cà chua"]
    },
    {
      name: "Vườn cây ăn trái Mỹ Khánh",
      description: "Vườn cây gia đình cung cấp các loại trái cây hữu cơ tươi ngon nhất, được thu hoạch vào thời điểm hoàn hảo.",
      location: "Đồng Tháp, Việt Nam",
      image: "/placeholder.svg?height=300&width=400&text=My+Khanh+Orchard",
      products: ["Quả mọng", "Trái cây theo mùa"]
    },
    {
      name: "Phô mai thủ công Đà Lạt",
      description: "Phô mai thủ công được sản xuất từ sữa bò tự nhiên, không hormone, với các phương pháp truyền thống của Ý.",
      location: "Lâm Đồng, Việt Nam",
      image: "/placeholder.svg?height=300&width=400&text=Dalat+Cheese",
      products: ["Phô mai mozzarella", "Phô mai ricotta", "Phô mai parmesan"]
    },
    {
      name: "Trang trại gà Trường Phát",
      description: "Trang trại gia đình chuyên chăn nuôi gà thả vườn, không dùng kháng sinh, đảm bảo sản phẩm sạch và nhân đạo.",
      location: "Đồng Nai, Việt Nam",
      image: "/placeholder.svg?height=300&width=400&text=Truong+Phat+Farm",
      products: ["Thịt gà tươi", "Trứng gà thả vườn"]
    }
  ]

  // Key ingredients
  const ingredients = [
    {
      name: "Bột mì 00",
      origin: "Nhập khẩu từ Ý",
      description: "Loại bột mì cao cấp với hàm lượng protein vừa phải, tạo ra lớp vỏ bánh giòn mềm hoàn hảo. Đây là nền tảng cho mọi chiếc pizza của chúng tôi.",
      image: "/placeholder.svg?height=300&width=300&text=Flour"
    },
    {
      name: "Cà chua San Marzano",
      origin: "Trồng tại Việt Nam theo tiêu chuẩn Ý",
      description: "Cà chua San Marzano cung cấp hương vị ngọt ngào, ít acid và là thành phần chính trong nước sốt truyền thống của chúng tôi.",
      image: "/placeholder.svg?height=300&width=300&text=Tomatoes"
    },
    {
      name: "Phô mai Mozzarella",
      origin: "Sản xuất tại Đà Lạt",
      description: "Phô mai mozzarella tươi được làm từ sữa bò địa phương, có độ béo và độ kéo sợi hoàn hảo cho pizza.",
      image: "/placeholder.svg?height=300&width=300&text=Mozzarella"
    },
    {
      name: "Thảo mộc hữu cơ",
      origin: "Trang trại Sông Hồng",
      description: "Húng quế, oregano và rosemary tươi mang đến hương vị đậm đà cho các món ăn của chúng tôi.",
      image: "/placeholder.svg?height=300&width=300&text=Herbs"
    },
    {
      name: "Dầu olive nguyên chất",
      origin: "Nhập khẩu từ Ý",
      description: "Dầu olive ép lạnh, nguyên chất được sử dụng để tạo ra hương vị phong phú cho mọi món ăn.",
      image: "/placeholder.svg?height=300&width=300&text=Olive+Oil"
    },
    {
      name: "Các loại bột xay nhuyễn",
      origin: "Được chế biến theo công thức riêng",
      description: "Hỗn hợp đặc biệt của chúng tôi gồm các loại gia vị và thảo mộc, đảm bảo hương vị đặc trưng cho mỗi món ăn.",
      image: "/placeholder.svg?height=300&width=300&text=Spices"
    }
  ]

  // Sustainability initiatives
  const sustainability = [
    {
      title: "Canh tác hữu cơ",
      description: "Hợp tác với các trang trại áp dụng phương pháp canh tác hữu cơ, không sử dụng thuốc trừ sâu hay phân bón hóa học.",
      icon: <Leaf className="h-10 w-10 text-green-500" />
    },
    {
      title: "Bảo tồn nước",
      description: "Đầu tư vào hệ thống thu nước mưa và tái chế nước để giảm thiểu việc sử dụng nước trong nhà hàng.",
      icon: <Droplets className="h-10 w-10 text-blue-500" />
    },
    {
      title: "Năng lượng tái tạo",
      description: "Sử dụng năng lượng tái tạo khi có thể và đầu tư vào các dự án năng lượng xanh để bù đắp lượng khí thải carbon.",
      icon: <Wind className="h-10 w-10 text-amber-500" />
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <Image
          src="/images/143352-2.webp"
          alt="Farm to Table Banner" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white container mx-auto px-6">
          <Link href="/" className="absolute left-6 top-8 text-white hover:text-white/80 transition-colors flex items-center font-light">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Trở về Trang chủ
          </Link>
          <h1 className="text-6xl font-light mb-4">Từ nông trại đến bàn ăn</h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
          <p className="text-xl font-light max-w-2xl">Khám phá cách chúng tôi liên kết với các trang trại địa phương để mang đến những nguyên liệu tươi ngon nhất cho bữa ăn của bạn.</p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="container mx-auto px-6 py-20 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light mb-8 text-center">Triết lý của chúng tôi</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <Image 
                src="/placeholder.svg?height=400&width=500&text=Our+Philosophy" 
                alt="Our Philosophy" 
                width={500} 
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-xl font-light mb-6">
                Tại Golden Crust, chúng tôi tin rằng những nguyên liệu tốt nhất tạo nên những món ăn tuyệt vời nhất.
              </p>
              <p className="text-lg font-light mb-6">
                Triết lý "Từ nông trại đến bàn ăn" của chúng tôi không chỉ là một khẩu hiệu, mà là cách chúng tôi hoạt động hàng ngày. Chúng tôi hợp tác chặt chẽ với các nhà sản xuất địa phương để đảm bảo rằng mỗi thành phần trong món ăn của chúng tôi đều tươi ngon, bền vững và có đạo đức.
              </p>
              <p className="text-lg font-light">
                Khi thưởng thức một món ăn tại Golden Crust, bạn không chỉ trải nghiệm hương vị Ý đích thực mà còn góp phần hỗ trợ nền nông nghiệp địa phương và các phương pháp sản xuất bền vững.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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
                Nguyên liệu
              </TabsTrigger>
              <TabsTrigger 
                value="partners"
                className="data-[state=active]:bg-white/20 py-2 px-4 flex-1 whitespace-nowrap text-sm md:text-base font-light"
              >
                Đối tác
              </TabsTrigger>
              <TabsTrigger 
                value="sustainability"
                className="data-[state=active]:bg-white/20 py-2 px-4 flex-1 whitespace-nowrap text-sm md:text-base font-light"
              >
                Bền vững
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="text-white pb-20">
              <h2 className="text-4xl font-light mb-8 text-center">Nguyên liệu chất lượng cao</h2>
              <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden transition-transform hover:scale-[1.02] duration-300">
                    <div className="relative h-48">
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
              <h2 className="text-4xl font-light mb-8 text-center">Đối tác địa phương</h2>
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
                      <div className="text-blue-300 text-sm mb-3">{farm.location}</div>
                      <p className="text-white/70 mb-4 flex-1">{farm.description}</p>
                      
                      <div className="mt-auto">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-2">Sản phẩm</h4>
                        <div className="flex flex-wrap gap-2">
                          {farm.products.map((product, idx) => (
                            <span key={idx} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                  Chúng tôi luôn tìm kiếm các đối tác mới chia sẻ giá trị và cam kết về chất lượng. Nếu bạn là một nhà sản xuất địa phương, hãy liên hệ với chúng tôi.
                </p>
                <Button variant="outline" className="border-white/30 hover:bg-white/20">
                  Trở thành đối tác
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="sustainability" className="text-white pb-20">
              <h2 className="text-4xl font-light mb-8 text-center">Cam kết phát triển bền vững</h2>
              <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {sustainability.map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
                    <div className="flex justify-center mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-light mb-4">{item.title}</h3>
                    <p className="text-white/70">{item.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 p-8 rounded-xl">
                <h3 className="text-2xl font-light mb-6 text-center">Cam kết bền vững của chúng tôi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 max-w-3xl mx-auto">
                  {[
                    "Giảm thiểu chất thải nhựa một lần",
                    "Ưu tiên nguyên liệu theo mùa và địa phương",
                    "Tối ưu hóa sử dụng nguyên liệu, giảm thiểu lãng phí thực phẩm",
                    "Sử dụng bao bì thân thiện với môi trường",
                    "Ủng hộ các phương pháp sản xuất nhân đạo",
                    "Tổ chức các sự kiện giáo dục cộng đồng về ẩm thực bền vững"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-white/90">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Seasonal Highlights */}
      <div className="container mx-auto px-6 py-20 text-white border-t border-white/10">
        <h2 className="text-4xl font-light mb-8 text-center">Đặc sản theo mùa</h2>
        <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Pizza nấm truffle", season: "Mùa thu", image: "/placeholder.svg?height=300&width=300&text=Truffle+Pizza" },
              { name: "Salad hoa quả mùa hè", season: "Mùa hè", image: "/placeholder.svg?height=300&width=300&text=Summer+Salad" },
              { name: "Risotto nấm mùa thu", season: "Mùa thu", image: "/placeholder.svg?height=300&width=300&text=Mushroom+Risotto" },
              { name: "Kem gelato dâu", season: "Mùa xuân", image: "/placeholder.svg?height=300&width=300&text=Strawberry+Gelato" }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-xl">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 rounded-xl">
                  <div className="bg-amber-600/90 text-white text-xs px-3 py-1 rounded-full inline-block mb-2 w-fit">
                    {item.season}
                  </div>
                  <h3 className="text-xl font-light">{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center border border-white px-6 py-3 rounded-full text-lg font-light bg-black/30 hover:bg-white/20 transition-all"
          >
            Xem thực đơn đầy đủ
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Visit Our Kitchen */}
      <div className="bg-gradient-to-b from-amber-900/20 to-amber-950/20 py-20">
        <div className="container mx-auto px-6 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-light mb-8 text-center">Tham quan nhà bếp của chúng tôi</h2>
            <div className="w-20 h-1 bg-white/50 mx-auto mb-12"></div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="relative h-80">
                <Image 
                  src="/placeholder.svg?height=500&width=1000&text=Kitchen+Tour" 
                  alt="Kitchen Tour" 
                  fill
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[20px] border-l-white ml-2"></div>
                  </div>
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-light mb-4">Hành trình từ nông trại đến bàn ăn</h3>
                <p className="text-white/70 mb-6">
                  Tham quan nhà bếp của chúng tôi và khám phá cách chúng tôi biến những nguyên liệu tươi ngon nhất thành những món ăn tuyệt vời. Từ việc lựa chọn nguyên liệu đến tạo hình bánh pizza, chứng kiến sự tận tâm của đội ngũ đầu bếp chúng tôi trong mỗi công đoạn.
                </p>
                <Button className="bg-blue-900 hover:bg-blue-800">
                  Đặt lịch tham quan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-6 text-white/50 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">© 2025 Golden Crust. Đã đăng ký bản quyền.</p>
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            Trở về Trang chủ
          </Link>
        </div>
      </footer>
    </div>
  )
}
