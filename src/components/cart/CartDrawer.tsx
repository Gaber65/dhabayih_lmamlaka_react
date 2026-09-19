import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag, ArrowLeft, ArrowRight, Trash2, Truck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';
import { CartoonQuantitySelector } from '../common/CartoonQuantitySelector';
import { getProductImage } from '../../utils/productImages';

export const CartDrawer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    isCartDrawerOpen,
    closeCartDrawer,
    cart,
    updateQuantity,
    removeFromCart,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();
  const { addToast } = useUIStore();

  const [inputCode, setInputCode] = useState('');
  const isRtl = i18n.language === 'ar';

  if (!isCartDrawerOpen) return null;

  const lines = cart?.lines || [];
  const isEmpty = lines.length === 0;
  const subtotal = cart?.subtotal || lines.reduce((s, l) => s + (l.lineTotal || 0), 0);
  const total = cart?.total || Math.max(0, subtotal - discountAmount);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = await applyCoupon(inputCode.trim());
    if (res.success) {
      addToast({
        type: 'success',
        title: t('coupon_code', 'كوبون الخصم'),
        message: res.message,
      });
      setInputCode('');
    } else {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: res.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 end-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <h3 className="text-base font-black text-slate-900">
                {t('cart', 'سلة المشتريات')} ({lines.reduce((s, l) => s + l.quantity, 0)})
              </h3>
            </div>

            <button
              onClick={closeCartDrawer}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="text-sm font-black text-slate-800">
                  {t('empty_cart_title', 'سلتك فارغة')}
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  {t('empty_cart_desc', 'أضف ذبائحك المفضلة واستمتع بتوصيل مبرد لباب منزلك')}
                </p>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/categories');
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer transition shadow-xs"
                >
                  {t('start_shopping', 'تصفح قائمة الذبائح')}
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Bar */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-emerald-800 text-[11px] font-bold">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{t('delivery_free_cold_badge', 'توصيل مبرد طازج مجاناً لطلبك')}</span>
                </div>

                {lines.map((line) => {
                  const displayName = isRtl
                    ? line.product?.nameAr || line.product?.name
                    : line.product?.nameEn || line.product?.name;

                  return (
                    <div
                      key={line.id}
                      className="bg-white rounded-xl border border-slate-200 p-3 flex items-start gap-3 shadow-xs"
                    >
                      <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {displayName}
                          </h4>
                          <button
                            onClick={() => removeFromCart(line.productId)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {line.weightLabel && (
                          <div className="text-[10px] font-bold text-slate-600">
                            {line.weightLabel}
                          </div>
                        )}
                        {line.cuttingOptionName && (
                          <div className="text-[10px] text-slate-500">
                            {t('cutting_options', 'التقطيع')}: {line.cuttingOptionName}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <CartoonQuantitySelector
                            value={line.quantity}
                            onChange={(newQty) => updateQuantity(line.productId, newQty)}
                            size="sm"
                          />
                          <div className="text-xs font-black text-slate-900 font-mono">
                            {line.lineTotal.toLocaleString('en-US')} {t('sar', 'ر.س')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code in Drawer */}
                <div className="pt-2">
                  {couponCode ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-emerald-800 font-bold text-[11px]">
                        {t('coupon_applied', 'كوبون فعال:')} <b>{couponCode}</b>
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-slate-400 hover:text-rose-600 text-[10px] font-bold cursor-pointer"
                      >
                        {t('remove', 'إلغاء')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={t('coupon_placeholder', 'كود الخصم')}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs uppercase font-mono font-bold outline-none focus:border-brand-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {t('apply', 'تطبيق')}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer & Actions */}
          {!isEmpty && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t('subtotal', 'المجموع الفرعي:')}</span>
                  <span className="font-bold font-mono">{subtotal.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-600 font-bold">
                    <span>{t('discount', 'الخصم:')}</span>
                    <span className="font-mono">- {discountAmount.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>{t('total', 'المجموع الإجمالي:')}</span>
                  <span className="font-mono text-brand-600 text-base">
                    {total.toLocaleString('en-US')} {t('sar', 'ر.س')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/checkout');
                  }}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <span>{t('proceed_to_checkout', 'متابعة الدفع الفوري')}</span>
                  {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/cart');
                  }}
                  className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs text-center block transition cursor-pointer"
                >
                  {t('view_full_cart', 'عرض سلة المشتريات كاملة')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};