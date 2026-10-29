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
  Sparkles,
  Award,
  Coins,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ordersApi } from '../api/orders';
import { cartApi } from '../api/cart';
import { addressApi } from '../api/address';
import { branchesApi } from '../api/branches';
import { profileApi } from '../api/profile';
import { Branch } from '../types/branch.types';
import { PaymentMethod } from '../types/order.types';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAddressStore } from '../store/useAddressStore';
import { useUIStore } from '../store/useUIStore';
import { PrivacyPolicyModal } from '../components/common/PrivacyPolicyModal';

const getRiyadhDateString = (offsetDays: number = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(d);
};

const getRiyadhCurrentHour = (): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Riyadh',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date());
    const h = parts.find((p) => p.type === 'hour')?.value;
    return h ? parseInt(h, 10) : new Date().getHours();
  } catch {
    return new Date().getHours();
  }
};

const formatRiyadhDisplayDate = (dateStr: string, isAr: boolean): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12, 0, 0);
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
};

export const CheckoutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    cart,
    fetchCart,
    clearCart,
    couponCode,
    discountAmount,
  } = useCartStore();
  const { activeAddress, openLocationModal } = useAddressStore();
  const { addToast } = useUIStore();

  const isSubmittingRef = React.useRef(false);
  const riyadhCurrentHour = getRiyadhCurrentHour();
  const riyadhTodayStr = getRiyadhDateString(0);
  const riyadhTomorrowStr = getRiyadhDateString(1);
  const riyadhDayAfterStr = getRiyadhDateString(2);

  // If local time in Riyadh is >= 20:00 (8 PM), default slaughter to tomorrow
  const initialDate = riyadhCurrentHour >= 20 ? riyadhTomorrowStr : riyadhTodayStr;
  const initialTime = (riyadhCurrentHour >= 20 || riyadhCurrentHour < 8)
    ? 'فترة الصباح (08:00 ص - 12:00 م)'
    : 'خلال 2 - 4 ساعات';
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [slaughterDate, setSlaughterDate] = useState<string>(initialDate);
  const [customDate, setCustomDate] = useState<string>('');
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  const [slaughterTime, setSlaughterTime] = useState<string>(initialTime);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [backendMethods, setBackendMethods] = useState<PaymentMethod[]>([]);
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('moyasar');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);
  const [loyaltySummary, setLoyaltySummary] = useState<{
    availablePoints: number;
    redemptionRate: number;
    minRedemption: number;
    isEligible: boolean;
  } | null>(null);

  useEffect(() => {
    const loadCheckoutData = async () => {
      setLoadingBranches(true);
      try {
        await fetchCart();
        const [branchesList, summaryRes, methodsRes] = await Promise.all([
          branchesApi.getBranches().catch(() => []),
          ordersApi.getCheckoutSummary().catch(() => null),
          ordersApi.getPaymentMethods().catch(() => []),
        ]);
        setBranches(branchesList);
        if (branchesList.length > 0) {
          setSelectedBranchId(branchesList[0].id);
        }
        if (summaryRes) {
          setDeliveryFee(0);
          if (summaryRes.loyalty) {
            const l = summaryRes.loyalty;
            const avail = Number(l.available_points || 0);
            const rate = Number(l.redemption_rate || 4.0);
            const minRed = Number(l.min_redemption || 500);
            setLoyaltySummary({
              availablePoints: avail,
              redemptionRate: rate > 0 ? rate : 4.0,
              minRedemption: minRed,
              isEligible: avail >= minRed,
            });
          }
        }
        // Fallback: If loyalty points wasn't in summary or 0, check user profile
        try {
          const profile = await profileApi.getProfile();
          if (profile && profile.loyaltyPoints > 0) {
            setLoyaltySummary((prev) => {
              const currentAvail = prev?.availablePoints || 0;
              const pts = Math.max(currentAvail, profile.loyaltyPoints);
              const rate = prev?.redemptionRate || 4.0;
              const minRed = prev?.minRedemption || 500;
              return {
                availablePoints: pts,
                redemptionRate: rate,
                minRedemption: minRed,
                isEligible: pts >= minRed,
              };
            });
          }
        } catch (_) {}
        if (methodsRes && methodsRes.length > 0) {
          setBackendMethods(methodsRes);
        }
      } finally {
        setLoadingBranches(false);
      }
    };
    loadCheckoutData();
  }, []);

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

  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  const paymentOptions = [
    {
      id: 'moyasar',
      label: isAr ? 'الدفع الإلكتروني (ميسر)' : 'Electronic Payment (Moyasar)',
      icon: CreditCard,
      subtitle: isAr ? 'مدى، فيزا، ماستركارد، وApple Pay' : 'Mada, Visa, MasterCard & Apple Pay',
    },
    {
      id: 'cod',
      label: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery',
      icon: Banknote,
      subtitle: isAr ? 'نقداً أو بالبطاقة عند وصول المندوب' : 'Cash or card on arrival',
    },
  ];

  const lines = cart?.lines || [];
  const subtotal = cart?.subtotal || lines.reduce((s, l) => s + (l.lineTotal || 0), 0);
  const shippingFee = 0;

  // Loyalty Points Settlement Calculations
  const availablePoints = loyaltySummary?.availablePoints || 0;
  const redemptionRate = (loyaltySummary?.redemptionRate || 4.0) > 0 ? (loyaltySummary?.redemptionRate || 4.0) : 4.0;
  const minRedemption = loyaltySummary?.minRedemption || 500;
  const isLoyaltyEligible = availablePoints >= minRedemption;
  const pointsMonetaryValue = availablePoints > 0 ? Number((availablePoints / redemptionRate).toFixed(2)) : 0;

  const maxOrderPayable = Math.max(0, subtotal - discountAmount);
  const loyaltyDiscount = (redeemPoints && isLoyaltyEligible && maxOrderPayable > 0)
    ? Math.min(pointsMonetaryValue, maxOrderPayable)
    : 0;

  const total = Math.max(0, subtotal - discountAmount - loyaltyDiscount);

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

    if (isSubmittingRef.current || submitting) return;

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

    if (deliveryType === 'pickup') {
      if (branches.length > 0 && !selectedBranchId) {
        addToast({
          type: 'error',
          title: t('missing_branch_title', 'يرجى اختيار الفرع'),
          message: t('missing_branch_msg', 'يرجى تحديد فرع الاستلام للمتابعة'),
        });
        return;
      }
    }

    isSubmittingRef.current = true;
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

      const resolvePaymentMethodId = (paymentCode: string): number => {
        if (backendMethods.length > 0) {
          if (paymentCode === 'cod') {
            const found = backendMethods.find((m) => m.code === 'cod');
            if (found) return found.id;
          } else {
            const found =
              backendMethods.find((m) => m.code === 'moyasar' || m.provider === 'moyasar') ||
              backendMethods.find((m) => m.code === 'mada' || m.code === 'card' || m.code === 'apple_pay');
            if (found) return found.id;
          }
        }
        return paymentCode === 'cod' ? 1 : 9;
      };

      const resolvedPaymentMethodId = resolvePaymentMethodId(selectedPayment);
      
      // Ensure backend cart has items before checkout
      const currentBackendCart = await cartApi.getCart().catch(() => null);
      if (!currentBackendCart || !currentBackendCart.lines || currentBackendCart.lines.length === 0) {
        if (lines.length > 0) {
          for (const line of lines) {
            try {
              await cartApi.addToCart({
                productId: line.productId,
                quantity: line.quantity,
                sizeId: line.sizeId,
                cuttingOptionId: line.cuttingOption?.id,
                packagingIds: line.packagingOptions?.map((p: any) => p.id),
                excludedPartIds: line.excludedParts?.map((e: any) => e.id),
                notes: line.notes,
              });
            } catch (_) {}
          }
        } else {
          addToast({
            type: 'error',
            title: t('empty_cart_title', 'السلة فارغة'),
            message: t('empty_cart_msg', 'يرجى إضافة منتجات إلى السلة أولاً'),
          });
          return;
        }
      }

      const currentRiyadhToday = getRiyadhDateString(0);
      let effectiveSlaughterDate = isCustomDate && customDate ? customDate : (slaughterDate || currentRiyadhToday);
      if (effectiveSlaughterDate < currentRiyadhToday) {
        effectiveSlaughterDate = currentRiyadhToday;
      }
      if (effectiveSlaughterDate === currentRiyadhToday && riyadhCurrentHour >= 20) {
        effectiveSlaughterDate = getRiyadhDateString(1);
      }

      let effectiveSlaughterTime = slaughterTime || (deliveryType === 'pickup' ? 'خلال 1 - 2 ساعة من التجهيز' : 'خلال 2 - 4 ساعات');
      if (
        effectiveSlaughterDate === currentRiyadhToday &&
        (riyadhCurrentHour >= 20 || riyadhCurrentHour < 8) &&
        (effectiveSlaughterTime.includes('2 - 4') || effectiveSlaughterTime.includes('1 - 2'))
      ) {
        effectiveSlaughterTime = 'فترة الصباح (08:00 ص - 12:00 م)';
      }

      const apiResult = await ordersApi.checkout({
        deliveryType: deliveryType === 'pickup' ? 'pickup' : 'address',
        addressId: deliveryType === 'delivery' ? addressId : undefined,
        branchId: deliveryType === 'pickup' ? (selectedBranchId || undefined) : undefined,
        paymentMethodId: resolvedPaymentMethodId,
        notes: notes.trim() || undefined,
        couponCode: couponCode || undefined,
        redeemPoints: (redeemPoints && isLoyaltyEligible) ? true : undefined,
        slaughterDate: effectiveSlaughterDate,
        slaughterTime: effectiveSlaughterTime,
      });

      const selectedBranch = branches.find((b) => b.id === selectedBranchId);
      const districtName = deliveryType === 'pickup'
        ? (selectedBranch ? `${selectedBranch.name} (${selectedBranch.city})` : t('pickup_from_branch_title', 'استلام من المسلخ / الفرع الرئيسي'))
        : (activeAddress ? `${activeAddress.title} - ${activeAddress.city}` : 'الرياض');

      const streetName = deliveryType === 'pickup'
        ? (selectedBranch?.address || t('main_riyadh_branch', 'فرع الرياض الرئيسي'))
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
        deliveryDate: formatRiyadhDisplayDate(effectiveSlaughterDate, isAr),
        deliverySlot: effectiveSlaughterTime,
        subtotal: apiResult.subtotal || subtotal,
        discountAmount: apiResult.discountAmount || discountAmount,
        total: apiResult.total || total,
        createdAt: new Date().toISOString(),
      };

      if (isOnlinePayment) {
        const callbackUrl = `${window.location.origin}/payment/callback`;
        const errorUrl = `${window.location.origin}/payment/callback`;

        const paymentRes = await ordersApi.initiatePayment(
          apiResult.orderId,
          callbackUrl,
          errorUrl,
          selectedPayment
        );

        // Save pending order info with invoiceId in sessionStorage for callback verification
        sessionStorage.setItem(
          'pending_order_info',
          JSON.stringify({
            ...orderResult,
            invoiceId: paymentRes.invoiceId,
          })
        );

        if (paymentRes.paymentUrl) {
          addToast({
            type: 'info',
            title: t('redirecting_to_payment', 'جاري التوجيه لبوابة الدفع...'),
            message: t('redirecting_to_moyasar_desc', 'نقوم بتحويلك إلى بوابة الدفع الآمنة (ميسر) لإتمام سداد طلبك.'),
          });
          // Redirect to Moyasar gateway (cart is preserved until payment is verified successfully)
          window.location.href = paymentRes.paymentUrl;
          return;
        } else {
          throw new Error(t('failed_to_get_payment_url', 'تعذر استخراج رابط الدفع من بوابة ميسر. يرجى المحاولة لاحقاً.'));
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
      const specificErr =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        t('order_submit_failed_msg', 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى');
      addToast({
        type: 'error',
        title: t('order_submit_failed_title', 'تعذر إتمام الطلب'),
        message: specificErr,
      });
    } finally {
      isSubmittingRef.current = false;
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

          {/* 2b. Pickup Branch Selector */}
          {deliveryType === 'pickup' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-brand-500" />
                  <span>{t('select_pickup_branch', 'اختر فرع الاستلام')}</span>
                </h3>
                <span className="text-[11px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                  {branches.length} {t('branches_available', 'فروع متاحة')}
                </span>
              </div>

              {loadingBranches ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t('loading_branches', 'جاري تحميل الفروع...')}
                </div>
              ) : branches.length === 0 ? (
                <div className="p-4 border rounded-xl bg-amber-50 border-amber-200 text-xs text-amber-800">
                  {t('no_branches_found', 'لا توجد فروع مسجلة حالياً. سيتم تجهيز طلبك في الفرع الرئيسي.')}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {branches.map((b) => {
                    const isSelected = selectedBranchId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-brand-50/80 border-brand-500 shadow-xs ring-1 ring-brand-400'
                            : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{b.name}</span>
                              <span className="text-[10px] font-bold text-brand-700 bg-brand-100/70 px-1.5 py-0.2 rounded">
                                {b.city}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span>{b.address}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                              {b.phone && (
                                <span className="font-mono">📞 {b.phone}</span>
                              )}
                              {b.openingHours && (
                                <span>🕒 {b.openingHours}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <input
                          type="radio"
                          name="pickup_branch"
                          checked={isSelected}
                          onChange={() => setSelectedBranchId(b.id)}
                          className="w-4 h-4 accent-brand-500 mt-1 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recipient info for pickup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('pickup_recipient_name', 'اسم الشخص المستلم')} *
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
                    {t('pickup_recipient_phone', 'رقم جوال المستلم')} *
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

          {/* 3. Slaughter Date & Time Slot Picker (Interactive) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>{t('slaughter_date_and_time_title', 'موعد وتاريخ الذبح والتجهيز')}</span>
              </h3>
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-lg">
                {t('riyadh_timezone_badge', 'بتوقيت الرياض (UTC+3)')}
              </span>
            </div>

            {/* Date Selection Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {t('select_slaughter_date', 'اختر يوم الذبح:')}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Today */}
                {(() => {
                  const isTodayPast = riyadhCurrentHour >= 20;
                  const isSelected = !isCustomDate && slaughterDate === riyadhTodayStr;
                  return (
                    <button
                      type="button"
                      disabled={isTodayPast}
                      onClick={() => {
                        setIsCustomDate(false);
                        setSlaughterDate(riyadhTodayStr);
                      }}
                      className={`p-3 rounded-xl border text-start transition cursor-pointer flex flex-col justify-between gap-1 ${
                        isTodayPast
                          ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${isSelected ? 'text-brand-700' : 'text-slate-900'}`}>
                          {t('today', 'اليوم')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatRiyadhDisplayDate(riyadhTodayStr, isAr)}
                      </span>
                      {isTodayPast && (
                        <span className="text-[9px] font-bold text-rose-600 mt-0.5">
                          {t('today_closed', 'انتهت فترات اليوم')}
                        </span>
                      )}
                    </button>
                  );
                })()}

                {/* 2. Tomorrow */}
                {(() => {
                  const isSelected = !isCustomDate && slaughterDate === riyadhTomorrowStr;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDate(false);
                        setSlaughterDate(riyadhTomorrowStr);
                      }}
                      className={`p-3 rounded-xl border text-start transition cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${isSelected ? 'text-brand-700' : 'text-slate-900'}`}>
                          {t('tomorrow', 'غداً')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatRiyadhDisplayDate(riyadhTomorrowStr, isAr)}
                      </span>
                    </button>
                  );
                })()}

                {/* 3. Day After Tomorrow */}
                {(() => {
                  const isSelected = !isCustomDate && slaughterDate === riyadhDayAfterStr;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDate(false);
                        setSlaughterDate(riyadhDayAfterStr);
                      }}
                      className={`p-3 rounded-xl border text-start transition cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${isSelected ? 'text-brand-700' : 'text-slate-900'}`}>
                          {t('day_after_tomorrow', 'بعد غد')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatRiyadhDisplayDate(riyadhDayAfterStr, isAr)}
                      </span>
                    </button>
                  );
                })()}

                {/* 4. Custom Date */}
                {(() => {
                  const isSelected = isCustomDate;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDate(true);
                        if (!customDate) {
                          setCustomDate(riyadhTomorrowStr);
                          setSlaughterDate(riyadhTomorrowStr);
                        }
                      }}
                      className={`p-3 rounded-xl border text-start transition cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${isSelected ? 'text-brand-700' : 'text-slate-900'}`}>
                          {t('custom_date', 'تاريخ آخر')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        {isCustomDate && customDate ? formatRiyadhDisplayDate(customDate, isAr) : t('pick_date', 'تحديد من التقويم')}
                      </span>
                    </button>
                  );
                })()}
              </div>

              {/* Custom Date Picker Input (Visible when custom date is chosen) */}
              {isCustomDate && (
                <div className="pt-2">
                  <input
                    type="date"
                    min={riyadhTodayStr}
                    value={customDate || riyadhTomorrowStr}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setSlaughterDate(e.target.value);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-brand-300 focus:border-brand-500 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none transition"
                  />
                </div>
              )}
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                {t('select_slaughter_time_slot', 'فترة الذبح والتجهيز المفضلة:')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'express',
                    title: deliveryType === 'pickup' ? t('pickup_fast_slot', 'خلال 1 - 2 ساعة من التجهيز') : t('instant_direct_slot', 'تجهيز وتوصيل فوري (خلال 2 - 4 ساعات)'),
                    desc: t('slaughter_prep_fresh_tag', 'ذبح طازج وتوصيل مباشر'),
                    disabled: slaughterDate === riyadhTodayStr && (riyadhCurrentHour >= 20 || riyadhCurrentHour < 6),
                    value: deliveryType === 'pickup' ? 'خلال 1 - 2 ساعة من التجهيز' : 'خلال 2 - 4 ساعات',
                  },
                  {
                    id: 'morning',
                    title: t('morning_slot_title', 'فترة الصباح (08:00 ص - 12:00 م)'),
                    desc: t('morning_slot_desc', 'ذبح باكر مع بدء الوردية الصباحية'),
                    disabled: slaughterDate === riyadhTodayStr && riyadhCurrentHour >= 12,
                    value: 'فترة الصباح (08:00 ص - 12:00 م)',
                  },
                  {
                    id: 'noon',
                    title: t('noon_slot_title', 'فترة الظهر (12:00 م - 04:00 م)'),
                    desc: t('noon_slot_desc', 'ذبح وتجهيز فترة الظهيرة'),
                    disabled: slaughterDate === riyadhTodayStr && riyadhCurrentHour >= 16,
                    value: 'فترة الظهر (12:00 م - 04:00 م)',
                  },
                  {
                    id: 'evening',
                    title: t('evening_slot_title', 'فترة المساء (04:00 م - 08:00 م)'),
                    desc: t('evening_slot_desc', 'ذبح وتجهيز الفترة المسائية'),
                    disabled: slaughterDate === riyadhTodayStr && riyadhCurrentHour >= 20,
                    value: 'فترة المساء (04:00 م - 08:00 م)',
                  },
                ].map((slot) => {
                  const isSelected = slaughterTime === slot.value || (slot.id === 'express' && (slaughterTime.includes('2 - 4') || slaughterTime.includes('1 - 2')));
                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        if (!slot.disabled) {
                          setSlaughterTime(slot.value);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-2.5 ${
                        slot.disabled
                          ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500 shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                        <div>
                          <div className={`text-xs font-black ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>
                            {slot.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {slot.desc}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {slot.disabled ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-full">
                            {t('slot_expired', 'انتهت الفترة')}
                          </span>
                        ) : isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-600" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Estimation Note */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
              <Truck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                {deliveryType === 'pickup'
                  ? t('pickup_estimate_info', 'الاستلام من الفرع: تُجهز الذبيحة وتكون جاهزة للاستلام خلال ساعة إلى ساعتين من موعد الذبح.')
                  : t('delivery_estimate_info', 'التوصيل المبرد: تُنقل الذبائح في سيارات مجهزة ومبردة (4°C) وتصلكم خلال 2 إلى 4 ساعات بعد الذبح والتجهيز.')}
              </span>
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

          {/* 5. Loyalty Points Settlement (تسوية النقاط لفلوس) */}
          <div className={`rounded-2xl border p-5 space-y-3 transition-all ${
            redeemPoints && isLoyaltyEligible
              ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/40 border-amber-400 shadow-xs ring-1 ring-amber-300'
              : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  redeemPoints && isLoyaltyEligible ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <span>{t('loyalty_redemption_title', 'استبدال وتسوية نقاط الولاء لفلوس')}</span>
                    {availablePoints > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {availablePoints} {t('points', 'نقطة')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {availablePoints > 0
                      ? `${t('points_equivalent_to', 'نقاطك تعادل')} ${pointsMonetaryValue.toFixed(2)} ${t('sar', 'ر.س')} ${t('direct_discount', 'خصم مباشر من الفاتورة')}`
                      : t('no_points_available', 'ليس لديك نقاط ولاء حالياً. تكتسب نقاطاً تلقائياً مع كل طلب!')}
                  </div>
                </div>
              </div>

              {/* Modern Switch Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isLoyaltyEligible}
                  checked={redeemPoints && isLoyaltyEligible}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  isLoyaltyEligible
                    ? 'peer-checked:bg-amber-500 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}></div>
              </label>
            </div>

            {/* Loyalty Feedback Message */}
            {availablePoints > 0 ? (
              isLoyaltyEligible ? (
                redeemPoints ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-100/70 border border-amber-300/80 rounded-xl p-3">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      {t('points_applied_msg', 'تم تفعيل تسوية النقاط! تم خصم')} {loyaltyDiscount.toFixed(2)} {t('sar', 'ر.س')} {t('from_order_total', 'من إجمالي طلبك.')}
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('toggle_to_redeem_points', 'فعّل الزر أعلاه لاستخدام نقاطك وخصم قيمتها فوراً من إجمالي الفاتورة.')}</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-100/80 rounded-xl p-2.5 border border-slate-200">
                  <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    {t('min_points_warning', 'الحد الأدنى للاستبدال هو')} {minRedemption} {t('points', 'نقطة')}. ({t('you_need', 'تحتاج إلى')} {Math.max(0, minRedemption - availablePoints)} {t('more_points_to_redeem', 'نقطة إضافية للتمكن من الاستبدال')}).
                  </span>
                </div>
              )
            ) : null}
          </div>

          {/* 6. Special Notes */}
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

              {loyaltyDiscount > 0 && (
                <div className="flex items-center justify-between text-amber-700 bg-amber-50/90 border border-amber-200/90 px-2.5 py-1.5 rounded-xl font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('loyalty_points_discount_label', 'خصم تسوية النقاط:')}</span>
                  </span>
                  <span className="font-mono">- {loyaltyDiscount.toFixed(2)} {t('sar', 'ر.س')}</span>
                </div>
              )}

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

            {/* Terms & Privacy Agreement Trigger (Opens in New Tab) */}
            <div className="pb-1 text-center">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[11px] text-slate-500 hover:text-brand-600 transition cursor-pointer"
              >
                <span>{isRtl ? 'بالضغط على تأكيد الطلب، فإنك توافق على ' : 'By placing the order, you agree to the '}</span>
                <span className="font-bold underline text-brand-600 underline-offset-2">
                  {isRtl ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms of Service & Privacy Policy'}
                </span>
                <ExternalLink className="w-3 h-3 text-brand-600 flex-shrink-0" />
              </a>
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
                  : t('proceed_to_moyasar', 'المتابعة إلى بوابة الدفع الآمن (ميسر)')}
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

      {/* Privacy Policy & Terms Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};