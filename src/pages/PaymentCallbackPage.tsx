import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ordersApi } from '../api/orders';
import { useCartStore } from '../store/useCartStore';

export const PaymentCallbackPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderData, setOrderData] = useState<any>(null);

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    let isMounted = true;

    const verifyTransaction = async () => {
      // 1. Flexible query parameter extraction (handles double '?' or '&' in redirect URL)
      const fullUrl = window.location.href;
      const getQueryParam = (key: string): string | null => {
        const standard = searchParams.get(key);
        if (standard) return standard;
        try {
          const regExp = new RegExp(`[?&]${key}=([^&#]*)`, 'i');
          const match = fullUrl.match(regExp);
          if (match && match[1]) {
            return decodeURIComponent(match[1]);
          }
        } catch (_) {}
        return null;
      };

      // 2. Retrieve pending order info from sessionStorage
      let savedOrder: any = null;
      try {
        const raw = sessionStorage.getItem('pending_order_info');
        if (raw) savedOrder = JSON.parse(raw);
      } catch {}

      const paymentId =
        getQueryParam('id') ||
        getQueryParam('paymentId') ||
        getQueryParam('payment_id') ||
        getQueryParam('Id') ||
        savedOrder?.invoiceId;
      const orderIdParam = getQueryParam('order_id');
      const statusParam = getQueryParam('status')?.toLowerCase();

      const effectiveOrderId = orderIdParam
        ? Number(orderIdParam)
        : savedOrder?.orderId;

      // Helper function to handle verified success
      const handleSuccess = (finalOrderData: any) => {
        if (!isMounted) return;
        setStatus('success');
        setOrderData(finalOrderData);
        clearCart();
        sessionStorage.removeItem('pending_order_info');

        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch {}

        setTimeout(() => {
          navigate('/order-success', {
            replace: true,
            state: {
              order: {
                ...savedOrder,
                ...finalOrderData,
                orderId: finalOrderData.orderId || finalOrderData.id || effectiveOrderId,
                orderNumber: finalOrderData.orderNumber || finalOrderData.name || savedOrder?.orderNumber,
                state: 'confirmed',
                paymentStatus: 'paid',
              },
            },
          });
        }, 2200);
      };

      // 3. Fallback flow: If paymentId is missing or status is paid without an ID
      if (!paymentId) {
        if (effectiveOrderId) {
          // Poll order detail up to 4 times with 1.2s delay to wait for Moyasar webhook/backend
          for (let attempt = 0; attempt < 4; attempt++) {
            if (!isMounted) return;
            try {
              const orderDetail = await ordersApi.getOrderDetail(effectiveOrderId);
              if (
                orderDetail &&
                (orderDetail.paymentStatus === 'paid' ||
                  orderDetail.state === 'confirmed' ||
                  orderDetail.state === 'preparing' ||
                  orderDetail.state === 'delivering')
              ) {
                handleSuccess({
                  ...savedOrder,
                  orderId: orderDetail.id,
                  orderNumber: orderDetail.name,
                  state: orderDetail.state,
                  paymentStatus: orderDetail.paymentStatus,
                  subtotal: orderDetail.subtotal,
                  total: orderDetail.total,
                  success: true,
                });
                return;
              }
            } catch (_) {}

            // Wait before next polling attempt
            if (attempt < 3) {
              await new Promise((res) => setTimeout(res, 1200));
            }
          }
        }

        if (isMounted) {
          setStatus('failed');
          setErrorMessage(
            t(
              'payment_canceled_or_invalid',
              'لم يتم العثور على مرجع عملية الدفع أو تم إلغاء العملية قبل اكتمالها.'
            )
          );
        }
        return;
      }

      // 4. Primary flow: Call server verification endpoint with paymentId
      try {
        let result = await ordersApi.verifyPayment(effectiveOrderId, paymentId);

        // If not successful on first attempt, retry once after 1.5s
        if (!result || (!result.success && result.paymentStatus !== 'paid' && result.state !== 'confirmed')) {
          await new Promise((res) => setTimeout(res, 1500));
          result = await ordersApi.verifyPayment(effectiveOrderId, paymentId);
        }

        if (!isMounted) return;

        if (result && (result.success || result.paymentStatus === 'paid' || result.state === 'confirmed')) {
          handleSuccess({
            ...savedOrder,
            ...result,
            orderId: result.orderId || effectiveOrderId,
            orderNumber: result.orderNumber || savedOrder?.orderNumber,
          });
        } else {
          setStatus('failed');
          setErrorMessage(
            result?.message ||
              t('payment_declined_msg', 'تم رفض عملية الدفع أو لم تكتمل بنجاح من قبل البنك المصدر.')
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('failed');
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            t('payment_verification_error', 'حدث خطأ أثناء التحقق من حالة الدفع مع بوابة ميسر.')
        );
      }
    };

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, clearCart, t]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
        {status === 'verifying' && (
          <div className="space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-brand-600 font-bold">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                {t('verifying_payment_title', 'جاري التحقق من عملية الدفع...')}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t(
                  'verifying_payment_desc',
                  'نقوم الآن بالتواصل الآمن مع بوابة ماي فاتورة للتحقق من اعتماد العملية وتأكيد طلبك. يرجى الانتظار لحفظ تفاصيل الطلب.'
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t('secure_mf_gateway', 'بوابة دفع آمنة ومشفرة 100% معتمدة من البنك المركزي السعودي')}</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-700 text-xs font-bold mb-2">
                {t('payment_verified_badge', 'تم التحقق بنجاح')}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {t('payment_successful_title', 'تم الدفع وتأكيد طلبك بنجاح!')}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t(
                  'payment_successful_desc',
                  'تم استلام مدفوعاتك واعتماد طلبك رسمياً. جاري تحويلك لشاشة ملخص الطلب والتتبع...'
                )}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
              <div className="flex justify-between py-1 text-slate-600">
                <span>{t('order_number_label', 'رقم الطلب:')}</span>
                <span className="font-black text-brand-600">
                  {orderData?.orderNumber || `#${orderData?.orderId || '---'}`}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>{t('payment_status_label', 'حالة الدفع:')}</span>
                <span className="font-bold text-emerald-600">{t('paid_status', 'تم السداد (Paid)')}</span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate('/order-success', {
                  replace: true,
                  state: { order: orderData },
                })
              }
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-500/20 transition"
            >
              <span>{t('view_order_summary', 'عرض تفاصيل الطلب الآن')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 border-4 border-rose-100 flex items-center justify-center text-rose-500">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-bold mb-2">
                {t('payment_unverified_badge', 'لم تكتمل عملية الدفع')}
              </span>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                {t('payment_failed_title', 'تعذر إتمام الدفع أو تم الإلغاء')}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100/60">
                {errorMessage}
              </p>
            </div>

            <div className="text-xs text-slate-500 space-y-1.5 text-start bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-700">📌 {t('important_note', 'ملاحظة هامة:')}</p>
              <p>• {t('not_charged_guarantee', 'لم يتم خصم أي مبالغ من بطاقتك الائتمانية.')}</p>
              <p>• {t('order_not_confirmed_rule', 'لم يتم اعتماد أو إرسال الطلب للمسلخ حفاظاً على حقوقك.')}</p>
              <p>• {t('cart_still_saved', 'منتجاتك وخيارات التقطيع والتغليف ما زالت محفوظة في السلة.')}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-500/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('retry_payment', 'العودة لصفحة الدفع وإعادة المحاولة')}</span>
              </button>

              <Link
                to="/cart"
                className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm text-center transition"
              >
                {t('back_to_cart', 'الرجوع إلى سلة المشتريات')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
