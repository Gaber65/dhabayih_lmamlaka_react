import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '../../types/product.types';

export const CategoryGrid: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              {t('categories_title', 'الأقسام والتشكيلات')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t('categories_subtitle', 'اختر نوع الذبيحة المفضلة لديك')}
            </p>
          </div>

          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition cursor-pointer"
          >
            <span>{t('all', 'عرض الكل')}</span>
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.map((cat) => {
            const displayName = isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name;

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories?cat=${cat.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-500 p-3 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer transition-all duration-200 group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2 p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img
                    src={cat.imageUrl}
                    alt={displayName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {displayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};