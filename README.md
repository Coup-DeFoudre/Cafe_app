# Cafe Ordering System - Multi-tenant Platform

A modern, scalable cafe ordering system built with Next.js 14, TypeScript, and PostgreSQL. This platform allows multiple cafes to manage their own customizable ordering systems with complete data isolation.

## ✨ Features

- **Multi-tenant Architecture** - Each cafe gets their own subdomain and isolated data
- **Menu Management** - Full CRUD operations for menu categories and items
- **Order Management** - Real-time order dashboard with WebSocket-based live updates, filters, and search
- **Customer Management** - Track customer orders and preferences
- **Admin Dashboard** - Comprehensive admin panel for cafe owners
  - **Settings Management** - Configure cafe information, branding (logo/banner), business hours, social media links, payment settings (QR code/UPI), delivery options, tax settings, and theme colors
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Theme Customization** - Each cafe can customize their brand colors and styling
- **Payment Integration** - Support for cash and online payments
- **Real-time Updates** - Live order status updates for both customers and staff

## 🔴 Real-time Features

The system includes WebSocket-based real-time communication powered by Pusher:

### Features
- **Live Order Notifications** - Instant notifications for admin when new orders arrive
- **Real-time Status Tracking** - Customers see order status updates live without refreshing
- **Auto Reconnection** - Automatic reconnection with exponential backoff (max 5 attempts)
- **Multi-tenant Isolation** - Secure channel-based isolation per cafe
- **Sound Alerts** - Audio notifications for new orders (with mute toggle)
- **Connection Indicators** - Visual feedback showing live connection status

### How It Works
- Admin dashboard receives instant notifications when customers place orders
- Customers see their order status update in real-time on the confirmation page
- All updates happen via WebSocket connections (no polling)
- Private channels ensure cafes only receive their own events
- Graceful fallback to polling if Pusher is not configured

## 🍽️ Menu Management

The system includes a comprehensive menu management interface with advanced features:

### Features
- **Drag-and-Drop Ordering** - Intuitive reordering of categories and menu items
- **Image Upload** - Cloudinary-powered image management with automatic optimization
- **Category Management** - Organize menu items into customizable categories
- **Advanced Filtering** - Search, filter by category, and availability status
- **Real-time Updates** - Immediate UI updates with optimistic rendering
- **Dietary Indicators** - Vegetarian/Non-vegetarian badges for dietary preferences

### Setup Instructions
1. **Install required packages** (already included):
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities cloudinary
   ```

2. **Configure Cloudinary** - Add these environment variables:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### API Endpoints

#### Categories
- `GET /api/admin/menu/categories` - List all categories
- `POST /api/admin/menu/categories` - Create new category
- `PATCH /api/admin/menu/categories/[id]` - Update category
- `DELETE /api/admin/menu/categories/[id]` - Delete category
- `PATCH /api/admin/menu/categories/reorder` - Reorder categories

#### Menu Items
- `GET /api/admin/menu/items` - List all menu items
- `POST /api/admin/menu/items` - Create new menu item
- `PATCH /api/admin/menu/items/[id]` - Update menu item
- `DELETE /api/admin/menu/items/[id]` - Delete menu item
- `PATCH /api/admin/menu/items/reorder` - Reorder items within category

#### File Upload
- `POST /api/admin/upload` - Upload images to Cloudinary (5MB max, auto-optimization)

### Settings API

#### Settings Management
- `GET /api/admin/settings` - Fetch cafe and settings data
- `PATCH /api/admin/settings` - Update settings (supports multiple types: cafeInfo, branding, businessHours, socialLinks, themeColors, payment, delivery, tax)

### Usage Tips
- **Reordering**: Only available when viewing a specific category without search filters
- **Images**: Automatically optimized to 800x800px, quality:auto, WebP format when possible
- **Categories**: Must be active to show items to customers
- **Items**: Separate controls for availability and activation status

### Constraints
- Image uploads limited to 5MB
- Drag-and-drop reordering requires category-specific view
- All operations require admin authentication and cafe ownership verification

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (for admin panel)
- **File Upload**: Cloudinary
- **Real-time Communication**: Pusher (WebSocket-based events)
- **Styling**: Tailwind CSS with CSS Variables
- **Fonts**: Inter (Google Fonts)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cafe-ordering-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/cafe_ordering?schema=public"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Pusher (Required for Real-time Features)
   # Get credentials from https://pusher.com dashboard
   # 1. Sign up at pusher.com
   # 2. Create a new Channels app
   # 3. Copy credentials from dashboard
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_KEY="your-pusher-key"
   PUSHER_SECRET="your-pusher-secret"
   PUSHER_CLUSTER="your-pusher-cluster"
   # Client-side variables (use same values as above)
   NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
   NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
   
   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Setup

### Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE cafe_ordering;
   ```
3. Update the `DATABASE_URL` in your `.env` file

### Cloud Database (Recommended)

You can use cloud providers like:
- **Supabase** (Free tier available)
- **PlanetScale** (MySQL-compatible)
- **Railway** (PostgreSQL)
- **Heroku Postgres**

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── lib/                  # Utility functions
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript definitions
    └── index.ts          # Type definitions

prisma/
└── schema.prisma         # Database schema

public/                   # Static assets
```

## 🧞 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with sample data |

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application URL for NextAuth | ✅ |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public application URL | ✅ |
| `PUSHER_APP_ID` | Pusher app ID (for real-time) | ❌ |
| `RESEND_API_KEY` | Resend API key (for emails) | ❌ |

## 🔐 Admin Panel

The admin panel provides comprehensive management tools for cafe owners and staff.

### Access
- **Login URL**: `/admin/login`
- **Default Credentials** (after running seed):
  - Email: `owner@samplecafe.com`
  - Password: `admin123`

### Features Available Now
- **Dashboard Overview**: Real-time statistics for orders, revenue, and customers
- **Order Management**: View and track all customer orders
- **Analytics**: Popular items and revenue tracking
- **Session Management**: Secure authentication with logout functionality
- **Settings Management**: Comprehensive settings interface with multiple tabs:
  - **General**: Configure cafe information (name, tagline, description, contact details, address)
  - **Branding**: Upload and manage logo and banner images via Cloudinary
  - **Business Hours**: Set day-wise opening hours with open/close times and closed toggles
  - **Social Links**: Add social media links (Facebook, Instagram, Twitter, WhatsApp, Website)
  - **Payment**: Configure online payment options (UPI ID, payment QR code upload), tax settings
  - **Delivery**: Enable/disable delivery, set delivery charges and minimum order value
  - **Theme**: Customize brand colors (primary, secondary, accent) with color picker and hex input
  - Settings are cafe-scoped and affect customer-facing features

### Features Coming Soon
- **Menu Management**: Add, edit, and organize menu items and categories
- **Customer Management**: View customer profiles and order history  
- **Staff Management**: Add additional admin users with role-based access
- **Reports**: Advanced analytics and sales reports

### Setup Required Environment Variables
NextAuth.js requires these environment variables:

```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-here"
```

Generate a secure secret with:
```bash
openssl rand -base64 32
```

### Creating Additional Admin Accounts
To create additional admin accounts, add entries to the `Admin` table via Prisma Studio or database directly:

```sql
INSERT INTO "Admin" ("email", "password", "name", "role", "cafeId", "isActive")
VALUES ('admin@yourcafe.com', 'hashed_password', 'Admin Name', 'ADMIN', 'your_cafe_id', true);
```

## 🏗️ Multi-tenancy Architecture

The platform uses subdomain-based multi-tenancy:

- Each cafe gets a unique subdomain (e.g., `cafe-name.yourdomain.com`)
- Complete data isolation between cafes
- Customizable themes and branding per cafe
- Shared codebase with tenant-specific configurations

### Database Schema

The schema includes the following main entities:

- **Cafe** - Tenant information and settings
- **MenuCategory** - Menu organization
- **MenuItem** - Individual menu items with customizations
- **Order** - Customer orders with items and status
- **Customer** - Customer information and history
- **Settings** - Cafe-specific configuration
- **Admin** - Cafe staff and permissions

## 🎨 UI Components

This project uses [Shadcn/ui](https://ui.shadcn.com/) components built on top of Radix UI primitives. Components can be added using:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# etc.
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages, screenshots, and steps to reproduce

## 🔧 Troubleshooting

### Common Issues

#### Real-time Updates Not Working
- **Check Pusher credentials**: Verify all Pusher environment variables are set correctly in `.env`
- **Check Pusher dashboard**: Visit pusher.com dashboard to view connection stats and debug logs
- **Check browser console**: Look for Pusher connection errors in the browser developer console
- **Verify channel names**: Ensure channel naming matches the pattern `private-cafe-{cafeId}`

#### Connection Keeps Disconnecting
- **Check Pusher plan limits**: Free tier has connection and message limits - upgrade if needed
- **Network issues**: Check if firewall or proxy is blocking WebSocket connections
- **Check app configuration**: Verify `forceTLS: true` and cluster settings match Pusher dashboard

#### Events Not Received
- **Verify channel subscription**: Check that the correct channel is being subscribed to
- **Check event names**: Ensure event names match exactly (`order-created`, `order-status-updated`)
- **Browser console errors**: Look for JavaScript errors that might prevent event handlers from running
- **Server-side errors**: Check server logs for Pusher API errors during event triggering

#### Database Connection Issues
- Verify DATABASE_URL format and credentials
- Ensure PostgreSQL is running
- Check network connectivity to database server

#### Image Upload Failures
- Verify Cloudinary credentials are correct
- Check file size (must be under 5MB)
- Ensure internet connection for Cloudinary API access

## 🎯 Roadmap

- [x] **Phase 1**: Basic menu and order management ✅
- [x] **Phase 2**: Customer-facing ordering interface ✅
- [ ] **Phase 3**: Admin dashboard and analytics
- [ ] **Phase 4**: Payment integration
- [ ] **Phase 5**: Real-time notifications
- [ ] **Phase 6**: Mobile app development

## 🌟 Features Implemented

### Phase 2: Customer Website - Menu Display & Browsing

✅ **Homepage with Hero Section**
- Cafe branding display (logo, banner, tagline, description)
- Responsive hero section with call-to-action
- Custom theme color support

✅ **Menu Browsing System**
- Category-based navigation using tabs
- Menu item cards with images, descriptions, and pricing
- Veg/Non-veg indicators with color-coded badges
- Availability status display

✅ **Advanced Filtering**
- Search functionality to filter menu items by name
- Filter by category (All, Beverages, Snacks, etc.)
- Filter by dietary preference (All, Veg Only, Non-Veg)
- Real-time filtering with debounced search

✅ **User Experience Features**
- Fully responsive design optimized for mobile, tablet, and desktop
- Toast notifications for user feedback
- Loading states and empty state handling
- Smooth animations and hover effects

### Getting Started

1. **Seed the Database**
   ```bash
   npm run db:seed
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **View the Website**
   - Visit `http://localhost:3000` to see the customer-facing website
   - The demo uses 'sample-cafe' from the seed data

---

Built with ❤️ using Next.js and modern web technologies.