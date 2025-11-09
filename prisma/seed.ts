import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a sample cafe
  const cafe = await prisma.cafe.create({
    data: {
      name: 'Sample Cafe',
      subdomain: 'sample',
      slug: 'sample-cafe',
      logo: null,
      bannerImage: null,
      tagline: 'Best coffee in town',
      description: 'A cozy place for coffee lovers.',
      phone: '1234567890',
      email: 'info@samplecafe.com',
      address: '123 Main St, City',
      businessHours: {
        monday: { open: '08:00', close: '20:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: false }
      },
      socialLinks: { facebook: 'https://facebook.com/samplecafe' },
      themeColors: { primary: '#1e293b', secondary: '#fbbf24' },
      isActive: true,
    }
  })

  // Create settings
  await prisma.settings.create({
    data: {
      cafeId: cafe.id,
      deliveryEnabled: true,
      deliveryCharge: 30,
      minOrderValue: 100,
      taxRate: 5,
      taxEnabled: true,
      onlinePaymentEnabled: true,
      paymentQrCode: null,
      upiId: null,
      currency: 'INR',
      currencySymbol: '₹',
    }
  })

  // Create menu categories
  const beverageCategory = await prisma.menuCategory.create({
    data: {
      cafeId: cafe.id,
      name: 'Beverages',
      description: 'Hot and cold drinks',
      order: 1,
      isActive: true,
    }
  })

  const snacksCategory = await prisma.menuCategory.create({
    data: {
      cafeId: cafe.id,
      name: 'Snacks',
      description: 'Quick bites',
      order: 2,
      isActive: true,
    }
  })

  // Create menu items for Beverages
  await prisma.menuItem.createMany({
    data: [
      {
        cafeId: cafe.id,
        categoryId: beverageCategory.id,
        name: 'Cappuccino',
        description: 'Classic Italian coffee with steamed milk and foam',
        price: 120,
        isAvailable: true,
        isVeg: true,
        order: 1
      },
      {
        cafeId: cafe.id,
        categoryId: beverageCategory.id,
        name: 'Iced Latte',
        description: 'Chilled espresso with cold milk',
        price: 140,
        isAvailable: true,
        isVeg: true,
        order: 2
      },
      {
        cafeId: cafe.id,
        categoryId: beverageCategory.id,
        name: 'Green Tea',
        description: 'Fresh green tea with antioxidants',
        price: 80,
        isAvailable: true,
        isVeg: true,
        order: 3
      },
      {
        cafeId: cafe.id,
        categoryId: beverageCategory.id,
        name: 'Cold Coffee',
        description: 'Iced coffee with milk and ice cream',
        price: 160,
        isAvailable: true,
        isVeg: true,
        order: 4
      }
    ]
  })

  // Create menu items for Snacks
  await prisma.menuItem.createMany({
    data: [
      {
        cafeId: cafe.id,
        categoryId: snacksCategory.id,
        name: 'Veg Sandwich',
        description: 'Fresh vegetables and cheese in toasted bread',
        price: 90,
        isAvailable: true,
        isVeg: true,
        order: 1
      },
      {
        cafeId: cafe.id,
        categoryId: snacksCategory.id,
        name: 'Chicken Burger',
        description: 'Grilled chicken patty with lettuce and mayo',
        price: 180,
        isAvailable: true,
        isVeg: false,
        order: 2
      },
      {
        cafeId: cafe.id,
        categoryId: snacksCategory.id,
        name: 'French Fries',
        description: 'Crispy golden fries with seasoning',
        price: 70,
        isAvailable: true,
        isVeg: true,
        order: 3
      },
      {
        cafeId: cafe.id,
        categoryId: snacksCategory.id,
        name: 'Fish Fingers',
        description: 'Crispy fish fingers with tartar sauce',
        price: 200,
        isAvailable: false,
        isVeg: false,
        order: 4
      }
    ]
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.admin.create({
    data: {
      cafeId: cafe.id,
      email: 'owner@samplecafe.com',
      password: hashedPassword,
      name: 'Cafe Owner',
      role: 'OWNER',
      isActive: true
    }
  })

  console.log('✅ Seed data created successfully!')
  console.log(`Cafe: ${cafe.name} (${cafe.slug})`)
  console.log(`Categories: Beverages, Snacks`)
  console.log(`Menu Items: 8 items total`)
  console.log(`Admin: owner@samplecafe.com (password: admin123)`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })