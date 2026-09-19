import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Heart, Eye, Check } from 'lucide-react';
import { Product } from '../../types/product.types';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useUIStore } from '../../store/useUIStore';
import { getProductImage } from '../../utils/productImages';

export const CartoonProductCard: React.FC<{
  product: Product;
  className?: string;
  onQuickView?: (product: Product) => void;
}> = ({ product, className = '', onQuickView }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addToast } = useUIStore();

  const isAr = i18n.language === 'ar';
  const displayName = isAr ? product.nameAr || product.name : product.nameEn || product.name;
  const isFav = isFavorite(product.id);
  const imageUrl = getProductImage(product);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_to_order', 'يرجى تسجيل الدخول أولاً لإضافة الذبيحة ومتابعة الطلب'),
      });
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }

    if (product.cuttingOptions?.length || product.packagingOptions?.length || product.weightOptions?.length) {
      navigate(`/product/${product.id}`);
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
      });
      addToast({
        type: 'success',
        title: displayName,
        message: t('added_to_cart', 'تمت الإضافة إلى السلة بنجاح'),
      });
    } catch {
      navigate(`/product/${product.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

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
    addToast({
      type: 'info',
      title: displayName,
      message: isFav ? t('removed_from_favorites', 'تم الحذف من المفضلة') : t('added_to_favorites', 'تمت الإضافة إلى قائمة المفضلة ❤️'),
    });
  };


  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className={`group bg-white rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative ${className}`}
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              '/images/onboarding/butchery.jpg';
          }}
        />

        {/* Subtle Discount / Category Badge */}
        <div className="absolute top-2.5 start-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isOnOffer && (
            <span className="bg-brand-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
              {product.discountTag || 'عرض خاص'}
            </span>
          )}
          {product.categoryName && (
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
              {product.categoryName}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          className="absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-brand-500 flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-90"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'text-brand-500 fill-brand-500' : 'text-slate-600'}`} />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-2.5 inset-x-3 py-2 bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs shadow-lg cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>نظرة سريعة</span>
          </button>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h4 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1 group-hover:text-brand-500 transition-colors">
            {displayName}
          </h4>

          {/* Specs / Freshness Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1.5">
            {product.weight ? (
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                {product.weight}
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>طازج ذبح اليوم</span>
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-600 font-medium">فحص بيطري معتمد</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                {product.price.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-bold text-slate-600">ر.س</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through font-mono block">
                {product.originalPrice.toLocaleString('en-US')} ر.س
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>إضافة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = CartoonProductCard;