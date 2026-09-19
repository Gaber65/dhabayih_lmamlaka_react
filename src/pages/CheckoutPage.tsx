import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  Store,
  ShieldCheck,
  CreditCard,
  Banknote,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  Tag,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ordersApi } from '../api/orders';
import { addressApi } from '../api/address';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAddressStore } from '../store/useAddressStore';
import { useUIStore } from '../store/useUIStore';

export const CheckoutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    cart,
    clearCart,
    couponCode,
    discountAmount,
  } = useCartStore();
  const { activeAddress, openLocationModal } = useAddressStore();
  const { addToast } = useUIStore();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('mada');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (user) {
      if (!recipientName && user.name) setRecipientName(user.name);
      if (!recipientPhone && user.phone) setRecipientPhone(user.phone);
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) return null;


  const isRtl = i18n.language === 'ar';

  const paymentOptions = [
    { id: 'mada', label: t('payment_mada', 'مدى (Mada)'), icon: CreditCard, subtitle: t('mada_subtitle', 'بطاقات الصراف مدى المحلية والدولية') },
    { id: 'applepay', label: t('payment_apple_pay', 'Apple Pay'), icon: Zap, subtitle: t('applepay_subtitle', 'دفع فوري آمن بضغطة واحدة') },
    { id: 'visa', label: t('payment_card', 'بطاقة ائتمانية (Visa / Master)'), icon: CreditCard, subtitle: t('card_subtitle', 'فيزا، ماستركارد، أمريكان إكسبريس') },
    { id: 'cod', label: t('payment_cod', 'الدفع عند الاستلام'), icon: Banknote, subtitle: t('cod_subtitle', 'نقداً أو بالبطاقة عند وصول المندوب') },
  ];

  const lines = cart?.lines || [];
  const subtotal = cart?.subtotal || lines.reduce((s, l) => s + (l.lineTotal || 0), 0);
  const total = cart?.total || Math.max(0, subtotal - discountAmount);

  if (lines.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900">{t('empty_cart_title', 'سلتك فارغة')}</h2>
        <p className="text-xs text-slate-500">
          {t('empty_cart_desc', 'أضف ذبائحك المفضلة واستمتع بتوصيل مبرد لباب منزلك')}
        </p>
        <button
          onClick={() => navigate('/categories')}
          className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer transition shadow-xs"
        >
          {t('start_shopping', 'تصفح قائمة الذبائح')}
        </button>
      </div>
    );
  }

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryType === 'delivery') {
      if (!recipientName.trim() || !recipientPhone.trim()) {
        addToast({
          type: 'error',
          title: t('missing_data_title', 'بيانات ناقصة'),
          message: t('missing_data_msg', 'يرجى إدخال اسم المستلم ورقم الهاتف للتواصل أثناء التوصيل'),
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      let addressId = activeAddress?.id;

      if (deliveryType === 'delivery' && !addressId) {
        try {
          const createdAddr = await addressApi.createAddress({
            title: t('delivery_address_title', 'عنوان التوصيل'),
            recipientName: recipientName.trim(),
            recipientPhone: recipientPhone.trim(),
            city: activeAddress?.city || 'الرياض',
            street: streetAddress.trim() || activeAddress?.street || 'الرياض',
            isDefault: true,
          });
          addressId = createdAddr.id;
        } catch {
          // Continue if address create fails
        }
      }

      // Map UI payment option to payment method ID / code
      const isOnlinePayment = selectedPayment !== 'cod';
      
      const apiResult = await ordersApi.checkout({
        deliveryType: deliveryType === 'pickup' ? 'pickup' : 'address',
        addressId,
        paymentMethodId: isOnlinePayment ? 2 : 1, // 1: COD, 2: Online Card / MyFatoorah
        notes: notes.trim() || undefined,
        couponCode: couponCode || undefined,
      });

      const districtName = deliveryType === 'pickup'
        ? t('pickup_from_branch_title', 'استلام من المسلخ / الفرع الرئيسي')
        : (activeAddress ? `${activeAddress.title} - ${activeAddress.city}` : 'الرياض');

      const streetName = deliveryType === 'pickup'
        ? t('main_riyadh_branch', 'فرع الرياض الرئيسي')
        : (streetAddress || activeAddress?.street || t('registered_address', 'العنوان المسجل'));

      const orderResult = {
        orderId: apiResult.orderId,
        orderNumber: apiResult.orderNumber,
        state: apiResult.state,
        paymentStatus: apiResult.paymentStatus,
        deliveryType,
        paymentMethod: selectedPayment,
        district: districtName,
        streetAddress: streetName,
        recipientName: recipientName || (isRtl ? 'عميل ذبائح المملكة' : 'Valued Customer'),
        recipientPhone: recipientPhone || '05xxxxxxxx',
        deliveryDate: deliveryType === 'pickup' ? t('ready_for_pickup_today', 'جاهز للاستلام اليوم') : t('instant_delivery_today', 'توصيل فوري اليوم'),
        deliverySlot: deliveryType === 'pickup' ? t('pickup_time_slot', 'خلال 1 - 2 ساعة من التجهيز') : t('delivery_time_slot', 'خلال 2 - 4 ساعات'),
        subtotal: apiResult.subtotal || subtotal,
        discountAmount: apiResult.discountAmount || discountAmount,
        total: apiResult.total || total,
        createdAt: new Date().toISOString(),
      };

      if (isOnlinePayment) {
        // Save pending order info in sessionStorage for callback verification
        sessionStorage.setItem('pending_order_info', JSON.stringify(orderResult));

        const callbackUrl = `${window.location.origin}/payment/callback?order_id=${apiResult.orderId}`;
        const errorUrl = `${window.location.origin}/payment/callback?order_id=${apiResult.orderId}`;

        const paymentRes = await ordersApi.initiatePayment(
          apiResult.orderId,
          callbackUrl,
          errorUrl,
          selectedPayment
        );

        if (paymentRes.paymentUrl) {
          addToast({
            type: 'info',
            title: t('redirecting_to_payment', 'جاري التوجيه لبوابة الدفع...'),
            message: t('redirecting_to_mf_desc', 'نقوم بتحويلك إلى بوابة ماي فاتورة الآمنة لإتمام سداد طلبك.'),
          });
          // Redirect to MyFatoorah gateway
          window.location.href = paymentRes.paymentUrl;
          return;
        } else {
          throw new Error(t('failed_to_get_payment_url', 'تعذر استخراج رابط الدفع من بوابة ماي فاتورة. يرجى المحاولة لاحقاً.'));
        }
      }

      // If COD (Cash On Delivery), order is confirmed immediately
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      await clearCart();
      navigate('/order-success', { state: { result: orderResult } });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('order_submit_failed_title', 'تعذر إتمام الطلب'),
        message: err.response?.data?.message || err.message || t('order_submit_failed_msg', 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home', 'الرئيسية')}</span>
        </Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-brand-600 transition">
          {t('cart', 'سلة المشتريات')}
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">{t('checkout_title', 'إتمام الشراء والدفع')}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            {t('checkout_headline', 'إتمام الطلب وتأكيد الدفع')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('fast_cold_delivery_desc', 'توصيل مبرد فوري ومباشر في سيارات مجهزة لجميع أحياء الرياض')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{t('secure_checkout_guarantee', 'ضمان الجودة والطزاجة 100%')}</span>
        </div>
      </div>

      <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Delivery, Address, Payment Methods */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dispatch Notice Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-black">{t('slaughter_order_active', 'تجهيز فوري تحت إشراف بيطري')}</div>
              <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">
                {t('slaughter_order_active_desc', 'تُذبح ذبيحتك وتُجهّز فور تأكيد الطلب وتصلك مبردة لباب منزلك خلال 2 إلى 4 ساعات.')}
              </p>
            </div>
          </div>

          {/* 1. Delivery Type Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <label className="block text-xs font-black text-slate-900">
              {t('receiving_method', 'طريقة الاستلام')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition cursor-pointer ${
                  deliveryType === 'delivery'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>{t('doorstep_cold_delivery', 'توصيل مبرد لباب المنزل')}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition cursor-pointer ${
                  deliveryType === 'pickup'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{t('pickup_from_branch', 'استلام من المسلخ / الفرع')}</span>
              </button>
            </div>
          </div>

          {/* 2. Address & Contact info */}
          {deliveryType === 'delivery' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  <span>{t('delivery_address_section', 'عنوان التوصيل')}</span>
                </h3>

                <button
                  type="button"
                  onClick={openLocationModal}
                  className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  {activeAddress ? `${t('change_address', 'تغيير العنوان')} ➔` : `${t('select_address', 'اختيار أو إضافة عنوان')} ➔`}
                </button>
              </div>

              {activeAddress ? (
                <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{activeAddress.title}</span>
                      {activeAddress.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                          {t('default_tag', 'افتراضي')}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      {activeAddress.street ? `${activeAddress.city} - ${activeAddress.street}` : activeAddress.fullAddress || activeAddress.city}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openLocationModal}
                    className="px-3 py-1 bg-white border border-brand-300 text-brand-600 rounded-lg text-xs font-bold hover:bg-brand-50 cursor-pointer"
                  >
                    {t('change', 'تعديل')}
                  </button>
                </div>
              ) : (
                <div
                  onClick={openLocationModal}
                  className="p-4 border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl text-center cursor-pointer transition space-y-1 bg-slate-50"
                >
                  <MapPin className="w-5 h-5 text-brand-500 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">{t('click_to_select_address', 'انقر هنا لاختيار أو إضافة عنوان التوصيل')}</div>
                  <p className="text-[11px] text-slate-400">{t('delivery_accurate_prompt', 'حدد موقعك بدقة لضمان سرعة وصول الذبائح المبردة')}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('recipient_name', 'اسم المستلم')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={t('full_name', 'الاسم الكامل')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-2.5 text-xs font-medium outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('recipient_phone', 'رقم جوال التواصل')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-medium outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Delivery Timeslot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>{t('delivery_time_slot_title', 'موعد ووقت التجهيز والتوصيل')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-brand-200 bg-brand-50/50 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-brand-600" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{t('delivery_date_today', 'اليوم (توصيل فوري)')}</div>
                  <div className="text-[11px] text-slate-500">{new Date().toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-brand-200 bg-brand-50/50 flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-600" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">
                    {deliveryType === 'pickup' ? t('pickup_fast_slot', 'خلال 1 - 2 ساعة من الطلب') : t('delivery_fast_slot', 'خلال 2 - 4 ساعات')}
                  </div>
                  <div className="text-[11px] text-slate-500">{t('slaughter_prep_fresh_tag', 'ذبح طازج وتوصيل مباشر')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Payment Method Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-500" />
              <span>{t('payment_method_title', 'وسيلة الدفع')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentOptions.map((opt) => {
                const isSelected = selectedPayment === opt.id;
                const Icon = opt.icon;

                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedPayment(opt.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50/80 border-brand-500 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-brand-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                        <div className="text-[10px] text-slate-400">{opt.subtitle}</div>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="payment"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 accent-brand-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* 5. Special Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
            <label className="block text-xs font-black text-slate-900">
              {t('special_order_notes', 'ملاحظات وتوصيات خاصة بالطلب (اختياري)')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('order_notes_placeholder', 'مثال: الرجاء الاتصال قبل الوصول بـ 15 دقيقة، أو تعليمات خاصة للموقع...')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-3 text-xs font-medium outline-none resize-none transition"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation CTA */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{t('cart_summary', 'ملخص الطلب')}</span>
              <span className="text-xs text-slate-500 font-normal">({lines.length} {t('sacrifices_and_products', 'منتجات')})</span>
            </h3>

            {/* Selected Items Micro List */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 pe-1">
              {lines.map((l) => {
                const prodName = isRtl ? l.productNameAr || l.productName : l.productNameEn || l.productName;

                return (
                  <div key={l.id} className="flex items-center justify-between text-xs gap-2">
                    <div className="truncate min-w-0">
                      <div className="font-bold text-slate-900 truncate">{prodName}</div>
                      <div className="text-[10px] text-slate-500">
                        {l.quantity} × {l.priceUnit.toLocaleString('en-US')} {t('sar', 'ر.س')}
                        {l.cuttingOptionName && ` • ${l.cuttingOptionName}`}
                      </div>
                    </div>
                    <div className="font-black text-slate-900 font-mono flex-shrink-0">
                      {l.lineTotal.toLocaleString('en-US')} {t('sar', 'ر.س')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('subtotal', 'المجموع الفرعي:')}</span>
                <span className="font-bold font-mono">{subtotal.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-600 font-bold">
                  <span>{t('discount', 'خصم الكوبون:')} {couponCode ? `(${couponCode})` : ''}</span>
                  <span className="font-mono">- {discountAmount.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>{t('delivery_fee', 'التوصيل المبرد:')}</span>
                <span className="text-emerald-600 font-bold">{t('free', 'مجاني')}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>{t('tax', 'ضريبة القيمة المضافة (15%):')}</span>
                <span>{t('tax_included', 'شاملة في السعر')}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-bold">{t('total_due', 'المبلغ الإجمالي للدفع:')}</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {total.toLocaleString('en-US')} <span className="text-xs font-bold text-slate-600">{t('sar', 'ر.س')}</span>
                </div>
              </div>
            </div>

            {/* Submit Order CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <span>
                {submitting
                  ? t('processing_order', 'جاري المعالجة...')
                  : selectedPayment === 'cod'
                  ? t('confirm_cod_order', 'تأكيد الطلب (الدفع عند الاستلام)')
                  : t('proceed_to_myfatoorah', 'المتابعة إلى الدفع الآمن (ماي فاتورة)')}
              </span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="pt-2 text-[11px] text-slate-400 text-center font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('secure_checkout_badge', 'دفع آمن 100% عبر مدى، أبل باي، وبطاقات الائتمان')}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};