type Translation = {
  navigation: {
    reservation: string
    delivery: string
    career: string
    login: string
    logout: string
    register: string
  }
  home: {
    loading: string
    country: string
  }
  about: {
    title: string
    paragraph1: string
    paragraph2: string
    learnMore: string
  }
  concept: {
    title: string
    paragraph1: string
    paragraph2: string
    discoverIngredients: string
  }
  locations: {
    title: string
    locations: string
    viewAll: string
  }
  restaurant: {
    title: string
    paragraph1: string
    paragraph2: string
    vision: {
      title: string
      description: string
    }
    values: {
      title: string
      description: string
    }
    promise: {
      title: string
      description: string
    }
  }
  menu: {
    title: string
    description: string
    orderNow: string
    viewFullMenu: string
  }
  gallery: {
    title: string
    description: string
  }
  contact: {
    title: string
    generalInquiries: string
    careers: string
    press: string
    instagram: string
    facebook: string
    copyright: string
  }
  dashboard: {
    dashboard: string
    myOrders: string
    myReservations: string
    orderHistory: string
    loyaltyProgram: string
    profile: string
    customers: string
    menu: string
    reservations: string
    delivery: string
    statistics: string
    table: string
    payment: string
    settings: string
  }
}

const translations: Record<"en" | "vi", Translation> = {
  en: {
    navigation: {
      reservation: "Reservation",
      delivery: "Delivery",
      career: "Career",
      login: "Login",
      logout: "Logout",
      register: "Register",
    },
    home: {
      loading: "Loading...",
      country: "VIETNAM",
    },
    about: {
      title: "About Us",
      paragraph1:
        "Golden Crust is a Michelin-starred pizza restaurant that combines traditional Italian techniques with Vietnamese flavors and ingredients.",
      paragraph2:
        "Founded in 2015, we've quickly become a culinary destination known for our commitment to quality, innovation, and exceptional dining experiences.",
      learnMore: "Learn More",
    },
    concept: {
      title: "Farm to Table",
      paragraph1:
        "We believe in sourcing the freshest ingredients directly from local Vietnamese farms and producers, ensuring that every dish tells a story of quality and sustainability.",
      paragraph2:
        "Our chefs visit farms weekly to select the finest seasonal produce, creating a menu that evolves with nature's rhythms and celebrates Vietnam's rich agricultural heritage.",
      discoverIngredients: "Discover Our Ingredients",
    },
    locations: {
      title: "Our Locations",
      locations: "locations",
      viewAll: "View All Locations",
    },
    restaurant: {
      title: "Our Restaurant",
      paragraph1:
        "Step into a space where contemporary design meets traditional Vietnamese elements, creating an atmosphere that's both sophisticated and welcoming.",
      paragraph2:
        "Our open kitchen allows guests to witness the artistry of our chefs as they craft each pizza in our custom-built wood-fired ovens imported from Naples.",
      vision: {
        title: "Our Vision",
        description:
          "To create a dining experience that honors both Italian pizza traditions and Vietnamese culinary heritage.",
      },
      values: {
        title: "Our Values",
        description:
          "Quality, sustainability, innovation, and respect for both cultures that inspire our unique approach.",
      },
      promise: {
        title: "Our Promise",
        description:
          "Every dish we serve will tell a story of cultural fusion, exceptional ingredients, and passionate craftsmanship.",
      },
    },
    menu: {
      title: "Our Menu",
      description:
        "Discover our selection of handcrafted pizzas and dishes that blend Italian traditions with Vietnamese flavors.",
      orderNow: "Order Now",
      viewFullMenu: "View Full Menu",
    },
    gallery: {
      title: "Gallery",
      description: "Take a visual journey through our restaurant, dishes, and the culinary artistry that defines us.",
    },
    contact: {
      title: "Contact Us",
      generalInquiries: "General Inquiries",
      careers: "Careers",
      press: "Press",
      instagram: "Instagram",
      facebook: "Facebook",
      copyright: "© 2023 Golden Crust. All rights reserved.",
    },
    dashboard: {
      dashboard: "Dashboard",
      myOrders: "My Orders",
      myReservations: "My Reservations",
      orderHistory: "Order History",
      loyaltyProgram: "Loyalty Program",
      profile: "Profile",
      customers: "Customers",
      menu: "Menu Management",
      reservations: "Reservations",
      delivery: "Delivery",
      statistics: "Statistics",
      table: "Table Management",
      payment: "Payment",
      settings: "Settings",
    },
  },
  vi: {
    navigation: {
      reservation: "Đặt Bàn",
      delivery: "Giao Hàng",
      career: "Tuyển Dụng",
      login: "Đăng Nhập",
      logout: "Đăng Xuất",
      register: "Đăng Ký",
    },
    home: {
      loading: "Đang tải...",
      country: "VIỆT NAM",
    },
    about: {
      title: "Về Chúng Tôi",
      paragraph1:
        "Golden Crust là nhà hàng pizza được gắn sao Michelin, kết hợp kỹ thuật truyền thống Ý với hương vị và nguyên liệu Việt Nam.",
      paragraph2:
        "Được thành lập vào năm 2015, chúng tôi nhanh chóng trở thành điểm đến ẩm thực nổi tiếng với cam kết về chất lượng, sự đổi mới và trải nghiệm ẩm thực đặc biệt.",
      learnMore: "Tìm Hiểu Thêm",
    },
    concept: {
      title: "Từ Nông Trại Đến Bàn Ăn",
      paragraph1:
        "Chúng tôi tin tưởng vào việc tìm nguồn nguyên liệu tươi ngon trực tiếp từ các trang trại và nhà sản xuất địa phương Việt Nam, đảm bảo rằng mỗi món ăn đều kể một câu chuyện về chất lượng và tính bền vững.",
      paragraph2:
        "Các đầu bếp của chúng tôi thăm các trang trại hàng tuần để lựa chọn những sản phẩm theo mùa tốt nhất, tạo ra một thực đơn phát triển theo nhịp điệu của thiên nhiên và tôn vinh di sản nông nghiệp phong phú của Việt Nam.",
      discoverIngredients: "Khám Phá Nguyên Liệu Của Chúng Tôi",
    },
    locations: {
      title: "Các Chi Nhánh",
      locations: "chi nhánh",
      viewAll: "Xem Tất Cả Chi Nhánh",
    },
    restaurant: {
      title: "Nhà Hàng Của Chúng Tôi",
      paragraph1:
        "Bước vào không gian nơi thiết kế hiện đại gặp gỡ các yếu tố truyền thống Việt Nam, tạo nên một bầu không khí vừa tinh tế vừa thân thiện.",
      paragraph2:
        "Nhà bếp mở của chúng tôi cho phép thực khách chứng kiến nghệ thuật của các đầu bếp khi họ chế biến từng chiếc bánh pizza trong lò nướng củi được thiết kế riêng nhập khẩu từ Naples.",
      vision: {
        title: "Tầm Nhìn",
        description: "Tạo ra trải nghiệm ẩm thực tôn vinh cả truyền thống pizza Ý và di sản ẩm thực Việt Nam.",
      },
      values: {
        title: "Giá Trị",
        description:
          "Chất lượng, bền vững, đổi mới và tôn trọng cả hai nền văn hóa truyền cảm hứng cho cách tiếp cận độc đáo của chúng tôi.",
      },
      promise: {
        title: "Lời Hứa",
        description:
          "Mỗi món ăn chúng tôi phục vụ sẽ kể một câu chuyện về sự hòa quyện văn hóa, nguyên liệu đặc biệt và tay nghề đầy đam mê.",
      },
    },
    menu: {
      title: "Thực Đơn",
      description:
        "Khám phá bộ sưu tập bánh pizza thủ công và các món ăn kết hợp giữa truyền thống Ý với hương vị Việt Nam.",
      orderNow: "Đặt Hàng Ngay",
      viewFullMenu: "Xem Toàn Bộ Thực Đơn",
    },
    gallery: {
      title: "Thư Viện Ảnh",
      description: "Hãy tham gia hành trình hình ảnh qua nhà hàng, món ăn và nghệ thuật ẩm thực định nghĩa chúng tôi.",
    },
    contact: {
      title: "Liên Hệ",
      generalInquiries: "Thông Tin Chung",
      careers: "Tuyển Dụng",
      press: "Báo Chí",
      instagram: "Instagram",
      facebook: "Facebook",
      copyright: "© 2023 Golden Crust. Bảo lưu mọi quyền.",
    },
    dashboard: {
      dashboard: "Bảng Điều Khiển",
      myOrders: "Đơn Hàng Của Tôi",
      myReservations: "Đặt Bàn Của Tôi",
      orderHistory: "Lịch Sử Đơn Hàng",
      loyaltyProgram: "Chương Trình Khách Hàng Thân Thiết",
      profile: "Hồ Sơ",
      customers: "Khách Hàng",
      menu: "Quản Lý Thực Đơn",
      reservations: "Đặt Bàn",
      delivery: "Giao Hàng",
      statistics: "Thống Kê",
      table: "Quản Lý Bàn",
      payment: "Thanh Toán",
      settings: "Cài Đặt",
    },
  },
}

export function getTranslation(language: "en" | "vi"): Translation {
  return translations[language]
}
