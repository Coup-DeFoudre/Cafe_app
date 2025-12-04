import { prisma } from '@/lib/prisma';
import HeroSection from '@/components/customer/HeroSection';
import MenuBrowser from '@/components/customer/MenuBrowser';
import { BusinessHoursDisplay } from '@/components/customer/BusinessHoursDisplay';
import { DEFAULT_CAFE_SLUG } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Cafe Not Found</h1>
            <p className="text-muted-foreground">
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
        ...item, // Include all original MenuItem properties
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
      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection cafe={cafe} />

        {/* Menu Section */}
        <section id="menu" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Menu</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our carefully crafted selection of beverages and snacks, 
                made with the finest ingredients.
              </p>
            </div>

            <MenuBrowser categories={categoriesWithCount} items={allItems} />
          </div>
        </section>

        {/* Footer Section */}
        <footer className="py-12" style={{ backgroundColor: 'hsl(40, 30%, 94%)' }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
                {cafe.phone && (
                  <p className="text-muted-foreground mb-2">
                    Phone: {cafe.phone}
                  </p>
                )}
                {cafe.email && (
                  <p className="text-muted-foreground mb-2">
                    Email: {cafe.email}
                  </p>
                )}
                {cafe.address && (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Address: {cafe.address}
                    </p>
                    <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.98!3d40.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzAwLjAiTiA3M8KwNTgnNDguMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(100%)' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Business Hours</h3>
                {cafe.businessHours ? (
                  <BusinessHoursDisplay 
                    businessHours={
                      typeof cafe.businessHours === 'string' 
                        ? JSON.parse(cafe.businessHours) 
                        : cafe.businessHours
                    } 
                  />
                ) : (
                  <p className="text-muted-foreground">
                    Open daily 9:00 AM - 9:00 PM
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                {cafe.socialLinks ? (
                  <div className="space-y-3">
                    {(() => {
                      const links = typeof cafe.socialLinks === 'string' 
                        ? JSON.parse(cafe.socialLinks) 
                        : cafe.socialLinks;
                      
                      const platforms = [
                        { key: 'instagram', name: 'Instagram', icon: '📷', color: 'hover:text-pink-500' },
                        { key: 'facebook', name: 'Facebook', icon: '📘', color: 'hover:text-blue-600' },
                        { key: 'x', name: 'X (Twitter)', icon: '🐦', color: 'hover:text-gray-800' },
                        { key: 'twitter', name: 'Twitter', icon: '🐦', color: 'hover:text-blue-400' },
                        { key: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'hover:text-green-500' },
                        { key: 'website', name: 'Website', icon: '🌐', color: 'hover:text-blue-500' }
                      ];
                      
                      return platforms.map(platform => {
                        const url = links[platform.key];
                        if (!url || url.trim() === '') return null;
                        
                        return (
                          <div key={platform.key} className="flex items-center gap-3">
                            <span className="text-xl">{platform.icon}</span>
                            <a 
                              href={url as string} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="transition-colors font-medium text-sm"
                              style={{ color: 'hsl(80, 20%, 45%)' }}
                            >
                              {platform.name}
                            </a>
                          </div>
                        );
                      }).filter(Boolean);
                    })()} 
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Connect with us on social media
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
              <p>&copy; 2024 {cafe.name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
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
        name: 'Sample Cafe (Demo)',
        phone: null,
        email: null,
        address: null,
        businessHours: null,
        socialLinks: null,
        logo: null,
        bannerImage: null,
        tagline: 'Demo mode — no database connected',
        description: 'You are viewing a static demo because the local database is not available.' ,
        settings: {
          onlinePaymentEnabled: false
        }
      };

      const demoCategories = [
        {
          id: 'c-1',
          name: 'Hot Drinks',
          menuItems: [
            { id: 'i-1', name: 'Espresso', price: 2.5, isVeg: true, image: '' },
            { id: 'i-2', name: 'Cappuccino', price: 3.5, isVeg: true, image: '' }
          ],
          order: 0,
        },
        {
          id: 'c-2',
          name: 'Bakery',
          menuItems: [
            { id: 'i-3', name: 'Croissant', price: 2.0, isVeg: true, image: '' }
          ],
          order: 1,
        }
      ];

      const allItems = demoCategories.flatMap(category =>
        category.menuItems.map(item => ({ ...item, category: { name: category.name } }))
      );

      const categoriesWithCount = demoCategories.map(cat => ({ ...cat, itemCount: cat.menuItems.length }));

      return (
        <div className="min-h-screen">
          <div className="bg-yellow-50 border-b border-yellow-200 py-3 text-center">
            <strong className="text-yellow-800">Demo mode:</strong> Local database not reachable — showing static fallback.
          </div>

          <HeroSection cafe={demoCafe} />

          <section id="menu" className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Menu (Demo)</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  This is a static demo menu to let the app run without a database.
                </p>
              </div>

              <MenuBrowser categories={categoriesWithCount as any} items={allItems as any} />
            </div>
          </section>

          <footer className="bg-muted py-12">
            <div className="container mx-auto px-4">
              <div className="text-center text-muted-foreground">Local demo — database connection required for full functionality.</div>
            </div>
          </footer>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground">Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }
}