import { prisma } from '@/lib/prisma';
import HeroSection from '@/components/customer/HeroSection';
import MenuBrowser from '@/components/customer/MenuBrowser';
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
        <footer className="bg-muted py-12">
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
                  <p className="text-muted-foreground">
                    Address: {cafe.address}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Business Hours</h3>
                {cafe.businessHours ? (
                  <div className="text-muted-foreground">
                    {JSON.stringify(cafe.businessHours)}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Open daily 9:00 AM - 9:00 PM
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                {cafe.socialLinks ? (
                  <div className="text-muted-foreground">
                    {JSON.stringify(cafe.socialLinks)}
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }
}