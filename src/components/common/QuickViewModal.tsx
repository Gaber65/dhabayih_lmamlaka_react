import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Plus, ShieldCheck, Truck, Scale, ShoppingBag, Eye, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '../../types/product.types';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useUIStore } from '../../store/useUIStore';
import { RatingStars } from './RatingStars';
import { CartoonQuantitySelector } from './CartoonQuantitySelector';
import { getProductImage } from '../../utils/productImages';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addToast } = useUIStore();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  if (!product) return null;

  const displayName = isAr ? product.nameAr || product.name : product.nameEn || product.name;
  const isFav = isFavorite(product.id);
  const imageUrl = getProductImage(product);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      onClose();
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_to_order', 'يرجى تسجيل الدخول أولاً لإضافة الذبيحة ومتابعة الطلب'),
      });
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }

    // If product has multiple cutting / packaging options, guide to full PDP
    if (product.cuttingOptions?.length || product.packagingOptions?.length || product.weightOptions?.length) {
      onClose();
      navigate(`/product/${product.id}`);
      return;
    }

    setAdding(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
      });
      addToast({
        type: 'success',
        title: displayName,
        message: t('added_to_cart', 'تمت الإضافة إلى السلة بنجاح'),
      });
      onClose();
    } catch {
      onClose();
      navigate(`/product/${product.id}`);
    } finally {
      setAdding(false);
    }
  };


  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 z-10 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Image Showcase */}
          <div className="relative aspect-[4/3] rounded-2xl bg-slate-50 overflow-hidden border border-slate-200">
            <img
              src={imageUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/images/onboarding/butchery.jpg';
              }}
            />


            {product.isOnOffer && (
              <div className="absolute top-3 start-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-md shadow-sm">
                {product.discountTag || 'عرض خاص'}
              </div>
            )}
          </div>

          {/* Product Details info */}
          <div className="space-y-4">
            <div>
              <RatingStars
                rating={product.rating || 4.9}
                reviewsCount={product.reviewsCount || 48}
                size="sm"
              />

              <h3 className="text-lg md:text-xl font-black text-slate-900 mt-1">
                {displayName}
              </h3>

              {product.weight && (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-2">
                  <Scale className="w-3.5 h-3.5" />
                  <span>الوزن: {product.weight}</span>
                </div>
              )}

              <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-3 leading-relaxed">
                {product.description || 'ذبائح ومواشي بلدية طازجة مختارة بعناية تخضع لأعلى معايير الفحص البيطري والذبح الحلال المعتمد مع توصيل مبرد.'}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {product.price.toLocaleString('en-US')}
              </span>
              <span className="text-sm font-bold text-slate-600">ر.س</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {product.originalPrice.toLocaleString('en-US')} ر.س
                </span>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">الكمية:</span>
                <CartoonQuantitySelector
                  value={quantity}
                  onChange={(val) => setQuantity(val)}
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 py-3 rounded-xl bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة للسلة • {totalPrice.toLocaleString('en-US')} ر.س</span>
                </button>

                <button
                  onClick={() => toggleFavorite(product)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isFav
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/product/${product.id}`);
                }}
                className="w-full text-center text-xs font-bold text-brand-900 hover:underline pt-1 block"
              >
                تخصيص خيارات التقطيع والتغليف كاملة ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
