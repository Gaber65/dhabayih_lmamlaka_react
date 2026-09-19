import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Globe, LogOut, MapPin, Sparkles, Coins } from 'lucide-react';
import { profileApi } from '../api/profile';
import { UserProfile } from '../types/profile.types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useUIStore } from '../store/useUIStore';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, toggleLanguage } = useLanguageStore();
  const { addToast } = useUIStore();
  const isRtl = i18n.language === 'ar';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await profileApi.getProfile();
        setProfile(p);
        setName(p.name);
        setPhone(p.phone);
        setPushEnabled(p.pushNotificationsEnabled);
      } catch {
        if (user) {
          setName(user.name);
          setPhone(user.phone || '');
        }
      }
    };
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.updateProfile({
        name,
        phone,
        pushNotificationsEnabled: pushEnabled,
      });
      addToast({
        type: 'success',
        title: t('profile', 'الملف الشخصي'),
        message: t('profile_updated_success', 'تم حفظ التعديلات بنجاح!'),
      });
    } catch {
      addToast({
        type: 'success',
        title: t('profile', 'الملف الشخصي'),
        message: t('profile_updated_success', 'تم حفظ التعديلات!'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm(t('logout_confirm', 'هل أنت متأكد من تسجيل الخروج؟'))) return;
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t('login_to_view_profile', 'سجل الدخول لعرض حسابك')}</h2>
        <p className="text-xs text-slate-500 font-semibold">
          {t('login_benefits_prompt', 'تابع طلباتك السابقة ورصيد نقاط الولاء واستمتع بالعروض الحصرية')}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs transition cursor-pointer shadow-xs"
        >
          {t('sign_in', 'تسجيل الدخول')}
        </button>
      </div>
    );
  }

  const loyaltyPoints = profile?.loyaltyPoints || 0;
  const pointsSarEquivalent = (loyaltyPoints / 10).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {t('my_account', 'الحساب الشخصي')}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">
          {t('profile', 'الملف الشخصي')}
        </h1>
        <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
          {t('manage_account_desc', 'إدارة بيانات الحساب ونقاط الولاء والإعدادات')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loyalty & Quick Stats */}
        <div className="lg:col-span-5 space-y-4">
          {/* Loyalty Points Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-amber-500/40 p-6 text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>{t('loyalty_points', 'نقاط الولاء')}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div className="text-3xl md:text-4xl font-black text-white">
              {loyaltyPoints} <span className="text-sm font-bold text-amber-400">{t('points_unit', 'نقطة')}</span>
            </div>

            <p className="text-xs font-bold text-slate-300 leading-relaxed">
              {t('points_equivalent', { sar: pointsSarEquivalent }) || `تعادل حوالي ${pointsSarEquivalent} ريال سعودي يمكن خصمها من طلباتك`}
            </p>
          </div>

          {/* Quick Nav Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            <button
              onClick={() => navigate('/addresses')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer text-start"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-500" />
                <span className="text-xs md:text-sm font-black text-slate-900">
                  {t('my_addresses', 'عناويني المحفوظة')}
                </span>
              </div>
              <span className="text-slate-400 text-xs">←</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer text-start"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-amber-500" />
                <span className="text-xs md:text-sm font-black text-slate-900">
                  {t('language_title', 'لغة التطبيق')}
                </span>
              </div>
              <span className="text-xs font-black text-brand-600">
                {language === 'ar' ? 'English' : 'العربية'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <h3 className="text-base md:text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
            {t('personal_profile_info', 'بيانات الحساب الشخصية')}
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('name', 'الاسم')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {t('email_label', 'البريد الإلكتروني')}
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-500 outline-none opacity-80 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('recipient_phone', 'رقم الجوال')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0500000000"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">{t('notifications_toggle', 'تفعيل الإشعارات والتنبيهات')}</span>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                {saving ? t('saving', 'جاري الحفظ...') : t('save_changes', 'حفظ التعديلات')}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout', 'تسجيل الخروج')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};