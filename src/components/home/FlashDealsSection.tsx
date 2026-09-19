import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Clock, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '../../types/product.types';
import { catalogApi } from '../../api/catalog';
import { getProductImage } from '../../utils/productImages';

export const FlashDealsSection: React.FC<{ products?: Product[] }> = ({ products: initialProducts }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 38,
    seconds: 22,
  });

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts.filter((p) => p.isOnOffer || p.isOffer));
      setLoading(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        const all = await catalogApi.getProducts();
        const offers = all.filter((p) => p.isOnOffer || p.isOffer);
        setProducts(offers);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [initialProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // If no real products on offer from backend, return null (never show fake data)
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div
          style={{ backgroundColor: '#380004' }}
          className="bg-gradient-to-r from-[#2b0003] via-[#5c0b11] to-[#1c0002] border border-red-900/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Decorative Highlights */}
          <div className="absolute top-0 end-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header row with Countdown */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-red-900/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Flame className="w-6 h-6 fill-white text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {t('flash_deals_title', 'عروض وتخفيضات الفلاش اليومية')}
                  </h3>
                  <span className="bg-brand-500/40 text-rose-100 border border-brand-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {t('limited_time_tag', 'لفترة محدودة 🔥')}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-red-100 font-medium mt-0.5 opacity-90">
                  {t('flash_deals_subtitle', 'وفر أكثر مع أقوى الخصومات على الذبائح البلدية الطازجة')}
                </p>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2.5 self-start md:self-auto bg-black/30 border border-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-bold text-red-200">{t('deal_ends_in', 'ينتهي العرض خلال:')}</span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-black">
                <span className="bg-black/50 text-white px-2.5 py-1 rounded-xl border border-white/15 shadow-inner">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-red-300 font-bold">:</span>
                <span className="bg-black/50 text-white px-2.5 py-1 rounded-xl border border-white/15 shadow-inner">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-red-300 font-bold">:</span>
                <span className="bg-brand-500 text-white px-2.5 py-1 rounded-xl border border-brand-400 shadow-md">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Real Deals Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            {products.map((p) => {
              const displayName = isAr ? p.nameAr || p.name : p.nameEn || p.name;
              const imgUrl = getProductImage(p);

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-white rounded-2xl p-4 text-slate-900 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group border border-slate-100"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                      <img
                        src={imgUrl}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/images/onboarding/butchery.jpg';
                        }}
                      />
                      {p.discountTag && (
                        <div className="absolute top-2 start-2 bg-brand-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-md">
                          {p.discountTag}
                        </div>
                      )}
                    </div>

                    {/* Title & Weight */}
                    <h4 className="text-sm md:text-base font-black text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {displayName}
                    </h4>
                    <div className="text-xs text-slate-500 font-medium mt-1.5 flex items-center justify-between">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                        {p.weight || t('fresh_sacrifice', 'ذبيحة طازجة')}
                      </span>
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <span>•</span>
                        <span>{t('slaughtered_today', 'ذبح اليوم')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Price and Add button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg md:text-xl font-black text-slate-900 font-mono">
                          {p.price.toLocaleString('en-US')}
                        </span>
                        <span className="text-xs font-bold text-slate-600">{t('sar', 'ر.س')}</span>
                      </div>
                      {p.originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-mono block">
                          {p.originalPrice.toLocaleString('en-US')} {t('sar', 'ر.س')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${p.id}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>{t('order_now', 'اطلب الآن')}</span>
                      {isRtl ? <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Link */}
          <div className="relative z-10 pt-6 text-center">
            <button
              onClick={() => navigate('/offers')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
            >
              <span>{t('view_all_flash_deals', 'مشاهدة كافة العروض والتخفيضات الكبرى')}</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
