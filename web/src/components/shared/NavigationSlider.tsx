'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'hot';
}

const navigationItems: NavigationItem[] = [
  { label: 'Início', href: '/', variant: 'default' },
  { label: 'VIP', href: 'https://pay.hotmart.com/K102185052A?bid=1759429789872', variant: 'primary' },
  { label: 'Grátis', href: '/categoria/gratis', variant: 'default' },
  { label: '🔥 Desconto', href: 'https://pay.hotmart.com/K102185052A?bid=1759429789872', variant: 'hot' },
  { label: 'Ranking', href: '/ranking', variant: 'default' },
  { label: 'Tendência', href: '/#hot', variant: 'default' },
  { label: 'Gênero', href: '/categoria', variant: 'default' },
  { label: 'Completos', href: '/#completos', variant: 'default' },
];

export default function NavigationSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="py-1">
      {/* Mobile/Tablet: Slider com scroll e controles */}
      <div className="lg:hidden relative">
        {/* Botão anterior */}
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${prevBtnDisabled
            ? 'opacity-30 cursor-not-allowed'
            : 'opacity-80 hover:opacity-100 hover:shadow-xl active:scale-95'
            }`}
          aria-label="Slide anterior"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Botão próximo */}
        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${nextBtnDisabled
            ? 'opacity-30 cursor-not-allowed'
            : 'opacity-80 hover:opacity-100 hover:shadow-xl active:scale-95'
            }`}
          aria-label="Próximo slide"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slider container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2 px-12 py-3">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
                  transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95
                  ${item.variant === 'primary'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 shadow-purple-200'
                    : item.variant === 'hot'
                      ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-700 shadow-orange-200'
                      : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 shadow-gray-100'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Navegação centralizada sem scroll */}
      <nav className="hidden lg:flex items-center justify-center gap-3 px-6 py-3">
        {navigationItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
              transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95
              ${item.variant === 'primary'
                ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 shadow-purple-200'
                : item.variant === 'hot'
                  ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-700 shadow-orange-200'
                  : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 shadow-gray-100'
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

