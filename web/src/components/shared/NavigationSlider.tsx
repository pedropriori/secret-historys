'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'hot';
}

const navigationItems: NavigationItem[] = [
  { label: 'Início', href: '/', variant: 'default' },
  { label: 'VIP', href: '/vip', variant: 'primary' },
  { label: 'Grátis', href: '/categoria/gratis', variant: 'default' },
  { label: '🔥 Desconto', href: '/desconto', variant: 'hot' },
  { label: 'Ranking', href: '/ranking', variant: 'default' },
  { label: 'Tendência', href: '/#hot', variant: 'default' },
  { label: 'Gênero', href: '/categoria', variant: 'default' },
  { label: 'Completos', href: '/#completos', variant: 'default' },
];

export default function NavigationSlider() {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Mobile/Tablet: Slider com scroll */}
      <div className="lg:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 px-4 py-3">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200 shadow-sm hover:shadow-md active:scale-95
                ${item.variant === 'primary'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : item.variant === 'hot'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Navegação centralizada sem scroll */}
      <nav className="hidden lg:flex items-center justify-center gap-2 px-4 py-3">
        {navigationItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`
              px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-200 shadow-sm hover:shadow-md active:scale-95
              ${item.variant === 'primary'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                : item.variant === 'hot'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

