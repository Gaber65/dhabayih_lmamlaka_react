import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin } from 'lucide-react';

export const CartoonFooter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-10 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/app_logo.png"
                alt="ذبائح المملكة"
                className="w-10 h-10 object-contain drop-shadow-xs brightness-110"
              />
              <div className="text-lg font-black text-white">
                {t('app_name', 'ذبائح المملكة')}
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              {t('footer_brand_desc', 'منصتكم المعتمدة لاختيار وتجهيز الذبائح والمواشي البلدية الطازجة مع فحص بيطري وتوصيل مبرد لجميع أحياء الرياض.')}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="bg-slate-800 px-2.5 py-1 rounded font-mono">
                {t('commercial_reg', 'سجل تجاري:')} 1010000000
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded font-mono">
                {t('vat_number', 'الرقم الضريبي:')} 300000000000003
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white">{t('important_links', 'روابط هامة')}</h5>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><Link to="/home" className="hover:text-white transition">{t('home', 'الرئيسية')}</Link></li>
              <li><Link to="/categories" className="hover:text-white transition">{t('all_sacrifices', 'جميع الذبائح')}</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">{t('track_orders', 'تتبع الطلب')}</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">{t('profile', 'الملف الشخصي')}</Link></li>
              <li><Link to="/addresses" className="hover:text-white transition">{t('address_book', 'دفتر العناوين')}</Link></li>
            </ul>
          </div>

          {/* Meat Types */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white">{t('meat_types', 'أنواع الذبائح')}</h5>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><Link to="/categories?cat=1" className="hover:text-white transition">{t('nuaimi_local', 'خروف نعيمي بلدي')}</Link></li>
              <li><Link to="/categories?cat=2" className="hover:text-white transition">{t('harri_fresh', 'خروف حري طازج')}</Link></li>
              <li><Link to="/categories?cat=3" className="hover:text-white transition">{t('teos_local', 'تيس عارضي بلدي')}</Link></li>
              <li><Link to="/categories" className="hover:text-white transition">{t('veal_camel', 'عجل بلدي وحاشي')}</Link></li>
              <li><Link to="/offers" className="hover:text-white transition">{t('flash_deals', 'عروض وخصومات اليوم')}</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white">{t('customer_service_title', 'خدمة العملاء والدعم')}</h5>
            <div className="space-y-2.5 text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span dir="ltr" className="font-mono text-slate-200">920000000 / 0500000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-mono">support@dhabayih.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{t('riyadh_saudi_arabia', 'الرياض، المملكة العربية السعودية')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px] text-center sm:text-start">
          <div>
            © {new Date().getFullYear()} {t('app_name', 'ذبائح المملكة')}. {t('all_rights_reserved', 'جميع الحقوق محفوظة.')}
          </div>

          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">مدى mada</span>
            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Apple Pay</span>
            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Visa / Master</span>
            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">تابي / تمارا</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = CartoonFooter;