import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Category } from '../../types/product.types';

const getCategoryFallbackImage = (name: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('دجاج') || n.includes('chicken')) return '/images/categories/chicken.jpg';
  if (n.includes('حاشي') || n.includes('إبل') || n.includes('camel') || n.includes('جمل')) return '/images/categories/camel.jpg';
  if (n.includes('بقر') || n.includes('عجل') || n.includes('cow') || n.includes('beef')) return '/images/categories/cow.jpg';
  if (n.includes('نعيمي') || n.includes('حري') || n.includes('نجدي') || n.includes('ضأن') || n.includes('غنم') || n.includes('sheep')) return '/images/categories/sheep.jpg';
  if (n.includes('تيس') || n.includes('ماعز') || n.includes('goat') || n.includes('lamb')) return '/images/categories/lamb.jpg';
  return '/images/categories/meat.jpg';
};

export const CategoryGrid: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-3.5">
          <h3 className="text-lg md:text-xl font-black text-slate-900">
            {t('categories_title', 'الأقسام والتشكيلات')}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('categories_subtitle', 'اختر نوع الذبيحة المفضلة لديك')}
          </p>
        </div>

        {/* Strictly 4 categories on one row for tablet and desktop, 2 on compact mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4.5">
          {categories.map((cat) => {
            const displayName = isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name;
            const fallbackSrc = getCategoryFallbackImage(displayName);
            // Use photographic food asset if category is chicken with screenshot or empty
            const isChicken = displayName.includes('دجاج') || displayName.toLowerCase().includes('chicken');
            const imgSrc = (isChicken && (cat.imageUrl?.includes('/3/image') || !cat.imageUrl))
              ? fallbackSrc
              : (cat.imageUrl || fallbackSrc);

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories?cat=${cat.id}`)}
                className="relative rounded-2xl overflow-hidden border border-slate-200/80 hover:border-brand-500 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 group aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center bg-slate-900 select-none"
              >
                <img
                  src={imgSrc}
                  alt={displayName}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== fallbackSrc) {
                      target.src = fallbackSrc;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 group-hover:from-black/70 transition-colors" />
                <div className="relative z-10 p-2.5 sm:p-3 text-center w-full">
                  <span className="text-sm sm:text-base md:text-lg font-black text-white drop-shadow-md line-clamp-1">
                    {displayName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
