import React, { useEffect } from 'react';
import {
  Bell,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  User,
  ShoppingBag,
} from 'lucide-react';
import { useAdminNotificationStore } from '../store/useAdminNotificationStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AdminOrder } from '../api/adminApi';

interface AdminOrderAlertBannerProps {
  onViewOrder?: (order: AdminOrder) => void;
}

export const AdminOrderAlertBanner: React.FC<AdminOrderAlertBannerProps> = ({ onViewOrder }) => {
  const { activePopup, dismissPopup } = useAdminNotificationStore();
  const { isRTL } = useLanguageStore();

  useEffect(() => {
    if (!activePopup) return;
    const timer = setTimeout(() => {
      dismissPopup();
    }, 12000);
    return () => clearTimeout(timer);
  }, [activePopup, dismissPopup]);

  if (!activePopup) return null;

  return (
    <div
      role="alert"
      className="fixed top-18 sm:top-20 z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-4 inset-x-3 sm:inset-x-auto"
      style={{
        [isRTL ? 'left' : 'right']: '1rem',
        maxWidth: '420px',
        width: 'calc(100vw - 1.5rem)',
      }}
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-3.5 sm:p-4 overflow-hidden relative">
        {/* Glowing backdrop blur accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
              <Bell className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>{isRTL ? 'وصل طلب جديد الآن!' : 'New Order Received!'}</span>
            </div>
          </div>

          <button
            onClick={dismissPopup}
            className="min-w-[44px] min-h-[44px] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
            title={isRTL ? 'إغلاق' : 'Dismiss'}
            aria-label={isRTL ? 'إغلاق' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-2.5 sm:py-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {activePopup.name || `#${activePopup.id}`}
            </span>
            <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
              {Number(activePopup.total || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-[11px] font-bold">{isRTL ? 'ر.س' : 'SAR'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{activePopup.customerName || (isRTL ? 'عميل جديد' : 'Customer')}</span>
            {activePopup.customerPhone && (
              <span className="text-slate-400 font-mono text-[11px]">({activePopup.customerPhone})</span>
            )}
          </div>

          {activePopup.paymentMethod && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <CreditCard className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span>{activePopup.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (onViewOrder) {
                onViewOrder(activePopup);
              }
              dismissPopup();
            }}
            className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <span>{isRTL ? 'عرض تفاصيل الطلب فوراً' : 'View Order Details'}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={dismissPopup}
            className="min-h-[44px] py-2 px-3 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer flex items-center justify-center"
          >
            {isRTL ? 'تجاهل' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
