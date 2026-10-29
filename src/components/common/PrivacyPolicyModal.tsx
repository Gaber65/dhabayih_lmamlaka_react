import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  ShieldCheck,
  Lock,
  Truck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck2,
  ChevronDown,
  PhoneCall,
  Printer,
  FileText,
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'faq';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'faq'>(initialTab);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      qAr: 'ما هي الشروط التي يحق لي فيها استرجاع أو استبدال الذبيحة؟',
      qEn: 'Under what conditions can I return or exchange a carcass?',
      aAr: 'وفقاً لاشتراطات هيئة الغذاء والدواء، نظراً لكون اللحوم مادة غذائية طازجة وسريعة التلف يتم تجهيزها حسب الطلب، لا يقبل الاسترجاع بعد الاستلام إلا في حال وجود عيب صحي مثبت عند التسليم أو عدم مطابقة جوهرية للطلب (كالصنف أو الوزن خارج النطاق المتفق عليه بشكل كبير)، مع ضرورة إبلاغ خدمة العملاء خلال ساعتين كحد أقصى من الاستلام مع بقاء اللحم في التبريد.',
      aEn: 'In accordance with Food & Drug regulations, perishable meats tailored to customer orders are non-returnable once received, except in cases of proven health defects upon arrival or substantial non-compliance with the order. Claims must be submitted within 2 hours of delivery while keeping meat refrigerated.',
    },
    {
      qAr: 'كيف تضمن منصة ذبائح المملكة مطابقة الذبح للشريعة الإسلامية؟',
      qEn: 'How does Dhabayih Al-Mamlaka ensure 100% Halal slaughtering?',
      aAr: 'تتم جميع عمليات الذبح حصرياً في مسالخ أمانة منطقة الرياض والمسالخ البلدية الرسمية المعتمدة، بأيدي قصابين مسلمين مؤهلين، وتحت إشراف مباشر وكامل من أطباء بيطريين معتمدين قبل الذبح وبعد السلخ والتجويف لضمان السلامة التامة.',
      aEn: 'All slaughtering operations occur exclusively in officially licensed municipal slaughterhouses by certified Muslim butchers under comprehensive veterinary inspection before and after slaughtering.',
    },
    {
      qAr: 'هل يتم تخزين بيانات بطاقاتي الائتمانية في خوادم التطبيق؟',
      qEn: 'Do you store my credit card or bank details on your servers?',
      aAr: 'لا، إطلاقاً. تتم معالجة جميع المدفوعات (مدى، Apple Pay، فيزا، ماستركارد) عبر قنوات مشفرة مشغلة بواسطة بوابات دفع مرخصة رسمياً من البنك المركزي السعودي (ساما) ومتوافقة مع أعلى معايير أمان الدفع العالمية (PCI-DSS Level 1). نحن لا نحتفظ بأي أرقام سرية أو بطاقات بنكية.',
      aEn: 'Absolutely not. All transactions are securely routed through SAMA-licensed payment gateways adhering to global PCI-DSS Level 1 standards. We never retain confidential payment credentials.',
    },
    {
      qAr: 'ما هو فارق الوزن المقبول في الذبائح الحية؟',
      qEn: 'What is the acceptable weight variance for live carcasses?',
      aAr: 'الأوزان المعلنة في المتجر تمثل متوسط الوزن التقديري الصافي بعد الذبح والتجويف والسلخ. نظراً للطبيعة الحيوية للمواشي، قد يطرأ فارق طبيعي بسيط يتراوح بين ±5% إلى ±8%، ونلتزم دوماً بانتقاء الذبيحة الأعلى جودة والأقرب للوزن المختار.',
      aEn: 'Advertised weights reflect average dressed weight post-slaughtering and cleaning. Natural biological variances typically range between ±5% to ±8%, and we always prioritize the highest-grade livestock matching your preference.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-cream-100 rounded-3xl shadow-luxury-lg overflow-hidden border border-charcoal-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-brand-950 via-brand-900 to-amber-950 text-white p-5 sm:p-6 border-b border-gold-500/20 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-gold-300 text-[10px] font-black border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'وثيقة رسمية معتمدة' : 'Official Certified Policy'}</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white">
                {isAr ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms & Privacy Policy'}
              </h3>
              <p className="text-xs text-cream-200 font-medium hidden sm:block">
                {isAr
                  ? 'منصة ذبائح المملكة - معايير الذبح، الأوزان، سلامة الأغذية، وتشفير المدفوعات'
                  : 'Kingdom Sacrifices - Slaughtering standards, weights, food safety & payment security'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'شروط الطلب والذبح' : 'Order & Slaughtering Terms'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-gold-500 text-charcoal-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-charcoal-800 text-xs sm:text-sm font-medium">
          
          {/* TAB 1: TERMS & SLAUGHTERING */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              
              {/* Slaughtering Standards */}
              <div className="p-4 bg-white rounded-2xl border border-charcoal-200 shadow-luxury-sm space-y-2.5">
                <div className="flex items-center gap-2 font-black text-sm text-charcoal-900">
                  <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">1</div>
                  <h4>{isAr ? 'الاشتراطات البيطرية والذبح الشرعي الحلال' : 'Veterinary & Halal Standards'}</h4>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {isAr
                    ? 'تتم جميع عمليات الذبح والتجهيز حصرياً داخل مسالخ الأمانة البلدية المعتمدة رسمياً، وتحت إشراف بيطري كامل قبل الذبح وبعد السلخ والتجويف للتأكد من خلو الذبائح من أي عيوب أو أمراض، وفقاً للشريعة الإسلامية 100%.'
                    : 'All slaughtering is carried out exclusively in officially certified municipal abattoirs under complete veterinary supervision before and after dressing, ensuring 100% Halal compliance.'}
                </p>
              </div>

              {/* Weights Table */}
              <div className="p-4 bg-white rounded-2xl border border-charcoal-200 shadow-luxury-sm space-y-3">
                <div className="flex items-center gap-2 font-black text-sm text-charcoal-900">
                  <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">2</div>
                  <h4>{isAr ? 'جدول الأوزان التقريبية الصافية ونسب التفاوت المعتمدة' : 'Dressed Weight Specs & Variances'}</h4>
                </div>

                <div className="overflow-x-auto rounded-xl border border-charcoal-200">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-charcoal-50 text-charcoal-900 font-black border-b border-charcoal-200">
                      <tr>
                        <th className="p-2.5">{isAr ? 'الصنف' : 'Breed'}</th>
                        <th className="p-2.5">{isAr ? 'الحجم' : 'Size'}</th>
                        <th className="p-2.5">{isAr ? 'الوزن التقريبي (صافي)' : 'Dressed Weight'}</th>
                        <th className="p-2.5">{isAr ? 'التفاوت' : 'Variance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100 font-bold text-charcoal-700">
                      <tr>
                        <td className="p-2.5 font-black text-charcoal-900">{isAr ? 'خروف نعيمي بلدي' : 'Local Nuaimi'}</td>
                        <td className="p-2.5">{isAr ? 'كامل كبير' : 'Whole Large'}</td>
                        <td className="p-2.5 text-brand-700 font-mono">14 - 17 كجم</td>
                        <td className="p-2.5 text-charcoal-500 font-mono">± 5%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-black text-charcoal-900">{isAr ? 'خروف حري طازج' : 'Fresh Harri'}</td>
                        <td className="p-2.5">{isAr ? 'كامل وسط' : 'Whole Medium'}</td>
                        <td className="p-2.5 text-brand-700 font-mono">12 - 15 كجم</td>
                        <td className="p-2.5 text-charcoal-500 font-mono">± 6%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-black text-charcoal-900">{isAr ? 'تيس عارضي بلدي' : 'Ardi Goat'}</td>
                        <td className="p-2.5">{isAr ? 'كامل صغير/وسط' : 'Whole Small'}</td>
                        <td className="p-2.5 text-brand-700 font-mono">9 - 12 كجم</td>
                        <td className="p-2.5 text-charcoal-500 font-mono">± 6%</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-black text-charcoal-900">{isAr ? 'نصف ذبيحة' : 'Half Carcass'}</td>
                        <td className="p-2.5">{isAr ? 'نصف مقسوم' : 'Split Half'}</td>
                        <td className="p-2.5 text-brand-700 font-mono">50% من الصافي</td>
                        <td className="p-2.5 text-charcoal-500 font-mono">± 5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SFDA Food Safety Returns Policy */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 space-y-2">
                <div className="flex items-center gap-2 font-black text-xs text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <h4>{isAr ? 'سياسة الاسترجاع والإلغاء (هيئة الغذاء والدواء)' : 'SFDA Returns Policy'}</h4>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {isAr
                    ? 'نظراً لكون اللحوم مادة غذائية طازجة سريعة التلف يتم تجهيزها وتقطيعها خصيصاً لكل عميل، لا يقبل إلغاء الطلب بعد دخوله مرحلة الذبح، ولا يقبل الاسترجاع بعد الاستلام إلا في حال وجود عيب صحي بيطري مثبت أو عدم مطابقة الصنف، مع اشتراط إبلاغ خدمة العملاء خلال ساعتين كحد أقصى من الاستلام وبقاء الذبيحة مبردة.'
                    : 'Fresh custom-cut meats cannot be returned or cancelled once slaughtered, except for certified veterinary defects reported within 2 hours of handover.'}
                </p>
              </div>

              {/* Cold Chain 4°C */}
              <div className="p-4 bg-white rounded-2xl border border-charcoal-200 shadow-luxury-sm space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-charcoal-900">
                  <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">3</div>
                  <h4>{isAr ? 'التوصيل المبرد بدرجة حرارة 4 درجات مئوية' : 'Refrigerated Cold Chain 4°C'}</h4>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {isAr
                    ? 'يتم النقل في سيارات مجهزة بنظام تبريد حراري معتمد. يلتزم العميل بالتواجد في العنوان المسجل أو توكيل من ينوب عنه لاستلام الذبيحة فور وصول المندوب للحفاظ على سلامة اللحوم.'
                    : 'Deliveries are completed in certified thermal vans maintained at 4°C. Customers must receive meat on time to preserve food safety.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-charcoal-200 shadow-luxury-sm space-y-3">
                <div className="flex items-center gap-2 font-black text-sm text-charcoal-900">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <h4>{isAr ? 'البيانات الشخصية وسبل استخدامها' : 'Personal Data Collection'}</h4>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-charcoal-600">
                  <li>{isAr ? 'الاسم ورقم الجوال لتأكيد الحساب وإرسال كود التحقق (OTP) وتحديثات الذبح.' : 'Name & mobile number for OTP and order updates.'}</li>
                  <li>{isAr ? 'الموقع الجغرافي والعنوان لتوجيه سيارة التبريد إلى بابك.' : 'Geolocation & address for delivery navigation.'}</li>
                  <li>{isAr ? 'تفضيلات التقطيع والتغليف والملاحظات المخصصة للقصاب.' : 'Butchery preferences & packaging options.'}</li>
                  <li>{isAr ? 'سجل العمليات والفواتير الإلكترونية المعتمدة من هيئة الزكاة (ZATCA).' : 'Order history & official tax invoices.'}</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-black text-xs text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <h4>{isAr ? 'تشفير المدفوعات البنكية (PCI-DSS)' : 'Payment Security Standards'}</h4>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {isAr
                    ? 'تتم جميع المعاملات البنكية (مدى، Apple Pay، فيزا، ماستركارد) عبر قنوات مشفرة مرخصة رسمياً من البنك المركزي السعودي (ساما). نحن لا نخزن أي أرقام بطاقات أو رموز سرية على خوادمنا نهائياً.'
                    : 'All card payments are handled via SAMA-licensed encrypted gateways adhering to PCI-DSS Level 1. We never store credit card numbers.'}
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-charcoal-200 shadow-luxury-sm space-y-2">
                <div className="flex items-center gap-2 font-black text-xs text-charcoal-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <h4>{isAr ? 'حظر بيع البيانات وحقوق الحذف' : 'Non-Disclosure & Deletion Rights'}</h4>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {isAr
                    ? 'نتعهد بعدم بيع أو تأجير بياناتك لأي أطراف ثالثة. يحق لك في أي وقت تعديل بياناتك أو طلب حذف حسابك نهائياً بالتواصل مع خدمة العملاء.'
                    : 'We never sell your data. You may request account deletion at any time via customer support.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-charcoal-200 overflow-hidden bg-white shadow-luxury-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 text-start font-black text-xs sm:text-sm text-charcoal-900 hover:bg-cream-50 transition cursor-pointer gap-2"
                    >
                      <span>{isAr ? faq.qAr : faq.qEn}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-charcoal-400 transition-transform ${
                          isOpen ? 'rotate-180 text-brand-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-0 text-xs text-charcoal-600 leading-relaxed border-t border-charcoal-100 bg-cream-50/50">
                        {isAr ? faq.aAr : faq.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Official Registration Box */}
          <div className="p-3 bg-charcoal-50 rounded-2xl border border-charcoal-200 text-[11px] text-charcoal-500 font-mono text-center">
            {isAr
              ? 'منصة ذبائح المملكة • س.ت: 1010000000 • الرقم الضريبي: 300000000000003 • الرياض، المملكة العربية السعودية'
              : 'Kingdom Sacrifices • CR: 1010000000 • VAT: 300000000000003 • Riyadh, KSA'}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-charcoal-200 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs transition cursor-pointer shadow-luxury-sm"
          >
            {isAr ? 'موافق وإغلاق' : 'Accept & Close'}
          </button>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-black transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'واتساب الدعم' : 'WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

