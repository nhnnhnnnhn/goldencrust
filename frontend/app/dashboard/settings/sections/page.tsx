"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, GripVertical, Plus, Save, Trash2 } from "lucide-react"

// Các phần có thể thêm vào trang chủ
const availableSections = [
  {
    id: "featured",
    name: "Món đặc trưng",
    description: "Hiển thị các món ăn nổi bật của nhà hàng",
  },
  {
    id: "about",
    name: "Giới thiệu",
    description: "Chia sẻ câu chuyện và giá trị của nhà hàng",
  },
  {
    id: "testimonials",
    name: "Đánh giá khách hàng",
    description: "Hiển thị phản hồi tích cực từ khách hàng",
  },
  {
    id: "gallery",
    name: "Thư viện ảnh",
    description: "Hiển thị hình ảnh đẹp về nhà hàng và món ăn",
  },
  {
    id: "contact",
    name: "Liên hệ",
    description: "Hiển thị thông tin liên hệ và bản đồ",
  },
]

export default function SectionsPage() {
  const router = useRouter()
  const [activeSections, setActiveSections] = useState([
    {
      id: "hero",
      name: "Giới thiệu (Hero)",
      enabled: true,
      required: true,
      content: {
        title: "Authentic Vietnamese Pizza",
        description: "Experience the perfect blend of Vietnamese flavors and Italian tradition",
      },
    },
    {
      id: "featured",
      name: "Món đặc trưng",
      enabled: true,
      required: false,
      content: {
        title: "Món đặc trưng của chúng tôi",
        description: "Khám phá những món ăn được yêu thích nhất tại nhà hàng",
      },
    },
    {
      id: "about",
      name: "Giới thiệu",
      enabled: true,
      required: false,
      content: {
        title: "Về Golden Crust",
        description:
          "Thành lập năm 2020, Golden Crust mang đến hương vị Việt Nam đích thực trong thế giới pizza. Đầu bếp của chúng tôi kết hợp nguyên liệu truyền thống Việt Nam với kỹ thuật Ý cổ điển để tạo ra những chiếc bánh pizza độc đáo, ngon miệng mà bạn không thể tìm thấy ở bất kỳ đâu khác.",
      },
    },
  ])

  const [isSaving, setIsSaving] = useState(false)

  const handleToggleSection = (sectionId: string) => {
    setActiveSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId && !section.required) {
          return { ...section, enabled: !section.enabled }
        }
        return section
      }),
    )
  }

  const handleUpdateSectionContent = (sectionId: string, field: string, value: string) => {
    setActiveSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            content: {
              ...section.content,
              [field]: value,
            },
          }
        }
        return section
      }),
    )
  }

  const handleAddSection = (sectionId: string) => {
    const sectionToAdd = availableSections.find((section) => section.id === sectionId)
    if (sectionToAdd) {
      setActiveSections((prev) => [
        ...prev,
        {
          id: sectionToAdd.id,
          name: sectionToAdd.name,
          enabled: true,
          required: false,
          content: {
            title: `${sectionToAdd.name} của chúng tôi`,
            description: sectionToAdd.description,
          },
        },
      ])
    }
  }

  const handleRemoveSection = (sectionId: string) => {
    setActiveSections((prev) => prev.filter((section) => section.id !== sectionId || section.required))
  }

  const handleSave = () => {
    setIsSaving(true)
    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setIsSaving(false)
      router.push("/dashboard/settings")
    }, 1000)
  }

  // Lọc ra các phần chưa được thêm vào
  const availableToAdd = availableSections.filter(
    (section) => !activeSections.some((activeSection) => activeSection.id === section.id),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/settings")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý các phần trang chủ</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      <p className="text-gray-500">
        Quản lý các phần hiển thị trên trang chủ. Bạn có thể bật/tắt, chỉnh sửa nội dung hoặc thêm/xóa các phần.
      </p>

      <div className="space-y-4">
        {activeSections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <CardTitle className="text-lg">{section.name}</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                {!section.required && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSection(section.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa phần</span>
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`toggle-${section.id}`}
                    checked={section.enabled}
                    onCheckedChange={() => handleToggleSection(section.id)}
                    disabled={section.required}
                  />
                  <Label htmlFor={`toggle-${section.id}`} className="cursor-pointer">
                    {section.enabled ? "Hiển thị" : "Ẩn"}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className={section.enabled ? "" : "opacity-50"}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${section.id}-title`}>Tiêu đề</Label>
                  <Input
                    id={`${section.id}-title`}
                    value={section.content?.title || ""}
                    onChange={(e) => handleUpdateSectionContent(section.id, "title", e.target.value)}
                    disabled={!section.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${section.id}-description`}>Mô tả</Label>
                  <Textarea
                    id={`${section.id}-description`}
                    value={section.content?.description || ""}
                    onChange={(e) => handleUpdateSectionContent(section.id, "description", e.target.value)}
                    rows={3}
                    disabled={!section.enabled}
                  />
                </div>

                {section.id === "featured" && section.enabled && (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <p className="text-sm font-medium">Món đặc trưng</p>
                    <p className="mb-2 text-xs text-gray-500">
                      Bạn có thể quản lý các món đặc trưng trong phần Quản lý Menu
                    </p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/menu-management")}>
                      Quản lý Menu
                    </Button>
                  </div>
                )}

                {section.id === "testimonials" && section.enabled && (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <p className="text-sm font-medium">Đánh giá khách hàng</p>
                    <p className="mb-2 text-xs text-gray-500">
                      Bạn có thể quản lý các đánh giá khách hàng trong phần Đánh giá
                    </p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/testimonials")}>
                      Quản lý Đánh giá
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableToAdd.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm phần mới</CardTitle>
            <CardDescription>Chọn phần bạn muốn thêm vào trang chủ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableToAdd.map((section) => (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleAddSection(section.id)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{section.name}</h3>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
