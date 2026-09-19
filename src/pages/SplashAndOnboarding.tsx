import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Scissors, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  ArrowLeft, 
  ArrowRight,
  Award
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   1. LUXURY SPLASH SCREEN
   ───────────────────────────────────────────────────────────────────────────── */
export const SplashPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4s smooth load

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        const hasSeen = localStorage.getItem('dhabayih_seen_onboarding');
        navigate(hasSeen ? '/home' : '/onboarding');
      }
    }, 40);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between p-6 overflow-hidden bg-gradient-to-b from-[#1c0407] via-[#2d070c] to-[#120204] text-white select-none">
      {/* Subtle Background Lighting & Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute w-[560px] h-[560px] rounded-full bg-brand-700/15 blur-[120px] animate-pulse" />
        <div className="absolute w-[380px] h-[380px] rounded-full bg-gold-500/10 blur-[80px]" />
        {/* Subtle Decorative Concentric Rings */}
        <div className="absolute w-[460px] h-[460px] rounded-full border border-gold-500/10" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5" />
      </div>

      {/* Top Brand Micro Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-gold-500/20 backdrop-blur-md text-gold-300 text-xs font-bold tracking-wide shadow-sm">
          <Award className="w-3.5 h-3.5 text-gold-400" />
          <span>الذوق الرفيع والجودة المعتمدة</span>
        </div>
      </motion.div>

      {/* Central Logo & Brand Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full">
        {/* Royal Medallion */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 180 }}
          className="relative"
        >
          {/* Ambient Glow behind Logo */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-brand-600/30 to-gold-500/30 blur-xl opacity-70 animate-pulse" />
          
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-b from-white via-cream-50 to-cream-100 p-4 shadow-2xl border-2 border-gold-400/40 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img
              src="/app_logo.png"
              alt="ذبائح المملكة"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </motion.div>

        {/* Titles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg font-sans">
            {t('app_name', 'ذبائح المملكة')}
          </h1>
          <p className="text-sm md:text-base font-bold bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200 bg-clip-text text-transparent">
            {t('splash_tagline', 'طعم الأصالة والجودة العالية')}
          </p>
        </motion.div>

        {/* Trust Points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-300/80 font-medium"
        >
          <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <CheckCircle2 className="w-3 h-3 text-gold-400" />
            ذبح حلال شرعي 100%
          </span>
          <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <CheckCircle2 className="w-3 h-3 text-gold-400" />
            إشراف بيطري كامل
          </span>
          <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <CheckCircle2 className="w-3 h-3 text-gold-400" />
            توصيل مبرد
          </span>
        </motion.div>
      </div>

      {/* Bottom Luxury Progress Bar */}
      <div className="relative z-10 w-full max-w-xs space-y-3 pb-6">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 via-gold-500 to-gold-300 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
            {t('loading', 'جاري تجهيز السوق...')}
          </span>
          <span className="font-mono text-gold-400/90">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   2. SENIOR-GRADE ONBOARDING SCREEN (Responsive Desktop & Mobile)
   ───────────────────────────────────────────────────────────────────────────── */
export const OnboardingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const isRtl = i18n.language === 'ar';

  const slides = [
    {
      id: 'livestock',
      title: 'ذبائح بلدية طازجة ومختارة بعناية',
      subtitle: 'نوفر لك أجود أنواع الأغنام، النعيمي، النجدي، الحري، والتيوس، والحواشي البلدي مع فحص بيطري دقيق وذبح حلال معتمد.',
      badge: 'طبيعي 100% • رعي حر',
      icon: ShieldCheck,
      image: '/images/onboarding/livestock.jpg',
      perks: [
        'فحص بيطري مخبري دقيق لكل ذبيحة',
        'تربية طبيعية في مزارع معتمدة وموثوقة',
        'تحديد دقيق للأوزان والأعمار الشرعية'
      ],
      tag: 'المرحلة 1: الانتقاء والتربية'
    },
    {
      id: 'butchery',
      title: 'قصابة احترافية وتغليف مفرغ من الهواء',
      subtitle: 'اختر طريقة التقطيع المناسبة لك (مفصل، ثلاجة، أرباع، فرم أو ستيك) مع تغليف سحب هواء يحافظ على الطراوة والنكهة.',
      badge: 'قصابة وتجهيز حسب رغبتك',
      icon: Scissors,
      image: '/images/onboarding/butchery.jpg',
      perks: [
        'تقطيع وتفصيل دقيق بأيدي أمهر القصابين',
        'تغليف حراري مفرغ من الهواء لمنع البكتيريا',
        'تخصيص كامل للشحم، الرأس، والكرش والمصارين'
      ],
      tag: 'المرحلة 2: التجهيز والتفصيل'
    },
    {
      id: 'delivery',
      title: 'شحن مبرد سريع ومباشر لباب منزلك',
      subtitle: 'أسطول سيارات مجهزة بأحدث وحدات التبريد ومراقبة درجات الحرارة لضمان وصول الذبيحة طازجة تماماً في الموعد المختار.',
      badge: 'سلسلة تبريد معتمدة 4°C',
      icon: Truck,
      image: '/images/onboarding/delivery.jpg',
      perks: [
        'سيارات تبريد مجهزة بأعلى معايير هيئة الغذاء والدواء',
        'تغطية شاملة وتوصيل فوري أو مجدول لأحياء الرياض',
        'تسليم آمن ونظيف في بوكسات عازلة للحرارة'
      ],
      tag: 'المرحلة 3: النقل والتسليم'
    },
  ];

  const handleFinish = () => {
    localStorage.setItem('dhabayih_seen_onboarding', 'true');
    navigate('/home');
  };

  const handleToggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('dhabayih_language', nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  const current = slides[currentSlide];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-slate-100 text-charcoal-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -start-32 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

      {/* ── Top Header Bar ── */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200/80 p-1 flex items-center justify-center">
            <img src="/app_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-black text-sm text-charcoal-950 leading-tight">ذبائح المملكة</div>
            <div className="text-[10px] text-amber-700 font-bold">طعم الأصالة والجودة</div>
          </div>
        </div>

        {/* Action Controls: Language Toggle & Skip */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          <button
            onClick={handleFinish}
            className="text-xs font-black text-slate-600 hover:text-brand-900 transition px-3.5 py-1.5 rounded-full bg-slate-200/60 hover:bg-slate-200 cursor-pointer"
          >
            {t('skip', 'تخطي')}
          </button>
        </div>
      </header>

      {/* ── Main Hero Card Showcase (Responsive: Dual-pane on desktop, vertical on mobile) ── */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-4 md:py-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-slate-200/70 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
          
          {/* Left / Visual Pane (55% on desktop) */}
          <div className="md:col-span-6 lg:col-span-7 relative bg-slate-950 overflow-hidden min-h-[260px] md:min-h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Overlaid Badges */}
            <div className="absolute top-4 start-4 z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-bold shadow-lg">
                <Award className="w-3.5 h-3.5 text-gold-400" />
                <span>{current.tag}</span>
              </div>
            </div>

            <div className="absolute bottom-4 start-4 end-4 z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-brand-900/90 backdrop-blur-md text-white border border-brand-500/40 text-xs font-black shadow-lg">
                <Icon className="w-4 h-4 text-gold-400" />
                <span>{current.badge}</span>
              </div>

              {/* Step indicator counter on image */}
              <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-xs font-mono font-bold">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>
          </div>

          {/* Right / Content Pane (45% on desktop) */}
          <div className="md:col-span-6 lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-charcoal-950 leading-tight">
                    {current.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.subtitle}
                  </p>
                </div>

                {/* Value Perks Checklist */}
                <div className="pt-2 space-y-2.5">
                  {current.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-semibold text-charcoal-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Stepper Dots & Navigation Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {/* Stepper Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide
                        ? 'w-9 bg-brand-800'
                        : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {currentSlide < slides.length - 1 ? (
                  <button
                    onClick={() => setCurrentSlide((prev) => prev + 1)}
                    className="w-full bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 hover:from-brand-800 hover:to-brand-600 text-white font-black rounded-2xl py-3.5 shadow-lg shadow-brand-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.99]"
                  >
                    <span>{t('next', 'التالي')}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-emerald-500 text-white font-black rounded-2xl py-3.5 shadow-lg shadow-emerald-700/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.99]"
                  >
                    <span>{t('start_ordering_now', 'ابدأ الطلب الآن')}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={handleFinish}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-charcoal-700 font-bold rounded-2xl py-2.5 transition cursor-pointer text-xs border border-slate-200/80 active:scale-[0.99]"
                >
                  {t('continue_as_guest', 'المتابعة كزائر بدون تسجيل')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Subtle Trust Guarantee Footer (No Emojis) ── */}
      <footer className="relative z-20 text-center pb-5 px-4">
        <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ذبائح بلدية موثوقة ومطابقة للاشتراطات الصحية</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:inline">شهادة سلامة الغذاء والدواء</span>
        </p>
      </footer>
    </div>
  );
};