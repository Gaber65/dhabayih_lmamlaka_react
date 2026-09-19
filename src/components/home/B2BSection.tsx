import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Utensils, HeartHandshake, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';

export const B2BSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const services = [
    {
      icon: <Building2 className="w-5 h-5 text-brand-500" />,
      title: t('b2b_service_1_title', 'توريد الشركات والمؤسسات'),
      desc: t('b2b_service_1_desc', 'عقود دورية وتوريد لحوم طازجة للشركات والمطابخ المركزية بأسعار جملة تنافسية وفواتير ضريبية.'),
    },
    {
      icon: <Utensils className="w-5 h-5 text-brand-500" />,
      title: t('b2b_service_2_title', 'ولائم الأعراس والمناسبات الكبرى'),
      desc: t('b2b_service_2_desc', 'تجهيز وتوريد عشرات الذبائح في يوم واحد مع التوصيل لمواقع القاعات والاستراحات في الوقت المحدد.'),
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-brand-500" />,
      title: t('b2b_service_3_title', 'العقائق، النذور، وإطعام المساكين'),
      desc: t('b2b_service_3_desc', 'تنفيذ كامل للعقائق والصدقات مع التقطيع والتوزيع على الجمعيات الخيرية المعتمدة وتوثيق مصور.'),
    },
  ];

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('corporate_b2b_tag', 'قطاع الأعمال والمناسبات (B2B)')}</span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                {t('corporate_b2b_headline', 'حلول توريد الذبائح واللحوم للشركات، المطاعم، والمناسبات الكبرى')}
              </h3>

              <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                {t('corporate_b2b_desc_long', 'نوفر كميات كبيرة من المواشي البلدية والمستوردة بجودة استثنائية وبأسعار خاصة للجهات والمطاعم مع فواتير إلكترونية معتمدة وإشراف كامل.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {services.map((srv, idx) => (
                  <div key={idx} className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-brand-400">
                      {srv.icon}
                    </div>
                    <div className="text-xs font-bold text-white">{srv.title}</div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{srv.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Contact Card */}
            <div className="lg:col-span-5 bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto text-white shadow">
                <PhoneCall className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-black text-white">{t('contact_b2b_title', 'تواصل مع قسم المبيعات والطلبات الخاصة')}</h4>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {t('contact_b2b_desc', 'فريقنا متاح لمساعدتكم في تخصيص الكميات والأسعار')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-lg font-black text-amber-400" dir="ltr">
                0500000000 / 920000000
              </div>

              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow"
              >
                <span>{t('request_quote_whatsapp', 'طلب تسعيرة عبر الواتساب مباشرة')}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
