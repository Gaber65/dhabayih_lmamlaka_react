import React, { useState, useEffect } from 'react';
import { Banner } from '../../types/home.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultBanners: Banner[] = [
  {
    id: 1,
    name: 'ذبائح نعيمي بلدي طازجة',
    imageUrl: '/images/onboarding/livestock.jpg',
    linkUrl: '/categories?cat=nuaimi',
  },
  {
    id: 2,
    name: 'توصيل مبرد طازج لباب بيتك',
    imageUrl: '/images/onboarding/delivery.jpg',
    linkUrl: '/categories',
  },
  {
    id: 3,
    name: 'قصابة وتفصيل فاخر حسب الطلب',
    imageUrl: '/images/onboarding/butchery.jpg',
    linkUrl: '/categories?offer=true',
  },
];

export const BannersCarousel: React.FC<{ banners?: Banner[] }> = ({ banners = [] }) => {
  const navigate = useNavigate();
  const activeBanners = banners && banners.length > 0 ? banners : defaultBanners;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 pt-4 pb-2">
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/9] min-h-[160px] max-h-[360px] rounded-2xl overflow-hidden shadow-sm bg-slate-100 group border border-slate-200">
        {activeBanners.map((b, idx) => (
          <div
            onClick={() => {
              const offerId = b.offerId || (b as any).offer_id;
              if (offerId) {
                navigate(`/offers?offerId=${offerId}`);
              } else if (b.linkUrl) {
                navigate(b.linkUrl);
              } else {
                navigate('/offers');
              }
            }}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out cursor-pointer ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={b.imageUrl}
              alt={b.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/images/onboarding/livestock.jpg';
              }}
            />
            {/* Subtle Gradient & Banner Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4 md:p-8">
              <div className="text-white space-y-1">
                <span className="inline-block bg-brand-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md mb-1">
                  عروض ذبائح المملكة
                </span>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white drop-shadow-md">
                  {b.name}
                </h3>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
              }}
              className="absolute start-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
              }}
              className="absolute end-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-1.5">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-white shadow' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};