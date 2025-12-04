'use client';

import { useState } from 'react';
import { Menu, X, Coffee } from 'lucide-react';

interface HeaderProps {
  cafeName: string;
}

export default function Header({ cafeName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Menu', href: '#menu' },
    { name: 'Specials', href: '#specials' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#footer' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2] border-b border-[#E8E4DC]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Coffee className="w-8 h-8 text-[#8B4513]" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-xl md:text-2xl font-semibold text-[#2D2D2D]">
              {cafeName}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#4A4A4A] hover:text-[#8B4513] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#2D2D2D]" />
            ) : (
              <Menu className="w-6 h-6 text-[#2D2D2D]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#E8E4DC]">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#4A4A4A] hover:text-[#8B4513] transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
