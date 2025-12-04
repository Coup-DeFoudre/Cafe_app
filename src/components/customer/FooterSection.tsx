'use client';

import { MapPin, Clock, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  website?: string | null;
}

interface FooterSectionProps {
  cafe: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    businessHours?: any;
    socialLinks?: SocialLinks | string | null;
  };
}

export default function FooterSection({ cafe }: FooterSectionProps) {
  const { name, address, businessHours, phone, email, socialLinks } = cafe;

  // Parse business hours if needed
  const hours = businessHours
    ? typeof businessHours === 'string'
      ? JSON.parse(businessHours)
      : businessHours
    : null;

  // Parse social links if needed
  const socials: SocialLinks | null = socialLinks
    ? typeof socialLinks === 'string'
      ? JSON.parse(socialLinks)
      : socialLinks
    : null;

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = hours?.[today];

  // Format business hours display
  const getHoursDisplay = () => {
    if (todayHours && !todayHours.closed) {
      return `${todayHours.open || '9:00 AM'} – ${todayHours.close || '9:00 PM'}`;
    }
    return 'Open 8 AM – 11 PM';
  };

  return (
    <footer id="footer" className="bg-[#F5F1EA]">
      {/* Location & Timings Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Location Info */}
            <div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#2D2D2D] mb-4">
                Location & Timings
              </h3>
              
              <div className="space-y-3">
                {address && (
                  <div className="flex items-start gap-3 text-[#6B6B6B]">
                    <MapPin className="w-5 h-5 mt-0.5 text-[#8B7355] flex-shrink-0" />
                    <p className="text-sm md:text-base">{address}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-[#6B6B6B]">
                  <Clock className="w-5 h-5 text-[#8B7355] flex-shrink-0" />
                  <p className="text-sm md:text-base">{getHoursDisplay()}</p>
                </div>

                {phone && (
                  <div className="flex items-center gap-3 text-[#6B6B6B]">
                    <Phone className="w-5 h-5 text-[#8B7355] flex-shrink-0" />
                    <a href={`tel:${phone}`} className="text-sm md:text-base hover:text-[#8B4513] transition-colors">
                      {phone}
                    </a>
                  </div>
                )}

                {email && (
                  <div className="flex items-center gap-3 text-[#6B6B6B]">
                    <Mail className="w-5 h-5 text-[#8B7355] flex-shrink-0" />
                    <a href={`mailto:${email}`} className="text-sm md:text-base hover:text-[#8B4513] transition-colors">
                      {email}
                    </a>
                  </div>
                )}
              </div>

              {/* Decorative element */}
              <div className="mt-6 text-4xl">
                ☕🌿
              </div>
            </div>

            {/* Right Side - Business Hours Table */}
            {hours && (
              <div>
                <h4 className="font-serif text-lg font-semibold text-[#2D2D2D] mb-4">
                  Business Hours
                </h4>
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayHours = hours[day];
                    const isToday = day === today;
                    return (
                      <div 
                        key={day} 
                        className={`flex justify-between text-sm ${isToday ? 'text-[#8B4513] font-medium' : 'text-[#6B6B6B]'}`}
                      >
                        <span className="capitalize">{day}</span>
                        <span>
                          {dayHours?.closed 
                            ? 'Closed' 
                            : dayHours 
                              ? `${dayHours.open || '9:00 AM'} - ${dayHours.close || '9:00 PM'}`
                              : '9:00 AM - 9:00 PM'
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#E8E4DC]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6B6B6B]">
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>
            
            {/* Social Links */}
            {socials && (socials.instagram || socials.facebook || socials.twitter) && (
              <div className="flex items-center gap-4">
                {socials.instagram && (
                  <a 
                    href={socials.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#6B6B6B] hover:text-[#8B4513] transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socials.facebook && (
                  <a 
                    href={socials.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#6B6B6B] hover:text-[#8B4513] transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socials.twitter && (
                  <a 
                    href={socials.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#6B6B6B] hover:text-[#8B4513] transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#4A4A4A] hover:text-[#8B4513] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-[#4A4A4A] hover:text-[#8B4513] transition-colors">
                Terms
              </a>
              <a href="#footer" className="text-sm text-[#4A4A4A] hover:text-[#8B4513] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
