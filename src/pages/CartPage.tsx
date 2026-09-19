import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2, ShieldCheck, Truck, Tag, Check, Home } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { CartoonQuantitySelector } from '../components/common/CartoonQuantitySelector';
import { CartoonEmptyState } from '../components/common/CartoonEmptyState';
import { CartoonLoadingState } from '../components/common/CartoonLoadingState';
import { getProductImage } from '../utils/productImages';

export const CartPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, fetchCart, updateQuantity, removeFromCart, clearCart, couponCode, discountAmount, applyCoupon, removeCoupon } = useCartStore();
  const { addToast } = useUIStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;


  if (isLoading && !cart) {
    return <CartoonLoadingState message={t('loading_cart', 'جاري تجهيز سلة المشتريات...')} />;
  }

  const lines = cart?.lines || [];
  const isEmpty = lines.length === 0;
  const subtotal = cart?.subtotal || lines.reduce((s, l) => s + (l.lineTotal || 0), 0);
  const total = cart?.total || Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = await applyCoupon(inputCoupon.trim());
    if (res.success) {
      addToast({
        type: 'success',
        title: t('coupon_code', 'كوبون الخصم'),
        message: res.message,
      });
      setInputCoupon('');
    } else {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: res.message,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-[70vh]">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home', 'الرئيسية')}</span>
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">{t('cart', 'سلة المشتريات')}</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-500" />
            <span>{t('cart', 'سلة المشتريات')} ({lines.reduce((s, l) => s + l.quantity, 0)})</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('cart_review_subtitle', 'راجع ذبائحك وخيارات التقطيع والتغليف قبل إتمام الطلب')}
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={() => clearCart()}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('clear_cart', 'تفريغ السلة')}</span>
          </button>
        )}
      </div>

      {isEmpty ? (
        <CartoonEmptyState
          title={t('empty_cart_title', 'سلة المشتريات فارغة')}
          description={t('empty_cart_desc', 'لم تقم بإضافة أي ذبائح أو منتجات إلى السلة حتى الآن')}
          actionText={t('start_shopping', 'تصفح قائمة الذبائح')}
          onAction={() => navigate('/categories')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{t('free_delivery_qualified_msg', 'مبارك! طلبك مؤهل لخدمة التوصيل المبرد المجاني لجميع أحياء الرياض')}</span>
            </div>

            {lines.map((line) => {
              const displayName = isRtl
                ? line.product?.nameAr || line.product?.name
                : line.product?.nameEn || line.product?.name;

              return (
                <div
                  key={line.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImage(line.product)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/images/onboarding/butchery.jpg';
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {displayName}
                      </h4>
                      {line.weightLabel && (
                        <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                          {t('weight', 'الوزن')}: {line.weightLabel}
                        </div>
                      )}
                      {line.cuttingOptionName && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {t('cutting_options', 'التقطيع')}: {line.cuttingOptionName}
                        </div>
                      )}
                      {line.packagingNames && line.packagingNames.length > 0 && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {t('packaging_options', 'التغليف')}: {line.packagingNames.join('، ')}
                        </div>
                      )}
                      {line.notes && (
                        <div className="text-[11px] text-amber-700 font-medium">
                          {t('special_notes', 'ملاحظة')}: {line.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <CartoonQuantitySelector
                      value={line.quantity}
                      onChange={(newQty) => updateQuantity(line.productId, newQty)}
                      size="sm"
                    />

                    <div className="text-end min-w-[90px]">
                      <div className="text-sm font-black text-slate-900 font-mono">
                        {line.lineTotal.toLocaleString('en-US')} {t('sar', 'ر.س')}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.productId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
                {t('cart_summary', 'ملخص الحساب')}
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-brand-500" />
                  <span>{t('coupon_code', 'كود الخصم أو قسيمة الشراء:')}</span>
                </label>

                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{t('coupon_applied', 'الكود الفعال:')} <b className="font-mono">{couponCode}</b></span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-rose-600 font-bold text-[11px] cursor-pointer"
                    >
                      {t('remove', 'إلغاء')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="MAMLAKA10"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-brand-500 focus:bg-white uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition cursor-pointer"
                    >
                      {t('apply', 'تطبيق')}
                    </button>
                  </form>
                )}
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t('subtotal', 'المجموع الفرعي')} ({lines.length} {t('sacrifices_and_products', 'منتجات')})</span>
                  <span className="font-bold font-mono">{subtotal.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-600 font-bold">
                    <span>{t('discount', 'خصم الكوبون')} ({couponCode})</span>
                    <span className="font-mono">- {discountAmount.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600">
                  <span>{t('delivery_fee', 'التوصيل المبرد')}</span>
                  <span className="text-emerald-600 font-bold">{t('free', 'مجاني')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{t('tax', 'ضريبة القيمة المضافة (15%)')}</span>
                  <span>{t('tax_included', 'شاملة في السعر')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold">{t('total_due', 'المبلغ الإجمالي للدفع:')}</div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                    {total.toLocaleString('en-US')} <span className="text-xs font-bold text-slate-600">{t('sar', 'ر.س')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
              >
                <span>{t('proceed_to_checkout', 'متابعة إتمام الطلب')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 text-center font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('secure_checkout_badge', 'دفع آمن 100% عبر مدى، أبل باي، وبطاقات الائتمان')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};