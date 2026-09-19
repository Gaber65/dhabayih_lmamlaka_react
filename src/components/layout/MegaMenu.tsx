import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { catalogApi } from '../../api/catalog';
import { Category, Product } from '../../types/product.types';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const [cats, prods] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts(),
        ]);
        if (isMounted) {
          setCategories(cats || []);
          setProducts(prods || []);
        }
      } catch (err) {
        if (isMounted) {
          setCategories([]);
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Group products by category ID
  const validCategories = categories.filter((c) => c && (c.id || c.name));

  // If no backend categories exist, do not render static dummy lists
  if (!loading && validCategories.length === 0 && products.length === 0) {
    return null;
  }

  const offerProduct = products.find((p) => p.isOnOffer || p.isOffer);

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full inset-x-0 bg-white border-b border-slate-200 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Main Category Columns (Real Backend Data Only) */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {validCategories.slice(0, 4).map((cat) => {
              const catName = isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name;
              const catProducts = products.filter(
                (p) => p.categoryId === cat.id || p.categoryName === cat.name
              );

              return (
                <div key={cat.id} className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span>{catName}</span>
                    </span>
                    <Link
                      to={`/categories?cat=${cat.id}`}
                      onClick={onClose}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      {t('all', 'الكل')}
                    </Link>
                  </h4>

                  <ul className="space-y-2 text-xs">
                    {catProducts.slice(0, 6).map((item) => {
                      const prodName = isAr ? item.nameAr || item.name : item.nameEn || item.name;

                      return (
                        <li key={item.id}>
                          <Link
                            to={`/product/${item.id}`}
                            onClick={onClose}
                            className="group flex items-center justify-between text-slate-600 hover:text-brand-600 py-1 font-medium transition"
                          >
                            <span className="group-hover:translate-x-0.5 transition-transform truncate max-w-[180px]">
                              {prodName}
                            </span>
                            {item.discountTag && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
                                {item.discountTag}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}

                    {catProducts.length === 0 && (
                      <li>
                        <Link
                          to={`/categories?cat=${cat.id}`}
                          onClick={onClose}
                          className="text-slate-400 text-xs hover:text-brand-600 block py-1"
                        >
                          {t('browse_category_items', 'تصفح منتجات القسم')}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* 5th Column: Real Offer or Quick Catalog Access */}
          <div className="md:col-span-1 bg-gradient-to-br from-brand-600 to-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 mb-2">
                <Flame className="w-3 h-3" />
                <span>{t('exclusive_deals', 'عروض حصرية')}</span>
              </div>
              <h4 className="text-sm font-black text-white leading-snug">
                {offerProduct
                  ? (isAr ? offerProduct.nameAr || offerProduct.name : offerProduct.nameEn || offerProduct.name)
                  : t('fresh_sacrifices_daily', 'ذبائح طازجة تُذبح يومياً')}
              </h4>
              <p className="text-[11px] text-slate-200 font-medium mt-1">
                {offerProduct
                  ? `${offerProduct.price} ${t('sar', 'ر.س')}`
                  : t('slaughter_prep_cold_desc', 'فحص بيطري وتجهيز فوري مع التوصيل المبرد لكافة أحياء الرياض.')}
              </p>
            </div>

            <Link
              to={offerProduct ? `/product/${offerProduct.id}` : '/categories'}
              onClick={onClose}
              className="mt-4 py-2 px-3 bg-white hover:bg-slate-100 text-brand-600 text-xs font-black rounded-xl text-center flex items-center justify-center gap-1 transition shadow-xs"
            >
              <span>{offerProduct ? t('view_details', 'عرض التفاصيل') : t('browse_catalog', 'تصفح القائمة')}</span>
              {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
