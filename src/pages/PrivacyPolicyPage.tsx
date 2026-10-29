import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Lock,
  Printer,
  ChevronLeft,
  ChevronDown,
  Building2,
  Mail,
  MapPin,
  Trash2,
  Phone,
  FileText,
  AlertCircle,
  ExternalLink,
  Globe,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<'ar' | 'en'>(i18n.language === 'en' ? 'en' : 'ar');
  const isAr = lang === 'ar';

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handlePrint = () => {
    window.print();
  };

  const toggleLanguage = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    i18n.changeLanguage(next);
  };

  const sections = [
    { id: 'overview', num: '01', titleAr: 'مقدمة ومعلومات الجهة المطورة', titleEn: '1. App & Developer Overview' },
    { id: 'data-collected', num: '02', titleAr: 'البيانات والأذونات التي يجمعها التطبيق', titleEn: '2. Data & Permissions Collected' },
    { id: 'location-policy', num: '03', titleAr: 'سياسة استخدام الموقع الجغرافي (GPS)', titleEn: '3. Location Data Policy (GPS)' },
    { id: 'data-security', num: '04', titleAr: 'أمان وتشفير البيانات والمدفوعات', titleEn: '4. Data Security & Encryption' },
    { id: 'third-parties', num: '05', titleAr: 'مشاركة البيانات والجهات الخارجية', titleEn: '5. Third-Party Data Sharing' },
    { id: 'data-deletion', num: '06', titleAr: 'حذف الحساب والبيانات نهائياً (Google Play)', titleEn: '6. Account & Data Deletion (Google Play)' },
    { id: 'terms-returns', num: '07', titleAr: 'الاشتراطات وسياسة الاسترجاع (الغذاء والدواء)', titleEn: '7. Terms & Food Safety Returns Policy' },
    { id: 'contact', num: '08', titleAr: 'بيانات التواصل ومسؤول الخصوصية', titleEn: '8. Contact Information & DPO' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      qAr: 'كيف يمكنني حذف حسابي وجميع بياناتي من التطبيق نهائياً؟',
      qEn: 'How can I permanently delete my account and personal data?',
      aAr: 'يمكنك حذف حسابك فوراً من داخل التطبيق بالانتقال إلى (الملف الشخصي > إعدادات الحساب > طلب حذف الحساب)، أو عبر إرسال بريد إلكتروني إلى privacy@dhabayih.com متضمناً رقم الجوال المسجل، وسيتم حذف جميع سجلاتك وبياناتك نهائياً من خوادمنا خلال 48 ساعة كحد أقصى.',
      aEn: 'You can delete your account directly inside the app under (Profile > Account Settings > Delete Account), or by emailing privacy@dhabayih.com with your registered phone number. All records will be permanently purged within 48 hours.',
    },
    {
      qAr: 'هل يتتبع التطبيق موقعي الجغرافي في الخلفية (Background Location)؟',
      qEn: 'Does the application track my location in the background?',
      aAr: 'لا، إطلاقاً. لا يطلب التطبيق ولا يستخدم إذن الموقع في الخلفية. يتم استخدام بيانات الموقع فقط أثناء فتح التطبيق لتحديد عنوان توصيل الذبائح وتوجيه سيارة التبريد إلى موقع التسليم بدقة.',
      aEn: 'No, strictly not. The app never requests background location. GPS coordinates are only accessed while the app is active in the foreground solely to pin your meat delivery address.',
    },
    {
      qAr: 'هل تقوم المنصة ببيع أو مشاركة بيانات المستخدمين مع أطراف تسويقية؟',
      qEn: 'Does the platform sell or share user data with advertising networks?',
      aAr: 'نحن نتعهد بعدم بيع أو تأجير أو مشاركة أي بيانات شخصية مع أي جهة إعلانية أو تجارية خارجية. البيانات تُستخدم فقط للأغراض التشغيلية المرتبطة بتوصيل وتجهيز طلبك.',
      aEn: 'We strictly guarantee never selling, renting, or disclosing your personal records to any external advertising networks or commercial brokers.',
    },
  ];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-brand-500 selection:text-white"
    >
      {/* Clean Minimalist Regulatory Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-black text-sm">
              ذ
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-zinc-950 tracking-tight leading-tight">
                {isAr ? 'تطبيق ذبائح المملكة' : 'Dhabayih Al-Mamlaka App'}
              </div>
              <div className="text-[11px] font-bold text-zinc-500">
                {isAr ? 'سياسة الخصوصية الرسمية (Google Play)' : 'Official Privacy Policy (Google Play)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-950 text-zinc-800 text-xs font-bold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-950 text-zinc-800 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'طباعة / حفظ PDF' : 'Print / PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title & Regulatory Metadata Banner */}
        <div className="pb-8 border-b border-zinc-200 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-xs font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
            <span>
              {isAr
                ? 'وثيقة سياسة الخصوصية المعتمدة لمتجر Google Play Store'
                : 'Google Play Store Verified Privacy Policy Document'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            {isAr ? 'سياسة الخصوصية وحماية بيانات المستخدم' : 'Privacy Policy & User Data Protection'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed max-w-4xl">
            {isAr
              ? 'تلتزم مؤسسة ذبائح المملكة بحماية خصوصية جميع مستخدمي تطبيق الهاتف المحمول وموقع الويب. توضح هذه الوثيقة بالتفصيل أنواع البيانات الشخصية التي يجمعها التطبيق، الأذونات المطلوبة، كيفية استخدامها وتأمينها، وكيفية طلب حذف الحساب والبيانات نهائياً بما يتوافق مع سياسات مطوري Google Play والأنظمة المعمول بها في المملكة العربية السعودية.'
              : 'Dhabayih Al-Mamlaka is committed to safeguarding user privacy across our mobile app and website. This document details the types of data collected, permissions required, security measures, and procedures for permanent account and data deletion in strict accordance with Google Play Developer Policies and Saudi data regulations.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 pt-2">
            <div><span className="font-bold text-zinc-900">{isAr ? 'المطور:' : 'Developer:'}</span> مؤسسة ذبائح المملكة</div>
            <div>•</div>
            <div><span className="font-bold text-zinc-900">{isAr ? 'اسم الحزمة:' : 'Package ID:'}</span> com.example.dhabayih_lmamlaka</div>
            <div>•</div>
            <div><span className="font-bold text-zinc-900">{isAr ? 'تاريخ السريان:' : 'Effective Date:'}</span> أكتوبر 2026</div>
          </div>
        </div>

        {/* 2-Column Clean Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
          
          {/* Index Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* Quick Navigation List */}
            <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50 space-y-2">
              <div className="text-xs font-black text-zinc-950 uppercase tracking-wider pb-2 border-b border-zinc-200 flex items-center justify-between">
                <span>{isAr ? 'فهرس بنود الخصوصية' : 'Policy Sections'}</span>
                <span className="text-brand-600 font-mono text-[11px]">8 {isAr ? 'أقسام' : 'Sections'}</span>
              </div>

              <nav className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-start font-bold text-xs text-zinc-600 hover:text-zinc-950 hover:bg-white transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-zinc-400 group-hover:text-brand-600 font-black">
                        {s.num}
                      </span>
                      <span>{isAr ? s.titleAr : s.titleEn}</span>
                    </div>
                    <ChevronLeft className={`w-3.5 h-3.5 text-zinc-300 group-hover:text-brand-600 transition ${isAr ? '' : 'rotate-180'}`} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Google Play Direct Deletion Notice Box */}
            <div className="border border-brand-200 rounded-2xl p-4 bg-brand-50/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-brand-700">
                <Trash2 className="w-4 h-4 text-brand-600" />
                <span>{isAr ? 'طلب حذف الحساب الفوري' : 'Data Deletion Request'}</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-normal">
                {isAr
                  ? 'لحذف حسابك وسجلاتك نهائياً من قاعدة البيانات، يرجى مراسلتنا مباشرة على:'
                  : 'To permanently delete your account and personal records, contact us at:'}
              </p>
              <a
                href="mailto:privacy@dhabayih.com?subject=Account%20Deletion%20Request"
                className="inline-block text-xs font-mono font-bold text-brand-700 underline"
              >
                privacy@dhabayih.com
              </a>
            </div>

            {/* Official Entity Specs */}
            <div className="border border-zinc-200 rounded-2xl p-4 bg-white text-xs font-mono text-zinc-500 space-y-1.5">
              <div className="text-zinc-950 font-bold mb-1">{isAr ? 'البيانات الرسمية للمؤسسة:' : 'Official Entity Details:'}</div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span>{isAr ? 'السجل التجاري:' : 'CR Number:'}</span>
                <span className="font-bold text-zinc-900">1010000000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span>{isAr ? 'الرقم الضريبي:' : 'VAT ID:'}</span>
                <span className="font-bold text-zinc-900">300000000000003</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{isAr ? 'المدينة / الدولة:' : 'Location:'}</span>
                <span className="font-bold text-zinc-900">{isAr ? 'الرياض، السعودية' : 'Riyadh, KSA'}</span>
              </div>
            </div>

          </aside>

          {/* Policy Articles Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Section 1: Overview */}
            <section id="overview" className="space-y-3 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 01</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '1. معلومات التطبيق والجهة المشغلة' : '1. Application & Developer Overview'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                {isAr
                  ? 'تطبيق "ذبائح المملكة" هو منصة تجارة إلكترونية متخصصة في توفير وحجز وتجهيز وتوصيل الذبائح واللحوم البلدية الطازجة داخل المملكة العربية السعودية. يتم تشغيل المنصة وتطويرها بواسطة مؤسسة ذبائح المملكة، ومقرها الرئيسي في مدينة الرياض.'
                  : 'Dhabayih Al-Mamlaka is an e-commerce mobile platform specialized in ordering, butchering, and refrigerated delivery of fresh local livestock in Saudi Arabia, operated by Dhabayih Al-Mamlaka Establishment headquartered in Riyadh.'}
              </p>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 2: Data & Permissions */}
            <section id="data-collected" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 02</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '2. البيانات الشخصية والأذونات التي يجمعها التطبيق' : '2. Data & Permissions Collected'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                {isAr
                  ? 'يجمع التطبيق الحد الأدنى فقط من البيانات الضرورية لتمكين المستخدم من طلب وتوصيل الذبيحة، وتشمل:'
                  : 'The application collects only strictly necessary data to enable livestock ordering and cold-chain delivery:'}
              </p>

              <div className="border border-zinc-200 rounded-2xl divide-y divide-zinc-200">
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-black text-zinc-950">{isAr ? 'أ. معلومات الحساب والتواصل:' : 'A. Account & Contact Information:'}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {isAr
                      ? 'الاسم الكامل، رقم الجوال، وعنوان البريد الإلكتروني. تُستخدم لإرسال كود التحقق الأمني (OTP)، تأكيد حالة الطلب، والتواصل بخصوص تسليم الذبيحة.'
                      : 'Full name, mobile phone number, and email address. Used for security authentication (OTP), order status updates, and delivery coordination.'}
                  </p>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-black text-zinc-950">{isAr ? 'ب. بيانات الجهاز والإشعارات (Push Notifications):' : 'B. Device Info & FCM Push Tokens:'}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {isAr
                      ? 'معرف الجهاز ورمز الإشعار (Firebase Cloud Messaging Token) لإرسال تنبيهات فورية للمستخدم عن حالة الذبح، التقطيع، وخروج سيارة التوصيل.'
                      : 'Device identifiers and FCM tokens to deliver real-time notifications on butchering and dispatch status.'}
                  </p>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-black text-zinc-950">{isAr ? 'ج. إذن الكاميرا ومكتبة الصور (Camera / Photos - اختياري):' : 'C. Camera & Storage Permission (Optional):'}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {isAr
                      ? 'لا يتم الوصول إلى الكاميرا أو الصور إلا في حال اختار المستخدم بنفسه رفع صورة شخصية للحساب أو إرفاق صورة توضيحية لخدمة العملاء. لا يقوم التطبيق بفحص أو قراءة مكتبة الصور في الخلفية إطلاقاً.'
                      : 'Camera and gallery access is exclusively requested if the user chooses to upload a profile avatar or share product photos with customer support.'}
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 3: Location Disclosure (Google Play Essential) */}
            <section id="location-policy" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 03</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '3. سياسة استخدام بيانات الموقع الجغرافي (GPS Disclosure)' : '3. Location Data Policy (GPS Disclosure)'}
              </h2>

              <div className="p-4 border-l-4 border-l-brand-600 bg-zinc-50 rounded-r-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-zinc-950">
                  <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>{isAr ? 'إفصاح صريح عن استخدام الموقع الجغرافي (Foreground Location):' : 'Prominent Foreground Location Disclosure:'}</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                  {isAr
                    ? 'يطلب تطبيق ذبائح المملكة إذن الوصول إلى الموقع الجغرافي الدقيق والتقريبي (ACCESS_FINE_LOCATION و ACCESS_COARSE_LOCATION) فقط وحصرياً أثناء استخدام التطبيق في الواجهة الأمامية، وذلك لتمكين المستخدم من تحديد عنوان توصيل الذبيحة وتوجيه سيارات التبريد إلى موقع الاستلام بدقة.'
                    : 'Dhabayih Al-Mamlaka accesses foreground location data (ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION) strictly to allow users to select their carcass delivery address and guide refrigerated delivery vehicles.'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-zinc-700 font-bold pr-2">
                  <li>{isAr ? 'التطبيق لا يطلب ولا يستخدم الموقع في الخلفية (No Background Location).' : 'The app NEVER accesses location in the background.'}</li>
                  <li>{isAr ? 'لا تتم مشاركة أو بيع إحداثيات الموقع لأي شبكات إعلانية أو جهات خارجية.' : 'Location coordinates are never shared or sold to advertising networks.'}</li>
                </ul>
              </div>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 4: Data Security */}
            <section id="data-security" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 04</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '4. أمان وتشفير البيانات والمدفوعات البنكية' : '4. Data Security & Financial Encryption'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                {isAr
                  ? 'نطبق تدابير أمنية تقنية وتنظيمية متقدمة لحماية بيانات المستخدمين:'
                  : 'We employ rigorous technical and organizational security controls to protect user data:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 border border-zinc-200 rounded-xl space-y-1">
                  <h5 className="font-black text-xs text-zinc-950">{isAr ? 'تشفير أثناء النقل (TLS / HTTPS)' : 'Encryption in Transit'}</h5>
                  <p className="text-[11px] text-zinc-600 leading-normal">
                    {isAr ? 'جميع الاتصالات بين التطبيق والخوادم السحابية مشفرة باستخدام بروتوكول HTTPS المشفر.' : 'All data transfer is encrypted using standard HTTPS/TLS protocols.'}
                  </p>
                </div>

                <div className="p-4 border border-zinc-200 rounded-xl space-y-1">
                  <h5 className="font-black text-xs text-zinc-950">{isAr ? 'معيار أمان المدفوعات (PCI-DSS)' : 'PCI-DSS Compliance'}</h5>
                  <p className="text-[11px] text-zinc-600 leading-normal">
                    {isAr ? 'تتم المعاملات المالية عبر بوابات مرخصة من البنك المركزي (ساما) ولا يتم حفظ أرقام البطاقات إطلاقاً.' : 'Payments are processed via SAMA-licensed gateways with zero card storage.'}
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 5: Third Parties */}
            <section id="third-parties" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 05</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '5. الجهات الخارجية ومقدمو الخدمات (Third-Party Services)' : '5. Third-Party Service Providers'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                {isAr
                  ? 'يستخدم التطبيق خدمات موثوقة ومطابقة لسياسات Google Play لتشغيل المزايا الأساسية:'
                  : 'The application integrates verified services complying with Google Play policies:'}
              </p>

              <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-700 font-medium pr-2">
                <li><strong className="text-zinc-950">Google Play Services & Google Maps:</strong> {isAr ? 'لعرض الخريطة وتحديد موقع التوصيل بدقة.' : 'For map display and delivery address pinning.'}</li>
                <li><strong className="text-zinc-950">Firebase Cloud Messaging (Google):</strong> {isAr ? 'لإرسال إشعارات حالة تجهيز وتوصيل الذبيحة.' : 'For push notifications on butchering and dispatch status.'}</li>
                <li><strong className="text-zinc-950">SAMA-Licensed Payment Gateways (Moyasar / Mada):</strong> {isAr ? 'لمعالجة الدفع الإلكتروني المشفر.' : 'For processing encrypted online transactions.'}</li>
                <li><strong className="text-zinc-950">كباتن التوصيل وسيارات التبريد:</strong> {isAr ? 'يتم تزويد السائق فقط برقم الجوال والعنوان المكتوب لتسليم الطلب.' : 'Couriers receive only the destination address and phone to deliver.'}</li>
              </ul>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 6: Account Deletion (Google Play Mandatory) */}
            <section id="data-deletion" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 06</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '6. آلية وسياسة حذف الحساب والبيانات نهائياً (Google Play Deletion Policy)' : '6. Account & Data Deletion Policy (Google Play Compliant)'}
              </h2>

              <div className="p-4 border border-zinc-200 rounded-2xl bg-zinc-50 space-y-3">
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                  {isAr
                    ? 'وفقاً لسياسة Google Play الخاصة بحذف بيانات وحسابات المستخدمين، تمنح منصة ذبائح المملكة المستخدمين حقاً كاملاً في حذف حساباتهم وجميع بياناتهم الشخصية نهائياً من خوادمنا عبر أحد الخيارين التاليين:'
                    : 'In compliance with Google Play Account Deletion requirements, users have the complete right to request permanent deletion of their account and associated data via either option:'}
                </p>

                <div className="space-y-2 text-xs text-zinc-800">
                  <div className="p-3 bg-white rounded-xl border border-zinc-200">
                    <strong className="block text-zinc-950 mb-0.5">{isAr ? 'الخيار 1: الحذف المباشر من داخل التطبيق' : 'Option 1: Direct in-app deletion'}</strong>
                    <span>{isAr ? 'انتقل إلى (الملف الشخصي > إعدادات الحساب > اضغط على "طلب حذف الحساب" وتأكيد الطلب).' : 'Navigate to (Profile > Account Settings > tap "Delete Account" and confirm).'}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-zinc-200">
                    <strong className="block text-zinc-950 mb-0.5">{isAr ? 'الخيار 2: عبر البريد الإلكتروني الرسمي لحماية البيانات' : 'Option 2: Official Privacy Email Request'}</strong>
                    <span>
                      {isAr
                        ? 'أرسل طلباً عبر البريد الإلكتروني إلى: '
                        : 'Send an email to: '}
                      <a href="mailto:privacy@dhabayih.com" className="font-bold text-brand-600 underline">privacy@dhabayih.com</a>
                      {isAr
                        ? ' مع ذكر رقم الجوال المسجل في الحساب. يتم تأكيد الحذف وتطهير كافة السجلات نهائياً خلال 48 ساعة.'
                        : ' stating your registered phone number. Account records will be purged within 48 hours.'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 font-medium">
                  {isAr
                    ? '* ملاحظة: قد يتم الاحتفاظ فقط ببيانات الفواتير الضريبية السابقة بالحد الأدنى الذي يفرضه نظام هيئة الزكاة والضريبة والجمارك (ZATCA) في المملكة العربية السعودية لأغراض التدقيق المحاسبي النظامي.'
                    : '* Note: Past tax invoices may be archived in minimal read-only format as mandated by Saudi tax regulations (ZATCA) for audit compliance.'}
                </div>
              </div>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 7: Terms & Food Safety */}
            <section id="terms-returns" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 07</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '7. شروط الطلب وسياسة الاسترجاع (هيئة الغذاء والدواء)' : '7. Ordering Terms & Perishable Food Returns Policy'}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                {isAr
                  ? 'بموجب المادة 13 من اللائحة التنفيذية لنظام التجارة الإلكترونية السعودي واشتراطات هيئة الغذاء والدواء للسلع سريعة التلف والتجهيز المخصص، فإن اللحوم المجهزة خصيصاً لا تقبل الإرجاع بعد الاستلام إلا في الحالات الاستثنائية التالية:'
                  : 'Pursuant to Article 13 of Saudi E-Commerce Executive Regulations and SFDA guidelines, custom butchered perishable meat is non-returnable once received, except in the following defect cases:'}
              </p>

              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 space-y-1 text-xs text-zinc-700 font-medium">
                <div>• {isAr ? 'ثبوت عيب صحي بيطري عند التسليم وموثق من القائم بالفحص.' : 'A certified veterinary health defect proven upon delivery.'}</div>
                <div>• {isAr ? 'عدم مطابقة الصنف أو نوع الذبيحة المستلمة للفاتورة الضريبية.' : 'Substantial discrepancy between delivered carcass breed and invoice.'}</div>
                <div>• {isAr ? 'يجب إبلاغ خدمة العملاء خلال ساعتين كحد أقصى من الاستلام وبقاء الذبيحة مبردة.' : 'Claims must be filed within 2 hours of delivery while keeping meat refrigerated.'}</div>
              </div>
            </section>

            <div className="h-px bg-zinc-200" />

            {/* Section 8: Contact */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2 text-brand-600 font-mono text-xs font-black">
                <span>SECTION 08</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 m-0">
                {isAr ? '8. بيانات التواصل ومسؤول حماية البيانات (DPO Contact)' : '8. Contact Information & Data Protection Officer'}
              </h2>

              <div className="border border-zinc-200 rounded-2xl p-5 bg-white space-y-3 text-xs text-zinc-700">
                <p className="font-medium">
                  {isAr
                    ? 'لأي استفسارات قانونية، طلبات حذف البيانات، أو شكاوى تتعلق بالخصوصية، يمكنكم التواصل المباشر مع مكتب حماية البيانات لدينا:'
                    : 'For legal inquiries, data deletion requests, or privacy complaints, please reach our Data Protection team:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono pt-1">
                  <div className="p-3 border border-zinc-200 rounded-xl">
                    <span className="text-zinc-400 block text-[11px]">{isAr ? 'البريد الإلكتروني للخصوصية:' : 'Privacy Email:'}</span>
                    <a href="mailto:privacy@dhabayih.com" className="font-bold text-zinc-950 hover:text-brand-600 transition">
                      privacy@dhabayih.com
                    </a>
                  </div>

                  <div className="p-3 border border-zinc-200 rounded-xl">
                    <span className="text-zinc-400 block text-[11px]">{isAr ? 'خدمة العملاء والدعم:' : 'Support Phone:'}</span>
                    <a href="tel:920000000" className="font-bold text-zinc-950 hover:text-brand-600 transition">
                      920000000 / 0500000000
                    </a>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 pt-1">
                  {isAr ? 'العنوان: طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية.' : 'Address: King Fahd Road, Al-Sahafa District, Riyadh, Kingdom of Saudi Arabia.'}
                </div>
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="space-y-3 pt-4">
              <h3 className="text-sm font-black text-zinc-950">
                {isAr ? 'الأسئلة الشائعة حول الخصوصية وحماية البيانات:' : 'Frequently Asked Privacy Questions:'}
              </h3>

              <div className="border border-zinc-200 rounded-2xl divide-y divide-zinc-200 overflow-hidden">
                {faqs.map((f, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div key={idx} className="bg-white">
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-start font-black text-xs sm:text-sm text-zinc-950 hover:bg-zinc-50 transition cursor-pointer gap-2"
                      >
                        <span>{isAr ? f.qAr : f.qEn}</span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-zinc-600 font-medium leading-relaxed bg-zinc-50/50">
                          {isAr ? f.aAr : f.aEn}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </div>

      </main>

      {/* Clean Minimalist Legal Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <div>© {new Date().getFullYear()} {isAr ? 'تطبيق ذبائح المملكة. جميع الحقوق محفوظة.' : 'Dhabayih Al-Mamlaka App. All Rights Reserved.'}</div>
          <div className="text-[11px] text-zinc-400">
            {isAr
              ? 'وثيقة سياسة خصوصية قانونية مخصصة ومطابقة لمتطلبات متجر Google Play ولائحة حماية البيانات الشخصية السعودية.'
              : 'Official Privacy Policy compliant with Google Play Store Developer Guidelines and Saudi PDPL.'}
          </div>
        </div>
      </footer>

    </div>
  );
};
