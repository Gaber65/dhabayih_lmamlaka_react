import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Truck,
  Scale,
  Heart,
  Home,
  Zap,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { catalogApi } from '../api/catalog';
import { Product } from '../types/product.types';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductReviews } from '../components/product/ProductReviews';
import { CartoonQuantitySelector } from '../components/common/CartoonQuantitySelector';
import { CartoonProductCard } from '../components/product/CartoonProductCard';
import { CartoonLoadingState } from '../components/common/CartoonLoadingState';
import {
  CuttingOptionSelector,
  PackagingOptionSelector,
  ExcludedPartsSelector,
  ProductCustomizationSummary,
} from '../components/product/ProductCustomizationWidgets';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addToast } = useUIStore();


  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedCuttingId, setSelectedCuttingId] = useState<number | null>(null);
  const [selectedPackagingIds, setSelectedPackagingIds] = useState<number[]>([]);
  const [selectedExcludedIds, setSelectedExcludedIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'cooking'>('specs');
  const [addingToCart, setAddingToCart] = useState(false);

  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [p, allProds] = await Promise.all([
          catalogApi.getProductById(Number(id)),
          catalogApi.getProducts(),
        ]);
        setProduct(p);
        setRelatedProducts(allProds.filter((item) => item.id !== Number(id)).slice(0, 4));

        if (p.cuttingOptions && p.cuttingOptions.length > 0) {
          setSelectedCuttingId(p.cuttingOptions[0].id);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <CartoonLoadingState message={t('loading_product_details', 'جاري تحميل تفاصيل الذبيحة وخيارات التجهيز...')} />;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{t('product_not_found', 'الذبيحة غير متوفرة حالياً')}</h2>
        <button
          onClick={() => navigate('/categories')}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer transition"
        >
          {t('start_shopping', 'العودة لقائمة الذبائح')}
        </button>
      </div>
    );
  }

  const displayName = isAr ? product.nameAr || product.name : product.nameEn || product.name;
  const isFav = isFavorite(product.id);
  const cuttingOpts = product.cuttingOptions || [];
  const pkgOpts = product.packagingOptions || [];
  const excludedOpts = product.excludedParts || [];

  const selectedCutting = cuttingOpts.find((c) => c.id === selectedCuttingId);
  const selectedCuttingName = selectedCutting
    ? isAr
      ? selectedCutting.nameAr || selectedCutting.name
      : selectedCutting.nameEn || selectedCutting.name
    : undefined;

  const selectedPackagingNames = pkgOpts
    .filter((p) => selectedPackagingIds.includes(p.id))
    .map((p) => (isAr ? p.nameAr || p.name : p.nameEn || p.name));

  const selectedExcludedNames = excludedOpts
    .filter((e) => selectedExcludedIds.includes(e.id))
    .map((e) => (isAr ? e.nameAr || e.name : e.nameEn || e.name));

  const handleTogglePackaging = (pkgId: number) => {
    setSelectedPackagingIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleToggleExcluded = (excId: number) => {
    setSelectedExcludedIds((prev) =>
      prev.includes(excId) ? prev.filter((id) => id !== excId) : [...prev, excId]
    );
  };

  const basePrice = product.price;
  const originalPrice = product.originalPrice;
  const totalPrice = basePrice * quantity;

  const handleAddToCart = async (goToCheckout: boolean = false) => {

    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_to_order', 'يرجى تسجيل الدخول أولاً لإضافة الذبيحة ومتابعة الطلب'),
      });
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        weightLabel: product.weight || undefined,
        cuttingOptionId: selectedCuttingId || undefined,
        packagingIds: selectedPackagingIds.length > 0 ? selectedPackagingIds : undefined,
        excludedPartIds: selectedExcludedIds.length > 0 ? selectedExcludedIds : undefined,
        notes: notes.trim() || undefined,
      });

      addToast({
        type: 'success',
        title: displayName,
        message: t('added_to_cart', 'تمت الإضافة إلى السلة بنجاح'),
      });

      if (goToCheckout) {
        navigate('/checkout');
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: err.response?.data?.message || t('cart_add_failed', 'تعذر إضافة الذبيحة للسلة'),
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_to_favorite', 'يرجى تسجيل الدخول أولاً لحفظ الذبيحة في المفضلة'),
      });
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }
    toggleFavorite(product);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home', 'الرئيسية')}</span>
        </Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-brand-600 transition">
          {t('all_sacrifices', 'جميع الذبائح')}
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900 truncate max-w-xs">{displayName}</span>
      </div>

      {/* Main PDP 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Fast Assurances (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <ProductGallery
            images={product.images || [product.imageUrl]}
            productName={displayName}
            isOnOffer={product.isOnOffer}
            discountTag={product.discountTag}
          />

          {/* Guarantee Badges under image */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-black text-slate-900">{t('halal_badge_title', 'ذبح حلال 100%')}</div>
                <div className="text-slate-500 text-[11px] font-medium">{t('halal_badge_sub', 'إشراف بيطري حكومي معتمد')}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3 shadow-xs">
              <Truck className="w-6 h-6 text-brand-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-black text-slate-900">{t('cold_delivery_badge_title', 'توصيل مبرد 4°C')}</div>
                <div className="text-slate-500 text-[11px] font-medium">{t('cold_delivery_badge_sub', 'سيارات تبريد مخصصة للحوم')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Live Calculator (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Title & Wishlist */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {product.isOnOffer && (
                    <span className="bg-brand-50 text-brand-700 border border-brand-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                      {product.discountTag || t('special_offers', 'عرض خاص')}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                    {product.isAvailable ? t('in_stock_prepared_today', 'متوفر للطلب والتجهيز اليوم') : t('out_of_stock', 'غير متوفر')}
                  </span>
                </div>

                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full border transition cursor-pointer ${
                    isFav
                      ? 'bg-rose-50 border-rose-200 text-brand-500'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-brand-500'
                  }`}
                  title={isFav ? t('remove', 'إزالة من المفضلة') : t('favorites', 'إضافة للمفضلة')}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-brand-500 text-brand-500' : ''}`} />
                </button>

              </div>

              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-2 leading-tight">
                {displayName}
              </h1>

              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                {product.description ||
                  t('product_default_desc', 'ذبائح ومواشي بلدية طازجة تُرعى في مزارع معتمدة، تُذبح يومياً حسب الطلب مع خيارات تقطيع وتغليف مخصصة.')}
              </p>

              {/* Price Row */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900 font-mono">
                      {basePrice.toLocaleString('en-US')}
                    </span>
                    <span className="text-sm font-bold text-slate-600">{t('sar', 'ر.س')}</span>
                  </div>
                  {originalPrice && originalPrice > basePrice && (
                    <span className="text-xs text-slate-400 line-through font-mono block">
                      {originalPrice.toLocaleString('en-US')} {t('sar', 'ر.س')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 1. Real Product Weight Specs */}
            {product.weight && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Scale className="w-4 h-4 text-brand-500" />
                  <span>{t('approx_weight_label', 'الوزن التقديري للذبيحة:')}</span>
                </div>
                <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                  {product.weight}
                </span>
              </div>
            )}

            {/* 2. Cutting Options */}
            {cuttingOpts.length > 0 && (
              <CuttingOptionSelector
                options={cuttingOpts}
                selectedId={selectedCuttingId}
                onSelect={(id) => setSelectedCuttingId(id)}
              />
            )}

            {/* 3. Packaging Options */}
            {pkgOpts.length > 0 && (
              <PackagingOptionSelector
                options={pkgOpts}
                selectedIds={selectedPackagingIds}
                onToggle={handleTogglePackaging}
              />
            )}

            {/* 4. Excluded Parts */}
            {excludedOpts.length > 0 && (
              <ExcludedPartsSelector
                parts={excludedOpts}
                selectedIds={selectedExcludedIds}
                onToggle={handleToggleExcluded}
              />
            )}

            {/* 5. Custom Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                {t('special_notes', 'ملاحظات إضافية للقصاب (اختياري)')}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notes_placeholder_detailed', 'مثال: فصل الظهر عن القفص، فرم جزء من اللحم، تكسير العظام للشوربة...')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-3 text-xs md:text-sm font-medium text-slate-800 outline-none resize-none transition"
              />
            </div>

            {/* Selection Summary Box */}
            <ProductCustomizationSummary
              cuttingName={selectedCuttingName}
              packagingNames={selectedPackagingNames}
              excludedNames={selectedExcludedNames}
              notes={notes.trim()}
            />

            {/* Quantity and Dual CTAs */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{t('quantity_label', 'عدد الذبائح المطلوبة:')}</span>
                <CartoonQuantitySelector
                  value={quantity}
                  onChange={(val) => setQuantity(val)}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={addingToCart}
                  className="py-3 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('add_to_cart', 'إضافة للسلة')} • {totalPrice.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
                </button>

                {/* Buy Now Instant Checkout */}
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart}
                  className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs md:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{t('buy_now_instant', 'شراء الآن (إتمام فوري)')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Specifications & Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
        {/* Tabs Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3 text-xs md:text-sm font-bold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 transition cursor-pointer border-b-2 ${
              activeTab === 'specs'
                ? 'border-brand-500 text-brand-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('specs_tab', 'المواصفات والسلامة الغذائية')}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 transition cursor-pointer border-b-2 ${
              activeTab === 'reviews'
                ? 'border-brand-500 text-brand-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('reviews_tab', 'تقييمات وتجارب المشترين')}
          </button>

          <button
            onClick={() => setActiveTab('cooking')}
            className={`pb-2 transition cursor-pointer border-b-2 ${
              activeTab === 'cooking'
                ? 'border-brand-500 text-brand-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('cooking_guidelines_tab', 'إرشادات الحفظ والطهي')}
          </button>
        </div>

        {/* Tab 1: Specifications */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">{t('origin_vet_title', 'بيانات المنشأ والرعاية البيطرية')}</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><b>{t('origin_label', 'المنشأ:')}</b> {product.origin || t('default_origin_desc', 'مواشي بلدية محلية - رعاية طبيعية في مزارع نجد والقصيم')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><b>{t('slaughter_method_label', 'طريقة الذبح:')}</b> {product.slaughterMethod || t('default_slaughter_desc', 'ذبح حلال شرعي 100% بإشراف أطباء بيطريين معتمدين')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><b>{t('prep_and_delivery_label', 'التجهيز والتوصيل:')}</b> {product.preparationTime || t('default_prep_desc', 'يصلك طازجاً مبرداً خلال 2 إلى 4 ساعات من وقت الذبح')}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">{t('freshness_guarantee_title', 'ضمان الطزاجة والاستبدال')}</h4>
              <p className="text-slate-600">
                {t('freshness_guarantee_desc', 'نضمن لك سلامة وجودة الذبيحة بنسبة 100%. في حال عدم رضاك عن الجودة أو التقطيع، نلتزم باستبدال الطلب فوراً أو استرجاع المبلغ كاملاً بدون أي تعقيد.')}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <ProductReviews productName={displayName} />
        )}

        {/* Tab 3: Cooking & Storage Guidelines */}
        {activeTab === 'cooking' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-w-3xl">
            <h4 className="font-bold text-slate-900 text-sm">{t('chef_tips_title', 'نصائح الشيف لحفظ وطهي اللحم الطازج:')}</h4>
            <p>
              1. <b>{t('fridge_storage_title', 'الحفظ في الثلاجة:')}</b> {t('fridge_storage_desc', 'إذا كنت تنوي الطبخ خلال 48 ساعة، احفظ اللحم المغلف سحب هواء في أبرد رف في الثلاجة (بين 1 إلى 4 درجات مئوية).')}
            </p>
            <p>
              2. <b>{t('freezer_storage_title', 'التجميد في الفريزر:')}</b> {t('freezer_storage_desc', 'التغليف المفرغ من الهواء يحمي اللحم من حروق التجميد ويحافظ على طراوته ونكهته لأكثر من 6 أشهر.')}
            </p>
            <p>
              3. <b>{t('cooking_tips_title', 'الطهي والكبسة:')}</b> {t('cooking_tips_desc', 'اللحم البلدي الطازج يتميز بنكهة غنية وسرعة في النضج بدون الحاجة لكميات بهارات زائدة.')}
            </p>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">{t('related_products_title', 'قد يعجبك أيضاً من سوق الذبائح')}</h3>
            <Link to="/categories" className="text-xs font-bold text-brand-600 hover:underline">
              {t('view_more', 'عرض المزيد')} ➔
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <CartoonProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};