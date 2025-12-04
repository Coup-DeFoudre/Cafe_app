import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/customer/HomePageClient';
import { DEFAULT_CAFE_SLUG } from '@/lib/constants';

// Revalidate every 30 seconds - menu data doesn't change frequently
export const revalidate = 30;

export default async function Home() {
  try {
    // Fetch cafe data
    const cafe = await prisma.cafe.findUnique({
      where: {
        slug: DEFAULT_CAFE_SLUG,
      },
      include: {
        settings: true,
      },
    });

    if (!cafe) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold mb-4 text-[#2D2D2D]">Cafe Not Found</h1>
            <p className="text-[#6B6B6B]">
              The cafe you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
      );
    }

    // Fetch menu data
    const categories = await prisma.menuCategory.findMany({
      where: {
        cafeId: cafe.id,
        isActive: true,
      },
      include: {
        menuItems: {
          where: {
            isAvailable: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Flatten all items for MenuBrowser
    const allItems = categories.flatMap(category =>
      category.menuItems.map(item => ({
        ...item,
        category: {
          name: category.name,
        },
      }))
    );

    // Add itemCount to categories for MenuBrowser
    const categoriesWithCount = categories.map(category => ({
      ...category,
      itemCount: category.menuItems.length,
    }));

    return (
      <HomePageClient 
        cafe={cafe}
        categories={categoriesWithCount}
        items={allItems}
      />
    );
  } catch (error) {
    console.error('Error loading page:', error);

    // If Prisma can't reach the database, render a static demo/fallback page
    const msg = String((error as any)?.message ?? error)
    const isDbError = msg.includes("Can't reach database server") ||
      ((error as any)?.name === 'PrismaClientInitializationError' || (error as any)?.name === 'PrismaClientRustPanicError');

    if (isDbError) {
      const demoCafe = {
        id: 'demo-cafe',
        name: 'Bean & Bloom',
        phone: null,
        email: null,
        address: '1224 Main Street, Anytown, USA',
        businessHours: null,
        socialLinks: null,
        logo: null,
        bannerImage: null,
        tagline: 'Fresh Brews. Cozy Moments. Blooming Flavors.',
        description: 'At Bean & Bloom Cafe, every cup tells a story. We blend rich coffee beans with blooming natural flavors to create a warm, relaxing cafe experience.',
        settings: {
          onlinePaymentEnabled: false
        }
      };

      const demoCategories = [
        {
          id: 'c-1',
          name: 'Fresh Coffee',
          description: 'Brewed to perfection',
          menuItems: [
            { id: 'i-1', name: 'Caramel Latte', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', isAvailable: true, categoryId: 'c-1' },
            { id: 'i-2', name: 'Cold Brew', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop', isAvailable: true, categoryId: 'c-1' }
          ],
          order: 0,
        },
        {
          id: 'c-2',
          name: 'Snacks & Bites',
          description: 'Light & delicious',
          menuItems: [
            { id: 'i-3', name: 'Chocolate Muffin', price: 79, isVeg: true, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop', isAvailable: true, categoryId: 'c-2' },
            { id: 'i-4', name: 'Margherita Pizza Slice', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', isAvailable: true, categoryId: 'c-2' }
          ],
          order: 1,
        },
        {
          id: 'c-3',
          name: 'Desserts',
          description: 'Sweet treats to enjoy',
          menuItems: [
            { id: 'i-5', name: 'Chocolate Brownie', price: 89, isVeg: true, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop', isAvailable: true, categoryId: 'c-3' }
          ],
          order: 2,
        },
        {
          id: 'c-4',
          name: 'Fresh Juices',
          description: 'Healthy & refreshing',
          menuItems: [
            { id: 'i-6', name: 'Orange Juice', price: 69, isVeg: true, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop', isAvailable: true, categoryId: 'c-4' }
          ],
          order: 3,
        }
      ];

      const allItems = demoCategories.flatMap(category =>
        category.menuItems.map(item => ({ ...item, category: { name: category.name } }))
      );

      const categoriesWithCount = demoCategories.map(cat => ({ ...cat, itemCount: cat.menuItems.length }));

      return (
        <div className="min-h-screen bg-[#FAF7F2]">
          <div className="bg-amber-50 border-b border-amber-200 py-3 text-center">
            <strong className="text-amber-800">Demo mode:</strong> Local database not reachable — showing static fallback.
          </div>
          <HomePageClient 
            cafe={demoCafe}
            categories={categoriesWithCount as any}
            items={allItems as any}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold mb-4 text-[#2D2D2D]">Something went wrong</h1>
          <p className="text-[#6B6B6B]">Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }
}
