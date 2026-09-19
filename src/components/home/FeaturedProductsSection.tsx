import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types/product.types';
import { CartoonProductCard } from '../product/CartoonProductCard';

export const FeaturedProductsSection: React.FC<{
  title: string;
  subtitle?: string;
  products: Product[];
  categoryLink?: string;
}> = ({ title, subtitle, products, categoryLink }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  if (!products || products.length === 0) return null;

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {categoryLink && (
            <button
              onClick={() => navigate(categoryLink)}
              className="flex items-center gap-1 text-xs font-bold text-brand-900 hover:text-brand-950 transition cursor-pointer"
            >
              <span>{t('all', 'عرض الكل')}</span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <CartoonProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};