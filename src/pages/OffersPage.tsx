import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Tag, Clock, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { Product } from '../types/product.types';
import { Offer } from '../types/home.types';
import { offersApi } from '../api/offers';
import { catalogApi } from '../api/catalog';
import { CartoonProductCard } from '../components/product/CartoonProductCard';
import { CartoonLoadingState } from '../components/common/CartoonLoadingState';
import { CartoonEmptyState } from '../components/common/CartoonEmptyState';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

export const OffersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeOfferIdParam = searchParams.get('offerId');

  const { applyCoupon } = useCartStore();
  const { addToast } = useUIStore();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<number | 'all'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCoupon, setInputCoupon] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [offersList, allProducts] = await Promise.all([
          offersApi.getOffers(),
          catalogApi.getProducts(),
        ]);

        setOffers(offersList);

        if (activeOfferIdParam) {
          const matched = offersList.find((o) => o.id === Number(activeOfferIdParam));
          if (matched) {
            setSelectedOfferId(matched.id);
          }
        }

        // Filter products that have active offers
        const onOfferProducts = allProducts.filter((p) => p.isOnOffer || p.isOffer || (p.offerPrice && p.price && p.offerPrice < p.price));
        setProducts(onOfferProducts);
      } catch (err) {
        console.error('Failed to load offers page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeOfferIdParam]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setApplying(true);
    const res = await applyCoupon(inputCoupon.trim());
    setApplying(false);

    if (res.success) {
      addToast({
        type: 'success',
        title: 'كوبون الخصم',
        message: res.message,
      });
      setInputCoupon('');
    } else {
      addToast({
        type: 'error',
        title: 'خطأ',
        message: res.message,
      });
    }
  };

  // Find active selected offer details
  const activeOffer = offers.find((o) => o.id === selectedOfferId);

  // Filter products by selected offer or show all on-offer products
  const displayedProducts = selectedOfferId === 'all'
    ? products
    : (activeOffer?.products && activeOffer.products.length > 0
        ? activeOffer.products
        : products);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 pb-16">
      {/* 1. Header Campaign Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-brand-950 via-brand-900 to-rose-950 text-white p-6 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-start">
            <div className="inline-flex items-center gap-2 bg-rose-600/30 text-rose-300 border border-rose-500/40 px-3.5 py-1 rounded-full text-xs font-bold">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{activeOffer ? activeOffer.badgeText || 'عرض حصري' : 'عروض وتخفيضات ذبائح المملكة'}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              {activeOffer ? activeOffer.name : 'أقوى العروض والتخفيضات على الذبائح البلدية'}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              {activeOffer?.subtitle || 'استمتع بأسعار مخفضة على ذبائح النعيمي والحري وبوكسات التوفير مع التوصيل المبرد المجاني.'}
            </p>

            {activeOffer?.endDate && (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>ساري حتى: {activeOffer.endDate}</span>
              </div>
            )}
          </div>

          {/* Coupon voucher input */}
          <form
            onSubmit={handleApplyCoupon}
            className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full md:w-80 space-y-2.5 text-start"
          >
            <label className="block text-xs font-bold text-slate-200">
              لديك كود خصم إضافي؟
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                placeholder="أدخل الكود هنا"
                className="flex-1 bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-300 outline-none uppercase tracking-wider"
              />
              <button
                type="submit"
                disabled={applying}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {applying ? '...' : 'تطبيق'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Offers Selector Tabs (if multiple offers exist) */}
      {offers.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedOfferId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              selectedOfferId === 'all'
                ? 'bg-brand-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            جميع العروض المتاحة
          </button>

          {offers.map((offer) => (
            <button
              key={offer.id}
              onClick={() => setSelectedOfferId(offer.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedOfferId === offer.id
                  ? 'bg-brand-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{offer.name}</span>
              {offer.badgeText && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                  {offer.badgeText}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 3. Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-900" />
              <span>{activeOffer ? `المنتجات المشمولة في ${activeOffer.name}` : 'جميع الذبائح المخفضة حالياً'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ذبح حلال شرعي 100% • تقطيع وتغليف مفرغ مخصص • شحن مبرد لباب منزلك
            </p>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {displayedProducts.length} منتج
          </span>
        </div>

        {loading ? (
          <CartoonLoadingState message="جاري استرجاع عروض الذبائح..." />
        ) : displayedProducts.length === 0 ? (
          <CartoonEmptyState
            title="لا توجد منتجات مشمولة بهذا العرض حالياً"
            description="يمكنك تصفح باقي الأقسام واختيار ذبيحتك البلدية المفضلة"
            actionText="تصفح قائمة الذبائح"
            onAction={() => navigate('/categories')}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedProducts.map((p) => (
              <CartoonProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
