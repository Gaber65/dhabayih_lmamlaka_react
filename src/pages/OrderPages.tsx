import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShoppingBag,
  Eye,
  ShieldCheck,
  Truck,
  Store,
  PhoneCall,
  RotateCcw,
  Check,
  Stethoscope,
  Scissors,
  Home,
  MapPin,
  Calendar,
  Printer,
  FileText,
} from 'lucide-react';
import { ordersApi } from '../api/orders';
import { OrderDetail, OrderListItem } from '../types/order.types';
import { CartoonLoadingState } from '../components/common/CartoonLoadingState';
import { CartoonEmptyState } from '../components/common/CartoonEmptyState';
import { useUIStore } from '../store/useUIStore';
import { InvoiceModal } from '../components/order/InvoiceModal';

export const OrderSuccessPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  const isRtl = i18n.language === 'ar';
  const [showInvoice, setShowInvoice] = useState(false);

  const orderNumber = result?.orderNumber || 'ORD-0001';
  const orderId = result?.orderId || 1;
  const total = result?.total || 0;
  const isPickup = result?.deliveryType === 'pickup';
  
  const locationLabel = isPickup
    ? t('pickup_from_branch', 'استلام من المسلخ / الفرع الرئيسي (الرياض)')
    : (result?.district || t('riyadh_central', 'الرياض'));

  const timeLabel = isPickup
    ? t('ready_for_pickup_in', 'جاهز للاستلام خلال 1 - 2 ساعة من التجهيز')
    : (result?.deliverySlot || t('instant_delivery_time', 'خلال 2 - 4 ساعات'));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-md space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('order_confirmed_success', 'تم اعتماد وتأكيد طلبك بنجاح')}</span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {t('thank_you_order_received', 'شكراً لك! تم استلام طلبك بنجاح')}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium max-w-md mx-auto mt-2 leading-relaxed">
            {t('order_number_is', 'رقم طلبك هو')} <b className="text-slate-900 font-mono">#{orderNumber}</b>. {t('order_preparation_msg', 'سيبدأ فريق القصابين والأطباء البيطريين بتجهيز ذبيحتك وفق أعلى معايير الجودة والنظافة.')}
          </p>
        </div>

        {/* Quick Details Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-start grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
              {isPickup ? <Store className="w-3.5 h-3.5 text-brand-500" /> : <MapPin className="w-3.5 h-3.5 text-brand-500" />}
              <span>{isPickup ? t('pickup_location', 'موقع الاستلام:') : t('delivery_location', 'موقع التوصيل:')}</span>
            </span>
            <b className="text-slate-900 font-bold">{locationLabel}</b>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>{isPickup ? t('pickup_time', 'وقت الاستلام:') : t('delivery_time', 'موعد التوصيل:')}</span>
            </span>
            <b className="text-slate-900 font-bold">{timeLabel}</b>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">
              <span>{t('total_amount', 'المبلغ الإجمالي:')}</span>
            </span>
            <b className="text-brand-500 font-mono font-black text-sm">{total.toLocaleString('en-US')} {t('sar', 'ر.س')}</b>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowInvoice(true)}
            className="px-5 py-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-700" />
            <span>{t('view_tax_invoice', 'عرض الفاتورة الضريبية')}</span>
          </button>

          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t('track_sacrifice_and_delivery', 'متابعة مسار الذبيحة والتوصيل')}</span>
          </button>

          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            {t('back_to_home', 'العودة للصفحة الرئيسية')}
          </button>
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        orderId={orderId}
      />
    </div>
  );
};

import { useAuthStore } from '../store/useAuthStore';

export const OrdersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isRtl = i18n.language === 'ar';

  const getOrderBadge = (state: string) => {
    switch (state) {
      case 'delivered':
        return {
          label: t('order_status_delivered', 'تم التوصيل بنجاح'),
          className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        };
      case 'cancelled':
        return {
          label: t('order_status_cancelled', 'ملغي'),
          className: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      case 'refunded':
        return {
          label: t('order_status_refunded', 'مسترجع'),
          className: 'bg-purple-50 text-purple-700 border border-purple-200',
        };
      case 'confirmed':
        return {
          label: t('order_status_confirmed', 'تم التأكيد'),
          className: 'bg-blue-50 text-blue-700 border border-blue-200',
        };
      case 'preparing':
        return {
          label: t('order_status_preparing', 'جاري التجهيز والذبح'),
          className: 'bg-amber-50 text-amber-800 border border-amber-200',
        };
      case 'ready_pickup':
        return {
          label: t('order_status_ready', 'جاهز للاستلام'),
          className: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        };
      case 'out_delivery':
        return {
          label: t('order_status_out', 'في الطريق مبرد'),
          className: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
        };
      case 'pending_payment':
      case 'draft':
      default:
        return {
          label: t('order_status_pending', 'في انتظار الدفع'),
          className: 'bg-slate-100 text-slate-700 border border-slate-200',
        };
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const stateParam = activeTab === 'all' ? undefined : activeTab;
        const res = await ordersApi.getOrders(stateParam);
        setOrders(res);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, activeTab, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-[70vh]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/home" className="flex items-center gap-1 hover:text-brand-500 transition">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home', 'الرئيسية')}</span>
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">{t('order_history', 'سجل الطلبات')}</span>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900">
          {t('my_orders_tracking', 'سجل طلباتي وتتبع الذبائح')}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {t('track_orders_sub', 'تابع مسار ذبائحك خطوة بخطوة من المسلخ وحتى الاستلام المبرد')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: 'all', label: t('all_orders', 'جميع الطلبات') },
          { id: 'active', label: t('active_orders', 'الطلبات الجارية') },
          { id: 'completed', label: t('completed_orders', 'الطلبات المكتملة') },
          { id: 'cancelled', label: t('cancelled_orders', 'الطلبات الملغاة والمسترجعة') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <CartoonLoadingState message={t('loading_orders', 'جاري استرجاع سجل الطلبات...')} />
      ) : orders.length === 0 ? (
        <CartoonEmptyState
          title={t('no_orders_found', 'لا توجد طلبات في هذا القسم حالياً')}
          description={t('browse_catalog_prompt', 'يمكنك تصفح سوق الذبائح واختيار ذبيحتك البلدية المفضلة')}
          actionText={t('browse_sacrifices', 'تصفح جميع الذبائح')}
          onAction={() => navigate('/categories')}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const badge = getOrderBadge(order.state);
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-500 p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{order.name}</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{order.date}</div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="font-mono text-base font-black text-slate-900">
                    {order.total.toLocaleString('en-US')} {t('sar', 'ر.س')}
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-brand-600 font-bold text-xs transition border border-slate-200 flex items-center gap-1">
                    <span>{t('track_timeline', 'تتبع المسار')}</span>
                    {isRtl ? <span>➔</span> : <span>→</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await ordersApi.getOrderDetail(Number(id));
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return <CartoonLoadingState message={t('loading_order_details', 'جاري استرجاع تفاصيل ومسار الذبيحة...')} />;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{t('order_not_found', 'تعذر العثور على بيانات الطلب')}</h2>
        <p className="text-xs text-slate-500">
          {t('order_not_found_desc', 'لم يتم العثور على الطلب المطلوب أو أنه لم يعد متاحاً في النظام.')}
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs cursor-pointer"
        >
          {t('back_to_orders', 'الرجوع لقائمة الطلبات')}
        </button>
      </div>
    );
  }

  const getStatusInfo = (state: string) => {
    switch (state) {
      case 'draft':
      case 'pending_payment':
        return {
          title: t('order_status_pending_payment', 'في انتظار تأكيد الدفع'),
          className: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'confirmed':
        return {
          title: t('order_status_confirmed', 'تم تأكيد الطلب واعتماده'),
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'preparing':
        return {
          title: t('order_status_preparing', 'جاري التجهيز والذبح في المسلخ'),
          className: 'bg-brand-50 text-brand-700 border-brand-200',
        };
      case 'ready_pickup':
        return {
          title: t('order_status_ready_pickup', 'جاهز للاستلام / الفحص البيطري مكتمل'),
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'out_delivery':
        return {
          title: t('order_status_out_delivery', 'في الطريق بسيارة التبريد 🚐'),
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'delivered':
        return {
          title: t('order_status_delivered', 'تم التوصيل والاستلام بنجاح'),
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'cancelled':
        return {
          title: t('order_status_cancelled', 'تم إلغاء الطلب'),
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'refunded':
        return {
          title: t('order_status_refunded', 'تم استرجاع المبلغ'),
          className: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      default:
        return {
          title: state,
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const getStepProgress = (state: string) => {
    switch (state) {
      case 'delivered':
        return 5;
      case 'out_delivery':
        return 4;
      case 'ready_pickup':
        return 3;
      case 'preparing':
        return 2;
      case 'confirmed':
        return 1;
      case 'draft':
      case 'pending_payment':
      default:
        return 0;
    }
  };

  const currentProgress = getStepProgress(order.state);
  const statusInfo = getStatusInfo(order.state);
  const isCancelled = order.state === 'cancelled';

  const trackingSteps = [
    {
      title: t('step_order_received', 'تم استلام وتأكيد الطلب'),
      desc: t('step_order_received_desc', 'تم تثبيت الطلب وتخصيص الذبيحة في المسلخ'),
      done: currentProgress >= 1,
      current: currentProgress === 1,
      icon: Check,
    },
    {
      title: t('step_butchery_packaging', 'الذبح والتقطيع والتغليف'),
      desc: t('step_butchery_packaging_desc', 'الذبح الحلال وتجهيز القطع والتغليف سحب هواء'),
      done: currentProgress >= 2,
      current: currentProgress === 2,
      icon: Scissors,
    },
    {
      title: t('step_vet_check', 'الفحص البيطري المعتمد'),
      desc: t('step_vet_check_desc', 'معاينة الطبيب البيطري وختم الجودة والسلامة'),
      done: currentProgress >= 3,
      current: currentProgress === 3,
      icon: Stethoscope,
    },
    {
      title: t('step_refrigerated_transit', 'في الطريق بسيارة مبردة 4°C'),
      desc: t('step_refrigerated_transit_desc', 'المندوب في طريقه لعنوانك بالرياض'),
      done: currentProgress >= 4,
      current: currentProgress === 4,
      icon: Truck,
    },
    {
      title: t('step_delivered', 'تم التوصيل والاستلام'),
      desc: t('step_delivered_desc', 'تسليم الذبيحة طازجة لباب منزلك'),
      done: currentProgress >= 5,
      current: currentProgress === 5,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-500 transition cursor-pointer"
      >
        {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        <span>{t('back_to_orders', 'الرجوع لسجل الطلبات')}</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">{order.name}</h1>
            <span className={`border text-xs font-black px-2.5 py-0.5 rounded-md ${statusInfo.className}`}>
              {statusInfo.title}
            </span>
            {order.paymentStatus === 'paid' ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                ✓ {t('paid_badge', 'تم السداد')}
              </span>
            ) : order.paymentStatus === 'pending' ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                ⏳ {t('pending_payment_badge', 'بانتظار الدفع')}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('order_time', 'وقت الطلب:')} {order.date} • {t('delivery_est', 'التوصيل المتوقع: فوري اليوم')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowInvoice(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print_invoice_btn', 'طباعة الفاتورة')}</span>
          </button>

          <a
            href="tel:920000000"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-brand-500" />
            <span>{t('call_support', 'الاتصال بالدعم (920000000)')}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step-by-Step Visual Roadmap (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-500" />
            <span>{t('order_journey_title', 'مسار تجهيز وتوصيل الذبيحة المباشر')}</span>
          </h3>

          <div className="relative ps-6 space-y-6 border-s-2 border-slate-200 ms-3">
            {trackingSteps.map((st, idx) => {
              const Icon = st.icon;

              return (
                <div key={idx} className="relative">
                  {/* Step bullet */}
                  <div
                    className={`absolute -start-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      st.done
                        ? 'bg-brand-500 text-white shadow-sm ring-4 ring-brand-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h4 className={`text-xs font-black ${st.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {st.title}
                      {st.current && (
                        <span className="ms-2 bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded animate-pulse">
                          {t('current_stage', 'المرحلة الحالية')}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Van details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                🚐
              </div>
              <div>
                <div className="font-bold text-slate-900">{t('refrigerated_van_label', 'سيارة تبريد مخصصة #42')}</div>
                <div className="text-[11px] text-slate-500">{t('van_temp_safe', 'درجة حرارة الصندوق: 3.8°C (ضمن النطاق الآمن)')}</div>
              </div>
            </div>

            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold text-[11px]">
              {t('realtime_temp_monitoring', 'مراقبة حرارية فورية')}
            </span>
          </div>
        </div>

        {/* Right: Items & Receipt Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              {t('invoice_details', 'تفاصيل الفاتورة والمشتريات')}
            </h3>
            <button
              onClick={() => setShowInvoice(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print_invoice_btn', 'طباعة الفاتورة')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {order.lines.map((line) => (
              <div key={line.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{line.name}</span>
                  <span className="font-mono font-black text-xs text-slate-900">
                    {(line.priceSubtotal || line.priceUnit * line.quantity).toLocaleString('en-US')} {t('sar', 'ر.س')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {line.cuttingOption && <span>{t('cutting', 'التقطيع')}: {line.cuttingOption.name} • </span>}
                  {line.packaging && <span>{t('packaging', 'التغليف')}: {line.packaging.name}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal', 'المجموع الفرعي')}:</span>
              <span className="font-mono font-bold">{order.subtotal.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('refrigerated_delivery_fee', 'رسوم التوصيل المبرد')}:</span>
              <span className="text-emerald-600 font-bold">{t('free', 'مجاني')}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-100 pt-2">
              <span>{t('total_due', 'المجموع النهائي')}:</span>
              <span className="font-mono text-brand-600 text-base">{order.total.toLocaleString('en-US')} {t('sar', 'ر.س')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/categories')}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer mt-2"
          >
            {t('order_another_sacrifice', 'طلب ذبيحة أخرى ➔')}
          </button>
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        orderId={order.id}
        initialOrder={order}
      />
    </div>
  );
};