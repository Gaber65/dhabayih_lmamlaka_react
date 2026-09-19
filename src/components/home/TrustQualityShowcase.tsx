import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Award, Scissors, Stethoscope, ThermometerSnowflake, CheckCircle2, Clock, Truck, Sparkles } from 'lucide-react';

export const TrustQualityShowcase: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <ThermometerSnowflake className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-200',
      title: t('quality_feat_1_title', 'سلسلة تبريد ذكية ومحكمة (4°C)'),
      desc: t('quality_feat_1_desc', 'أسطول سيارات مجهز بوحدات تبريد وحساسات مراقبة حرارية لضمان وصول اللحم طازجاً.'),
    },
    {
      icon: <Stethoscope className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
      title: t('quality_feat_2_title', 'فحص بيطري دقيق قبل وبعد الذبح'),
      desc: t('quality_feat_2_desc', 'أطباء بيطريون معتمدون للكشف السريري على الماشية وضمان سلامتها التامة 100%.'),
    },
    {
      icon: <Scissors className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
      title: t('quality_feat_3_title', 'تغليف سحب هواء مفرغ معقم'),
      desc: t('quality_feat_3_desc', 'تغليف عازل للبكتيريا يحفظ القيمة الغذائية ونكهة اللحم البلدي لأطول فترة ممكنة.'),
    },
  ];

  return (
    <section className="py-10 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{t('food_safety_standards_tag', 'معايير الجودة والسلامة الغذائية')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {t('why_choose_us_headline', 'لماذا يختار العملاء ذبائح المملكة؟')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed max-w-xl">
                {t('why_choose_us_desc', 'نلتزم بأعلى معايير الشريعة الإسلامية والاشتراطات الصحية لتقديم لحوم ومواشي طازجة موثوقة من المزرعة وحتى باب منزلك.')}
              </p>
            </div>

            <div className="space-y-3.5">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-start gap-4 shadow-2xs hover:shadow-xs hover:border-brand-300 transition-all group"
                >
                  <div className={`w-11 h-11 rounded-xl ${f.bg} border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Showcase with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5]">
              <img
                src="/hero_butcher.jpg"
                alt="ذبائح المملكة"
                className="w-full h-full object-cover object-top opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Floating Top Badge: Halal Certified */}
              <div className="absolute top-4 end-4 bg-white/95 backdrop-blur-xs rounded-2xl p-3 shadow-lg border border-emerald-200 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t('guarantee', 'ضمان')}</div>
                  <div className="text-xs font-black text-emerald-800">{t('halal_100', 'ذبح حلال 100%')}</div>
                </div>
              </div>

              {/* Floating Bottom Card: Delivery & Stats */}
              <div className="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{t('cold_delivery_fast', 'توصيل مبرد خلال 2 - 4 ساعات')}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{t('all_riyadh_districts', 'تغطية فورية لجميع أحياء الرياض')}</div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-xs font-black text-brand-600 font-mono">+10,000</div>
                    <div className="text-[9px] text-slate-400 font-bold">{t('happy_customers', 'عميل راضٍ')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
