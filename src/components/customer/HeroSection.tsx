import Image from 'next/image';
import { PLACEHOLDER_IMAGES } from '@/lib/constants';

interface HeroSectionProps {
  cafe: {
    name: string;
    tagline?: string | null;
    description?: string | null;
    logo?: string | null;
    bannerImage?: string | null;
    themeColors?: any;
  };
}

export default function HeroSection({ cafe }: HeroSectionProps) {
  const { name, tagline, bannerImage } = cafe;

  return (
    <section className="relative bg-[#FAF7F2] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden my-6 bg-gradient-to-r from-[#4A3C2D] to-[#6B5D4D] min-h-[400px] md:min-h-[450px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={bannerImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=600&fit=crop'}
              alt={`${name} banner`}
              fill
              className="object-cover opacity-40"
              priority
            />
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col md:flex-row items-center h-full min-h-[400px] md:min-h-[450px]">
            {/* Left Side - Text Content */}
            <div className="flex-1 p-8 md:p-12 lg:p-16 text-white">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Welcome to<br />
                <span className="text-white">{name}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                {tagline || 'Fresh Brews. Cozy Moments.\nBlooming Flavors.'}
              </p>

              <a
                href="#menu"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-[#3D3D3D] bg-[#F5F1EA] hover:bg-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Order Now
              </a>
            </div>

            {/* Right Side - Coffee Cup Image */}
            <div className="relative w-full md:w-1/2 lg:w-2/5 h-[250px] md:h-full flex items-end justify-center md:justify-end">
              <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] translate-y-8 md:translate-y-12">
                <Image
                  src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&h=500&fit=crop"
                  alt="Coffee cup"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
