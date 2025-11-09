import Image from 'next/image';
import { cn } from '@/lib/utils';
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
  const { name, tagline, description, logo, bannerImage, themeColors } = cafe;

  return (
    <section className="relative min-h-[60vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {bannerImage ? (
        <div className="absolute inset-0">
          <Image
            src={bannerImage}
            alt={`${name} banner`}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"
          style={
            themeColors?.primary
              ? {
                  background: `linear-gradient(to bottom right, ${themeColors.primary}, ${
                    themeColors.secondary || themeColors.primary
                  })`,
                }
              : undefined
          }
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src={logo || PLACEHOLDER_IMAGES.logo}
                alt={`${name} logo`}
                fill
                className="object-contain rounded-full bg-white/10 backdrop-blur-sm p-2"
              />
            </div>
          </div>

          {/* Cafe Name */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {name}
          </h1>

          {/* Tagline */}
          {tagline && (
            <p className="text-xl md:text-2xl font-medium text-white/90">
              {tagline}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA Button */}
          <div className="pt-6">
            <a
              href="#menu"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              View Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}