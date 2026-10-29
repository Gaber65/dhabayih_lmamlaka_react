import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Languages,
  Bell,
  Volume2,
  VolumeX,
  Check,
  CheckCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAdminNotificationStore } from '../store/useAdminNotificationStore';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onSelectOrder?: (orderId: number) => void;
  onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onSelectOrder,
  onToggleMobileMenu,
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const { language, toggleLanguage, isRTL } = useLanguageStore();
  const isAr = language === 'ar';

  const {
    soundEnabled,
    toggleSound,
    unreadCount,
    notifications,
    markAllAsRead,
    markAsRead,
  } = useAdminNotificationStore();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [notificationsOpen]);

  return (
    <header className="h-16 px-3 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors w-full">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Menu Button (min 44x44px touch target) */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer shadow-2xs transition-colors shrink-0"
            aria-label={isAr ? 'فتح القائمة الرئيسية' : 'Open navigation menu'}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[140px] xs:max-w-[180px] sm:max-w-xs md:max-w-none">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Toggle Sound Alerts (min 44x44px touch target) */}
        <button
          onClick={toggleSound}
          className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
            soundEnabled
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400'
          }`}
          title={
            soundEnabled
              ? (isAr ? 'صوت تنبيه الطلبات الجديدة: مفعّل (انقر للتعطيل)' : 'New order sound alert: Enabled')
              : (isAr ? 'صوت تنبيه الطلبات الجديدة: معطّل (انقر للتفعيل)' : 'New order sound alert: Muted')
          }
          aria-label={isAr ? 'تبديل صوت التنبيه' : 'Toggle sound alerts'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notification Bell with Dropdown (min 44x44px touch target) */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs relative"
            title={isAr ? 'تنبيهات الطلبات الجديدة' : 'Incoming Order Alerts'}
            aria-label={isAr ? 'الإشعارات' : 'Notifications'}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1.5 end-1.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center px-1 shadow-xs animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {notificationsOpen && (
            <div
              className="fixed inset-x-2 sm:inset-x-auto sm:absolute top-16 sm:top-12 z-50 w-auto sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              style={{
                [isRTL ? 'left' : 'right']: 0,
              }}
            >
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {isAr ? 'الطلبات الواردة والإشعارات' : 'Incoming Orders & Alerts'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 px-1.5 py-0.2 rounded-full">
                      {unreadCount} {isAr ? 'جديد' : 'new'}
                    </span>
                  )}
                </div>

                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 cursor-pointer transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-1.5">
                    <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? 'لا توجد طلبات جديدة حالياً' : 'No new orders yet'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAr
                        ? 'سيتم تنبيهك صوتياً وإشعارك فور قيام أي عميل بطلب ذبيحة'
                        : 'You will receive sound and visual alerts when an order arrives'}
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.orderId);
                        if (onSelectOrder) {
                          onSelectOrder(n.orderId);
                        }
                        setNotificationsOpen(false);
                      }}
                      className={`p-3.5 flex items-start justify-between gap-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100">
                            {n.orderName}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{n.customerName}</span>
                        </div>

                        {n.paymentMethod && (
                          <div className="text-[10px] text-slate-400">
                            {n.paymentMethod}
                          </div>
                        )}
                      </div>

                      <div className="text-end flex-shrink-0 space-y-1">
                        <div className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400">
                          {n.total.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          <span className="text-[10px]">{isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Theme (min 44x44px touch target) */}
        <button
          onClick={toggleTheme}
          className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          title={theme === 'dark' ? 'تبديل للوضع الفاتح' : 'تبديل للوضع الداكن'}
          aria-label={isAr ? 'تبديل المظهر' : 'Toggle theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Toggle Language (min 44x44px touch target) */}
        <button
          onClick={toggleLanguage}
          className="min-h-[44px] px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title={isAr ? 'تغيير اللغة' : 'Change Language'}
          aria-label={isAr ? 'تغيير اللغة' : 'Change Language'}
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{language === 'ar' ? 'English' : 'عربي'}</span>
          <span className="xs:hidden">{language === 'ar' ? 'EN' : 'ع'}</span>
        </button>
      </div>
    </header>
  );
};
