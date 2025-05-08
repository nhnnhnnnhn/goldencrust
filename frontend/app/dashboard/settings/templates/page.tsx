"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

// Mẫu trang chủ có sẵn
const templates = [
  {
    id: "modern",
    name: "Hiện đại",
    description: "Thiết kế hiện đại với hình ảnh lớn và bố cục tối giản",
    features: ["Hình ảnh toàn màn hình", "Menu dạng lưới", "Hiệu ứng cuộn mượt mà"],
  },
  {
    id: "traditional",
    name: "Truyền thống",
    description: "Thiết kế ấm cúng với phong cách truyền thống",
    features: ["Bố cục cổ điển", "Hình ảnh món ăn lớn", "Phông chữ thanh lịch"],
  },
  {
    id: "elegant",
    name: "Thanh lịch",
    description: "Thiết kế sang trọng với tông màu tối và chi tiết tinh tế",
    features: ["Tông màu tối", "Hiệu ứng chuyển động tinh tế", "Bố cục tối giản"],
  },
  {
    id: "vibrant",
    name: "Sôi động",
    description: "Thiết kế sôi động với màu sắc tươi sáng và bố cục năng động",
    features: ["Màu sắc rực rỡ", "Bố cục năng động", "Hiệu ứng chuyển động"],
  },
  {
    id: "minimal",
    name: "Tối giản",
    description: "Thiết kế tối giản với nhiều khoảng trắng và tập trung vào nội dung",
    features: ["Nhiều khoảng trắng", "Tập trung vào nội dung", "Dễ đọc"],
  },
  {
    id: "rustic",
    name: "Mộc mạc",
    description: "Thiết kế mộc mạc với cảm giác ấm cúng và thân thiện",
    features: ["Họa tiết gỗ", "Màu sắc ấm", "Cảm giác thân thiện"],
  },
]

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const router = useRouter()

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleApplyTemplate = () => {
    setIsApplying(true)
    // Giả lập áp dụng mẫu
    setTimeout(() => {
      setIsApplying(false)
      router.push("/dashboard/settings")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/settings")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Chọn mẫu trang chủ</h1>
      </div>

      <p className="text-gray-500">
        Chọn một mẫu trang chủ có sẵn để áp dụng cho trang web của bạn. Bạn vẫn có thể tùy chỉnh nội dung sau khi áp
        dụng mẫu.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? "ring-2 ring-blue-600" : ""
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 bg-gray-100"></div>
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                [Hình ảnh mẫu {template.name}]
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{template.name}</h3>
                {selectedTemplate === template.id && <Check className="h-5 w-5 text-blue-600" />}
              </div>
              <p className="mb-3 text-sm text-gray-500">{template.description}</p>
              <ul className="ml-5 list-disc text-xs text-gray-600">
                {template.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleApplyTemplate} disabled={!selectedTemplate || isApplying}>
          {isApplying ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Đang áp dụng...
            </>
          ) : (
            "Áp dụng mẫu đã chọn"
          )}
        </Button>
      </div>
    </div>
  )
}
