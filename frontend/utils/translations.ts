type TranslationKeys = {
  navigation: {
    reservation: string
    delivery: string
    career: string
    login: string
    logout: string
    register: string
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
    adminRole: string
    userRole: string
    welcomeBack: string
    totalCustomers: string
    reservationsToday: string
    ordersToday: string
    revenueToday: string
    loyaltyPoints: string
    upcomingReservations: string
    recentOrders: string
    memberSince: string
    quickActions: string
    frequentlyUsedActions: string
    manageReservations: string
    manageOrders: string
    updateMenu: string
    viewCustomers: string
    makeReservation: string
    orderFood: string
    loyaltyRewards: string
    updateProfile: string
    recentActivity: string
    latestUpdates: string
    you: string
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
    viewAll: string
    locations: string
    statusOpen: string
    statusClosed: string
    tables: string
    makeReservation: string
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
}

export const translations: Record<"en" | "vi", TranslationKeys> = {
  en: {
    navigation: {
      reservation: "RESERVATION",
      delivery: "DELIVERY",
      career: "CAREER",
      login: "LOGIN",
      logout: "Logout",
      register: "REGISTER"
    },
    dashboard: {
      dashboard: "Dashboard",
      myOrders: "My Orders",
      myReservations: "My Reservations",
      orderHistory: "Order History",
      loyaltyProgram: "Loyalty Program",
      profile: "Profile",
      customers: "Customers",
      menu: "Menu",
      reservations: "Reservations",
      delivery: "Delivery",
      statistics: "Statistics",
      table: "Table",
      payment: "Payment",
      settings: "Settings",
      adminRole: "Admin",
      userRole: "User",
      welcomeBack: "Welcome back",
      totalCustomers: "Total Customers",
      reservationsToday: "Reservations Today",
      ordersToday: "Orders Today",
      revenueToday: "Revenue Today",
      loyaltyPoints: "Loyalty Points",
      upcomingReservations: "Upcoming Reservations",
      recentOrders: "Recent Orders",
      memberSince: "Member Since",
      quickActions: "Quick Actions",
      frequentlyUsedActions: "Frequently used actions and shortcuts",
      manageReservations: "Manage Reservations",
      manageOrders: "Manage Orders",
      updateMenu: "Update Menu",
      viewCustomers: "View Customers",
      makeReservation: "Make Reservation",
      orderFood: "Order Food",
      loyaltyRewards: "Loyalty Rewards",
      updateProfile: "Update Profile",
      recentActivity: "Recent Activity",
      latestUpdates: "Latest updates and activities",
      you: "You",
    },
    home: {
      loading: "Loading...",
      country: "Vietnam",
    },
    about: {
      title: "Our Story",
      paragraph1:
        "Pizza 4P's began with a simple dream: to deliver happiness through pizza. What started as a backyard pizza oven has grown into a beloved restaurant chain.",
      paragraph2:
        'Our name stands for "Platform of Personal Pizza for Peace" - reflecting our mission to create connections between people through the universal language of food.',
      learnMore: "Learn More",
    },
    concept: {
      title: "Farm to Table",
      paragraph1:
        'We believe in the "Farm to Table" concept, ensuring that we use only the freshest ingredients. Many of our ingredients are grown on our own farms, including our signature cheese which is made daily.',
      paragraph2:
        "This commitment to quality and sustainability is at the heart of everything we do, from our carefully crafted pizzas to our thoughtfully designed restaurants.",
      discoverIngredients: "Discover Our Ingredients",
    },
    locations: {
      title: "Our Locations",
      viewAll: "View All",
      locations: "locations",
      statusOpen: "Open",
      statusClosed: "Closed",
      tables: "tables available",
      makeReservation: "Make a Reservation"
    },
    restaurant: {
      title: "Our Restaurant",
      paragraph1:
        "Golden Crust is a Michelin-starred restaurant dedicated to the art of pizza making. Our commitment to quality and excellence has earned us recognition as one of the finest dining establishments in Vietnam.",
      paragraph2:
        "Our mission is to create unforgettable dining experiences through innovative cuisine, exceptional service, and a warm, inviting atmosphere. We believe that food is not just sustenance, but an art form that brings people together.",
      vision: {
        title: "Our Vision",
        description:
          "To redefine the art of pizza making and elevate it to the highest standards of culinary excellence.",
      },
      values: {
        title: "Our Values",
        description: "Quality, innovation, sustainability, and creating meaningful connections through food.",
      },
      promise: {
        title: "Our Promise",
        description: "An extraordinary dining experience that delights all senses and exceeds expectations.",
      },
    },
    menu: {
      title: "Featured Menu",
      description:
        "Discover our chef's selection of signature dishes, crafted with the finest ingredients and culinary expertise.",
      orderNow: "Order Now",
      viewFullMenu: "View Full Menu",
    },
    gallery: {
      title: "Gallery",
      description: "Experience the ambiance and artistry of Golden Crust through our gallery.",
    },
    contact: {
      title: "Get in Touch",
      generalInquiries: "General Inquiries",
      careers: "Careers",
      press: "Press",
      instagram: "Instagram",
      facebook: "Facebook",
      copyright: "© 2023 Pizza 4P's. All rights reserved.",
    },
  },
  vi: {
    navigation: {
      reservation: "ĐẶT BÀN",
      delivery: "GIAO HÀNG",
      career: "TUYỂN DỤNG",
      login: "ĐĂNG NHẬP",
      logout: "Đăng xuất",
      register: "ĐĂNG KÝ"
    },
    dashboard: {
      dashboard: "Bảng điều khiển",
      myOrders: "Đơn hàng của tôi",
      myReservations: "Đặt bàn của tôi",
      orderHistory: "Lịch sử đơn hàng",
      loyaltyProgram: "Chương trình khách hàng thân thiết",
      profile: "Hồ sơ",
      customers: "Khách hàng",
      menu: "Thực đơn",
      reservations: "Đặt bàn",
      delivery: "Giao hàng",
      statistics: "Thống kê",
      table: "Quản lý bàn",
      payment: "Thanh toán",
      settings: "Cài đặt",
      adminRole: "Quản trị viên",
      userRole: "Người dùng",
      welcomeBack: "Chào mừng trở lại",
      totalCustomers: "Tổng số khách hàng",
      reservationsToday: "Đặt bàn hôm nay",
      ordersToday: "Đơn hàng hôm nay",
      revenueToday: "Doanh thu hôm nay",
      loyaltyPoints: "Điểm thưởng",
      upcomingReservations: "Đặt bàn sắp tới",
      recentOrders: "Đơn hàng gần đây",
      memberSince: "Thành viên từ",
      quickActions: "Thao tác nhanh",
      frequentlyUsedActions: "Các thao tác và lối tắt thường dùng",
      manageReservations: "Quản lý đặt bàn",
      manageOrders: "Quản lý đơn hàng",
      updateMenu: "Cập nhật thực đơn",
      viewCustomers: "Xem khách hàng",
      makeReservation: "Đặt bàn",
      orderFood: "Đặt món",
      loyaltyRewards: "Phần thưởng thành viên",
      updateProfile: "Cập nhật hồ sơ",
      recentActivity: "Hoạt động gần đây",
      latestUpdates: "Cập nhật và hoạt động mới nhất",
      you: "Bạn",
    },
    home: {
      loading: "Đang tải...",
      country: "Việt Nam",
    },
    about: {
      title: "Câu chuyện của chúng tôi",
      paragraph1:
        "Pizza 4P's bắt đầu với một ước mơ đơn giản: mang lại hạnh phúc thông qua bánh pizza. Từ một lò nướng bánh pizza ở sân sau, chúng tôi đã phát triển thành một chuỗi nhà hàng được yêu thích.",
      paragraph2:
        'Tên của chúng tôi là viết tắt của "Platform of Personal Pizza for Peace" - phản ánh sứ mệnh tạo ra kết nối giữa mọi người thông qua ngôn ngữ chung của ẩm thực.',
      learnMore: "Tìm hiểu thêm",
    },
    concept: {
      title: "Từ nông trại đến bàn ăn",
      paragraph1:
        'Chúng tôi tin tưởng vào khái niệm "Từ nông trại đến bàn ăn", đảm bảo rằng chúng tôi chỉ sử dụng những nguyên liệu tươi ngon nhất. Nhiều nguyên liệu của chúng tôi được trồng trên các trang trại riêng, bao gồm cả phô mai đặc trưng được làm mới mỗi ngày.',
      paragraph2:
        "Cam kết về chất lượng và tính bền vững này là trọng tâm của mọi việc chúng tôi làm, từ những chiếc bánh pizza được chế biến tỉ mỉ đến những nhà hàng được thiết kế chu đáo.",
      discoverIngredients: "Khám phá nguyên liệu của chúng tôi",
    },
    locations: {
      title: "Địa điểm của chúng tôi",
      viewAll: "Xem tất cả",
      locations: "chi nhánh",
      statusOpen: "Đang mở cửa",
      statusClosed: "Đã đóng cửa",
      tables: "bàn trống",
      makeReservation: "Đặt bàn ngay"
    },
    restaurant: {
      title: "Nhà hàng của chúng tôi",
      paragraph1:
        "Golden Crust là nhà hàng được gắn sao Michelin, chuyên về nghệ thuật làm bánh pizza. Cam kết về chất lượng và sự xuất sắc đã giúp chúng tôi được công nhận là một trong những nhà hàng tốt nhất tại Việt Nam.",
      paragraph2:
        "Sứ mệnh của chúng tôi là tạo ra những trải nghiệm ẩm thực khó quên thông qua ẩm thực sáng tạo, dịch vụ xuất sắc và không gian ấm cúng, thân thiện. Chúng tôi tin rằng thức ăn không chỉ là nguồn dinh dưỡng, mà còn là một hình thức nghệ thuật kết nối mọi người.",
      vision: {
        title: "Tầm nhìn của chúng tôi",
        description:
          "Định nghĩa lại nghệ thuật làm bánh pizza và nâng cao nó lên tiêu chuẩn cao nhất của sự xuất sắc ẩm thực.",
      },
      values: {
        title: "Giá trị của chúng tôi",
        description: "Chất lượng, đổi mới, bền vững và tạo ra những kết nối ý nghĩa thông qua ẩm thực.",
      },
      promise: {
        title: "Cam kết của chúng tôi",
        description: "Một trải nghiệm ẩm thực phi thường làm hài lòng mọi giác quan và vượt quá mong đợi.",
      },
    },
    menu: {
      title: "Thực đơn nổi bật",
      description:
        "Khám phá tuyển chọn các món ăn đặc trưng của đầu bếp, được chế biến với những nguyên liệu tốt nhất và chuyên môn ẩm thực.",
      orderNow: "Đặt ngay",
      viewFullMenu: "Xem toàn bộ thực đơn",
    },
    gallery: {
      title: "Thư viện ảnh",
      description: "Trải nghiệm không gian và nghệ thuật của Golden Crust qua thư viện ảnh của chúng tôi.",
    },
    contact: {
      title: "Liên hệ với chúng tôi",
      generalInquiries: "Thông tin chung",
      careers: "Tuyển dụng",
      press: "Báo chí",
      instagram: "Instagram",
      facebook: "Facebook",
      copyright: "© 2023 Pizza 4P's. Bản quyền thuộc về chúng tôi.",
    },
  },
}

export const getTranslation = (lang: "en" | "vi") => translations[lang]
