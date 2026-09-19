import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Product } from '../../types/product.types';
import { catalogApi } from '../../api/catalog';
import { getProductImage } from '../../utils/productImages';

export const FamilyBoxesSection: React.FC<{ products?: Product[] }> = ({ products: initialProducts }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  const [boxProducts, setBoxProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoxProducts = async () => {
      try {
        const all = initialProducts || (await catalogApi.getProducts());
        const filtered = all.filter(
          (p) =>
            p.name?.includes('بوكس') ||
            p.nameAr?.includes('بوكس') ||
            p.name?.includes('باقة') ||
            p.nameAr?.includes('باقة') ||
            p.description?.includes('بوكس')
        );
        setBoxProducts(filtered);
      } catch {
        setBoxProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxProducts();
  }, [initialProducts]);

  // If no real box products in the backend, do not render fake static data
  if (!loading && boxProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 mb-0.5">
              <Package className="w-4 h-4 text-brand-500" />
              <span>{t('savings_boxes_tag', 'بوكسات التوفير والتجهيز الخاص')}</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              {t('family_boxes_title', 'باقات وبوكسات اللحوم العائلية')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('family_boxes_subtitle', 'تشكيلات مقسمة وجاهزة للطبخ والشواء بأعلى جودة وتوفير حقيقي')}
            </p>
          </div>

          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition cursor-pointer"
          >
            <span>{t('view_all_products', 'عرض كافة المنتجات')}</span>
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boxProducts.map((p) => {
            const displayName = isAr ? p.nameAr || p.name : p.nameEn || p.name;
            const imgUrl = getProductImage(p);

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-500 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={imgUrl}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    {p.discountTag && (
                      <div className="absolute top-2 start-2 bg-brand-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                        {p.discountTag}
                      </div>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h4 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                    {displayName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {/* Price and Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        {p.price.toLocaleString('en-US')}
                      </span>
                      <span className="text-xs font-bold text-slate-600">{t('sar', 'ر.س')}</span>
                    </div>
                    {p.originalPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {p.originalPrice.toLocaleString('en-US')} {t('sar', 'ر.س')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${p.id}`);
                    }}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('order_now', 'طلب الآن')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
