import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Star, Sparkles, Package, ChevronLeft, ChevronRight, Tag, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/product.types';
import { CartoonProductCard } from '../product/CartoonProductCard';

interface TabbedProductShowcaseProps {
  featuredProducts?: Product[];
  bestSellers?: Product[];
  recommendedProducts?: Product[];
  onQuickView?: (product: Product) => void;
}

export const TabbedProductShowcase: React.FC<TabbedProductShowcaseProps> = ({
  featuredProducts = [],
  bestSellers = [],
  recommendedProducts = [],
  onQuickView,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  // Combine and deduplicate all real products
  const allProducts = useMemo(() => {
    const map = new Map<number, Product>();
    [...featuredProducts, ...bestSellers, ...recommendedProducts].forEach((p) => {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, [featuredProducts, bestSellers, recommendedProducts]);

  const [activeTab, setActiveTab] = useState<string>('all');

  const offersList = useMemo(() => allProducts.filter((p) => p.isOnOffer || p.isOffer || (p.discountTag && p.discountTag.length > 0)), [allProducts]);
  const naimiHariList = useMemo(() => allProducts.filter((p) => {
    const n = (p.nameAr || p.name || '').toLowerCase();
    return n.includes('نعيمي') || n.includes('حري') || n.includes('نجدي') || n.includes('naimi') || n.includes('hari');
  }), [allProducts]);
  const vealCamelList = useMemo(() => allProducts.filter((p) => {
    const n = (p.nameAr || p.name || '').toLowerCase();
    return n.includes('حاشي') || n.includes('عجل') || n.includes('تيس') || n.includes('مفروم') || n.includes('ستيك') || n.includes('camel') || n.includes('veal');
  }), [allProducts]);
  const boxesList = useMemo(() => allProducts.filter((p) => {
    const n = (p.nameAr || p.name || '').toLowerCase();
    return n.includes('بوكس') || n.includes('شواء') || n.includes('عائلي') || n.includes('box') || n.includes('bbq');
  }), [allProducts]);

  const tabs = [
    { id: 'all', label: t('all_products_tab', 'جميع المنتجات'), count: allProducts.length, icon: Sparkles },
    ...(offersList.length > 0 ? [{ id: 'offers', label: t('deals_offers_tab', 'عروض التوفير'), count: offersList.length, icon: Flame }] : []),
    ...(bestSellers.length > 0 ? [{ id: 'bestsellers', label: t('best_sellers_tab', 'الأكثر طلباً'), count: bestSellers.length, icon: Star }] : []),
    ...(naimiHariList.length > 0 ? [{ id: 'naimi_hari', label: t('naimi_hari_tab', 'النعيمي والحري'), count: naimiHariList.length, icon: Sparkles }] : []),
    ...(vealCamelList.length > 0 ? [{ id: 'veal_camel', label: t('veal_camel_tab', 'العجول والحاشي'), count: vealCamelList.length, icon: Sparkles }] : []),
    ...(boxesList.length > 0 ? [{ id: 'boxes', label: t('family_boxes_tab', 'بوكسات الشواء'), count: boxesList.length, icon: Package }] : []),
  ];

  const currentProducts = useMemo(() => {
    switch (activeTab) {
      case 'offers':
        return offersList;
      case 'bestsellers':
        return bestSellers.length > 0 ? bestSellers : allProducts;
      case 'naimi_hari':
        return naimiHariList.length > 0 ? naimiHariList : allProducts;
      case 'veal_camel':
        return vealCamelList.length > 0 ? vealCamelList : allProducts;
      case 'boxes':
        return boxesList.length > 0 ? boxesList : allProducts;
      default:
        return allProducts;
    }
  }, [activeTab, allProducts, offersList, bestSellers, naimiHariList, vealCamelList, boxesList]);

  if (allProducts.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>{t('most_popular_badge', 'سوق الذبائح واللحوم الطازجة')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {t('most_popular_headline', 'الأكثر طلباً وتفضيلاً')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {t('most_popular_desc', 'ذبائح بلدية طازجة تُرعى بعناية، وتُذبح بعد الطلب مباشرة تحت إشراف بيطري مع التوصيل المبرد')}
            </p>
          </div>

          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-brand-600 hover:text-brand-700 transition cursor-pointer self-start md:self-auto bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl border border-brand-200"
          >
            <span>{t('view_all_marketplace', 'تصفح كافة الذبائح')}</span>
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Tab Filters Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm scale-102'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Responsive Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pt-2">
          {currentProducts.slice(0, 8).map((product) => (
            <CartoonProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {/* Bottom CTA to browse more */}
        {currentProducts.length > 8 && (
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/categories')}
              className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>{t('load_more_sacrifices', 'عرض المزيد من المنتجات والذبائح')}</span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
