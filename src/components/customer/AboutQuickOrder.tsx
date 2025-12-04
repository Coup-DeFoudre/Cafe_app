'use client';

import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
}

interface AboutQuickOrderProps {
  cafeName: string;
  description?: string | null;
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export default function AboutQuickOrder({
  cafeName,
  description,
  categories,
  onCategoryClick,
}: AboutQuickOrderProps) {
  // Show up to 3 categories for quick order
  const quickCategories = categories.slice(0, 3);

  return (
    <section id="about" className="py-12 px-4 bg-[#FAF7F2]">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* About Section */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-4">
              About {cafeName}
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed mb-6">
              {description ||
                `At ${cafeName}, every cup tells a story. We blend rich coffee beans with blooming natural flavors to create a warm, relaxing cafe experience.`}
            </p>
            <a href="#footer">
              <Button
                variant="outline"
                className="rounded-full border-[#3D3D3D] text-[#3D3D3D] hover:bg-[#3D3D3D] hover:text-white px-6"
              >
                Contact Us
              </Button>
            </a>
          </div>

          {/* Quick Order Section */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-6">
              Quick Order
            </h2>
            {quickCategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {quickCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryClick(category.id)}
                    className="px-5 py-3 bg-[#F5F1EA] text-[#3D3D3D] font-medium rounded-full hover:bg-[#E8E4DC] transition-colors text-sm md:text-base"
                  >
                    {category.name}
                  </button>
                ))}
                <button
                  onClick={() => onCategoryClick('all')}
                  className="px-5 py-3 bg-[#3D3D3D] text-white font-medium rounded-full hover:bg-[#2D2D2D] transition-colors text-sm md:text-base"
                >
                  View All
                </button>
              </div>
            ) : (
              <p className="text-[#6B6B6B]">No categories available</p>
            )}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E8E4DC]">
              <span className="px-5 py-3 bg-[#F5F1EA] text-[#3D3D3D] font-medium rounded-full text-sm">
                Student Discount
              </span>
              <span className="px-5 py-3 bg-[#8B4513] text-white font-bold rounded-full text-sm">
                10% OFF
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
