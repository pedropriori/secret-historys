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

interface HeroSliderProps {
  stories: Story[];
}

export default function HeroSlider({ stories }: HeroSliderProps) {
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

  if (!stories.length) return null;

  return (
    <div className="relative w-full">
      {/* Slider Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {stories.map((story) => (
            <div key={story.id} className="flex-[0_0_100%] min-w-0">
              <Link href={`/obra/${story.slug}`} className="block relative">
                {/* Hero Image with Overlay */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-gray-800 to-gray-900">
                  {story.coverUrl ? (
                    <>
                      <Image
                        src={story.coverUrl}
                        alt={story.title}
                        fill
                        className="object-cover opacity-50"
                        priority
                        sizes="100vw"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
                  )}

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                    <div className="max-w-2xl space-y-3">
                      {/* Categories */}
                      {story.categories && story.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.categories.slice(0, 3).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30"
                            >
                              {cat.category.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl leading-tight">
                        {story.title}
                      </h2>

                      {/* Synopsis */}
                      {story.synopsis && (
                        <p className="text-sm sm:text-base text-gray-200 line-clamp-2 drop-shadow-lg">
                          {story.synopsis}
                        </p>
                      )}

                      {/* CTA Button */}
                      <div className="flex items-center gap-4 pt-2">
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                          Leer Ahora
                        </button>
                        {story._count && (
                          <span className="text-sm text-gray-300">
                            {story._count.chapters} capítulos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {stories.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
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


