import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, Sparkles, Scissors, Flame, CheckCircle2 } from 'lucide-react';
import { CartoonButton } from '../common/CartoonButton';

export const CartoonHero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white py-12 md:py-20 border-b border-slate-800">
      {/* Ambient glows */}
      <div className="absolute -top-24 -start-24 w-96 h-96 bg-brand-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -end-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left / Main Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            {/* Royal Tag */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-400/30 text-amber-400 text-xs md:text-sm font-extrabold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('splash_tagline', 'طعم الأصالة والجودة العالية')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.2] tracking-tight">
              {t('hero_headline_1', 'أجود الذبائح الطازجة')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200">{t('hero_headline_2', 'بين يديك')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('welcome_sub_1', 'اختر ذبيحتك البلدية أو المستوردة مع خيارات تقطيع وتغليف مخصصة')} و {t('welcome_sub_2', 'توصيل سريع ومبرد مباشرة حتى باب بيتك')} {t('hero_safety_sub', 'بأعلى معايير السلامة والذبح الحلال المعتمد.')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => navigate('/categories')}
                className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm flex items-center gap-2 transition shadow-lg active:scale-95 cursor-pointer"
              >
                <span>{t('start_shopping', 'تصفح قائمة الذبائح')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition active:scale-95 cursor-pointer"
              >
                {t('search_sacrifices_btn', 'ابحث عن ذبيحة')}
              </button>
            </div>

            {/* Trust Bullet Chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs md:text-sm font-bold text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('halal_certified', 'ذبح حلال 100%')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 shadow-sm">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>{t('cold_delivery', 'توصيل مبرد 4°C')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 shadow-sm">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>{t('custom_butchery', 'تقطيع حسب طلبك')}</span>
              </div>
            </div>
          </div>

          {/* Right / Visual Showcase Card */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-xl rounded-3xl border border-slate-700/60 p-6 md:p-8 shadow-2xl space-y-6">
              {/* Header Ribbon */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                    <Flame className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">{t('handpicked_sacrifices', 'ذبائح مختارة بعناية')}</div>
                    <div className="text-[11px] text-amber-400 font-bold">{t('fresh_guaranteed_100', 'طازجة ومضمونة 100%')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('vet_inspected_tag', 'فحص بيطري')}</span>
                </div>
              </div>

              {/* Showcase Image */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-inner group">
                <img
                  src="/images/onboarding/livestock.jpg"
                  alt="ذبائح فاخرة"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-xs font-bold text-white">
                  <span className="bg-brand-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    {t('meat_varieties_tag', 'نعيمي بلدي • حري • هرفي • حاشي')}
                  </span>
                  <span className="text-amber-400 font-extrabold">{t('daily_slaughter_tag', 'ذبح يومي')}</span>
                </div>
              </div>

              {/* Quality Guarantee Details */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-amber-400 font-black text-sm">{t('thermal_packaging_tag', 'تغليف حراري')}</div>
                  <div className="text-slate-400 text-[11px] font-semibold mt-0.5">{t('vacuum_sealed_tag', 'شفط هواء محكم')}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-amber-400 font-black text-sm">{t('cold_vans_tag', 'سيارات مبردة')}</div>
                  <div className="text-slate-400 text-[11px] font-semibold mt-0.5">{t('doorstep_delivery_tag', 'توصيل لباب بيتك')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HeroSection = CartoonHero;