import React from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, QrCode, Star } from 'lucide-react';

export const AppDownloadBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-100 via-rose-50 to-slate-100 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Text details */}
          <div className="space-y-3 text-center md:text-start max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('mobile_app_tag', 'تطبيق ذبائح المملكة للجوال')}</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              {t('app_banner_headline', 'حمل التطبيق واستمتع بتجربة تسوق أسرع وعروض حصرية')}
            </h3>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {t('app_banner_desc', 'تتبع مسار ذبيحتك من المسلخ حتى باب منزلك مع إشعارات مباشرة لحالة الطلب وعروض إضافية حصرية لمستخدمي التطبيق.')}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {/* App store buttons */}
              <a
                href="#app-store"
                className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-xs"
              >
                <span>App Store</span>
                <span className="text-[10px] text-slate-400">iOS</span>
              </a>

              <a
                href="#google-play"
                className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-xs"
              >
                <span>Google Play</span>
                <span className="text-[10px] text-slate-400">Android</span>
              </a>
            </div>
          </div>

          {/* QR code and mockup pill */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-1">
              <div className="text-center font-mono text-[10px] text-slate-400">
                <QrCode className="w-14 h-14 mx-auto text-slate-800" />
              </div>
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-900">{t('scan_qr_code', 'امسح الكود بجوالك')}</div>
              <div className="text-[11px] text-slate-500">{t('instant_download_prompt', 'للتحميل الفوري والمباشر')}</div>
              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{t('store_rating_badge', 'تقييم 4.9 في المتجر')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
