'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';

interface Story {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  synopsis: string | null;
  categories?: Array<{
    category: {
      name: string;
    };
  }>;
  _count?: {
    chapters: number;
  };
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
}

interface HeroSliderProps {
  stories: Story[];
  banners?: Banner[];
}

export default function HeroSlider({ stories, banners = [] }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Combinar banners e stories: banners primeiro, depois stories para completar
  const sliderItems = [...banners, ...stories];
  const isBannerMode = banners.length > 0;

  if (!sliderItems.length) return null;

  return (
    <div className="relative w-full">
      {/* Slider Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sliderItems.map((item, index) => {
            // Verificar se é banner baseado na presença de propriedades específicas de banner
            const isBanner = 'linkUrl' in item && 'imageUrl' in item && !('slug' in item);
            const banner = isBanner ? item as Banner : null;
            const story = !isBanner ? item as Story : null;

            return (
              <div key={item.id} className="flex-[0_0_100%] min-w-0">
                {isBanner ? (
                  // Renderizar Banner
                  <div className="block relative">
                    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-gray-800 to-gray-900">
                      <Image
                        src={banner!.imageUrl}
                        alt={banner!.title}
                        fill
                        className="object-cover opacity-60"
                        priority={index === 0}
                        sizes="100vw"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pb-16">
                        <div className="max-w-2xl space-y-2">
                          {/* Subtitle */}
                          {banner!.subtitle && (
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 text-sm font-medium bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
                                {banner!.subtitle}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                            {banner!.title}
                          </h2>

                          {/* Description */}
                          {banner!.description && (
                            <p className="text-base sm:text-lg text-gray-200 line-clamp-2 drop-shadow-lg" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
                              {banner!.description}
                            </p>
                          )}

                          {/* CTA Button */}
                          <div className="flex items-center gap-3 pt-1">
                            {banner!.linkUrl ? (
                              <Link
                                href={banner!.linkUrl}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-sm"
                                style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}
                              >
                                {banner!.linkText || 'Saiba Mais'}
                              </Link>
                            ) : (
                              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-sm" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
                                {banner!.linkText || 'Saiba Mais'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Renderizar Story (modo original)
                  <Link href={`/obra/${story!.slug}`} className="block relative">
                    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-gray-800 to-gray-900">
                      {story!.coverUrl ? (
                        <>
                          <Image
                            src={story!.coverUrl}
                            alt={story!.title}
                            fill
                            className="object-cover opacity-60"
                            priority={index === 0}
                            sizes="100vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
                      )}

                      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pb-16">
                        <div className="max-w-2xl space-y-2">
                          {story!.categories && story!.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {story!.categories.slice(0, 3).map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 text-sm font-medium bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}
                                >
                                  {cat.category.name}
                                </span>
                              ))}
                            </div>
                          )}

                          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                            {story!.title}
                          </h2>

                          {story!.synopsis && (
                            <p className="text-base sm:text-lg text-gray-200 line-clamp-2 drop-shadow-lg" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
                              {story!.synopsis}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-1">
                            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-sm" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
                              Leer Ahora
                            </button>
                            {story!._count && (
                              <span className="text-sm text-gray-300">
                                {story!._count.chapters} capítulos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      {sliderItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {sliderItems.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                ? 'bg-pink-500 w-8'
                : 'bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


