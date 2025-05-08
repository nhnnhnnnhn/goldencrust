# Golden Crust - Michelin-Starred Pizza Restaurant

A sophisticated web application for Golden Crust, a high-end, Michelin-starred pizza restaurant chain. This project provides a complete digital experience for customers and administrators, featuring an elegant UI, online ordering, table reservations, and comprehensive management tools.

![Golden Crust](https://placeholder.com/golden-crust-hero)

## 🌟 Features

### Customer Features
- **Elegant Homepage**: Scrollable, full-screen sections showcasing the restaurant's story, concept, and locations
- **Online Reservation System**: Book tables with location, date, time, and guest selection
- **Food Delivery**: Browse menu, add items to cart, and place delivery orders
- **User Accounts**: Register, login, and manage personal profiles
- **Loyalty Program**: Earn and redeem points, track loyalty status and rewards
- **AI Assistant**: Chat with an AI assistant for quick information and help
- **Responsive Design**: Optimized for all device sizes

### Admin Features
- **Customer Management**: View and manage customer information and loyalty status
- **Menu Management**: Add, edit, and remove menu items
- **Reservation Management**: View and manage all restaurant reservations
- **Delivery Management**: Track and process delivery orders
- **Website Configuration**: Update content and settings

## 👥 User Roles

### Regular User
- Browse restaurant information
- Make table reservations
- Order food for delivery
- View order and reservation history
- Manage profile information
- Participate in loyalty program

### Admin
- All regular user capabilities
- Access to admin dashboard
- Manage customers, menu items, reservations, and orders
- Configure website settings
- View analytics and reports

## 📱 Pages & Functionality

### Homepage
- Full-screen scrollable sections
- Navigation dots for section indication
- Country selection for different locations
- Sections for About, Concept, Locations, Restaurant, Menu, Gallery, and Contact

### Reservation Page
- Two-step booking process
- Location selection with visual cards
- Date and time pickers
- Guest selection
- Contact information form
- Confirmation screen

### Delivery Page
- Categorized menu browsing
- Visual food cards with descriptions
- Interactive shopping cart
- Checkout process with delivery information
- Payment method selection
- Order confirmation with tracking

### User Dashboard
- Overview of recent activity
- Quick action shortcuts
- Profile management
- Reservation and order history
- Loyalty program status and rewards

### Admin Dashboard
- Customer management
- Menu management
- Reservation management
- Delivery order management
- Website configuration

### Login/Register
- Tab-based interface for login and registration
- Form validation
- Password visibility toggle
- Test accounts for easy access

## 🛠️ Technical Details

### Frontend
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with custom CSS modules
- **UI Components**: Custom components with shadcn/ui
- **State Management**: React hooks and context
- **Authentication**: Custom auth context (simulated for demo)

### Features
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Animations**: Smooth transitions and scroll effects
- **Form Handling**: Validation and multi-step forms
- **AI Chat**: Simulated AI assistant with typing indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/pizza-liem-khiet.git
cd pizza-liem-khiet
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔑 Test Accounts

For testing purposes, you can use the following accounts:

### Admin Account
- **Email**: admin@pizza.com
- **Password**: (Any password will work in this demo)
- **Role**: Admin
- **Features**: Full access to admin dashboard and management tools

### Regular User Account
- **Email**: user@pizza.com
- **Password**: (Any password will work in this demo)
- **Role**: User
- **Features**: Access to user dashboard, reservations, orders, and loyalty program

## 📂 Project Structure

\`\`\`
pizza-liem-khiet/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Dashboard pages (admin and user)
│   ├── delivery/         # Food delivery page
│   ├── login/            # Authentication pages
│   ├── reservation/      # Table reservation page
│   └── page.tsx          # Homepage
├── components/           # Reusable React components
│   ├── ui/               # UI components (shadcn)
│   └── ai-assistant.tsx  # AI chat assistant component
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── public/               # Static assets
└── styles/               # Global styles and CSS modules
\`\`\`

## 🎨 Design Philosophy

Pizza Liêm Khiết's design embodies the elegance and sophistication of a Michelin-starred restaurant:

- **Minimalist Aesthetic**: Clean layouts with ample white space
- **Sophisticated Color Scheme**: Primary blue and white palette with subtle accents
- **Typography**: Light, elegant font weights with careful spacing
- **Imagery**: High-quality visuals that showcase the culinary artistry
- **Interactions**: Smooth, subtle animations that enhance the luxury feel

## 📱 Responsive Design

The application is fully responsive across all device sizes:
- **Mobile**: Optimized layouts for small screens
- **Tablet**: Adjusted grid layouts and component sizes
- **Desktop**: Full experience with enhanced visual elements
- **Large Screens**: Optimized spacing and proportions

## 🔒 Authentication Flow

1. Users attempt to access protected pages (reservation, delivery)
2. If not logged in, redirected to login page with return URL
3. After authentication, automatically redirected back to original destination
4. User state persisted in local storage for session maintenance

## 🤖 AI Assistant

The AI assistant provides:
- Instant responses to common questions
- Restaurant information and FAQs
- Reservation and ordering help
- Expandable chat interface
- Typing indicators for a realistic experience

## 🔜 Future Enhancements

- **Online Payment Integration**: Real payment processing
- **Multi-language Support**: Localization for international customers
- **Advanced Booking System**: Table layout selection and special event bookings
- **Push Notifications**: Order status updates and promotional alerts
- **Customer Reviews**: Rating and feedback system
- **Social Media Integration**: Sharing and social login options

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Design inspiration from high-end restaurant websites
- Icons from Lucide React
- UI components based on shadcn/ui
