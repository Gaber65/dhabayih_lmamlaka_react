import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Coins,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Receipt,
  Printer,
  QrCode,
  Building2,
  FileText,
  Mail,
  MapPin,
  Percent,
  Check,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, LoyaltySettings, ContactSettings, InvoiceSettings, AppVersionSettings } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';

type SettingsTab = 'invoice' | 'contact' | 'loyalty' | 'app_updates';

export const AdminSettingsView: React.FC = () => {
  const { language, isRTL } = useLanguageStore();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<SettingsTab>('invoice');
  const [loading, setLoading] = useState(true);
  const [savingLoyalty, setSavingLoyalty] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [savingAppUpdates, setSavingAppUpdates] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // App Updates states
  const [androidLatestVersion, setAndroidLatestVersion] = useState<string>('1.0.0');
  const [androidMinVersion, setAndroidMinVersion] = useState<string>('1.0.0');
  const [androidForceUpdate, setAndroidForceUpdate] = useState<boolean>(false);
  const [androidStoreUrl, setAndroidStoreUrl] = useState<string>('https://play.google.com/store/apps/details?id=com.dhabayih.lmamlaka');

  const [iosLatestVersion, setIosLatestVersion] = useState<string>('1.0.0');
  const [iosMinVersion, setIosMinVersion] = useState<string>('1.0.0');
  const [iosForceUpdate, setIosForceUpdate] = useState<boolean>(false);
  const [iosStoreUrl, setIosStoreUrl] = useState<string>('https://apps.apple.com/app/id6470000000');

  const [updateTitleAr, setUpdateTitleAr] = useState<string>('تحديث جديد متوفر');
  const [updateTitleEn, setUpdateTitleEn] = useState<string>('New Update Available');
  const [updateMessageAr, setUpdateMessageAr] = useState<string>('يتوفر إصدار جديد من تطبيق ذبائح المملكة بمزايا وتحسينات جديدة. يرجى التحديث للمتابعة.');
  const [updateMessageEn, setUpdateMessageEn] = useState<string>('A new version of Dhabayih Al-Mamlaka is available with new improvements. Please update to continue.');

  // Loyalty states
  const [earningRate, setEarningRate] = useState<number>(1.0);
  const [redemptionRate, setRedemptionRate] = useState<number>(100.0);
  const [minRedemption, setMinRedemption] = useState<number>(500);

  // WhatsApp & Support states
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState<string>('');
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [supportPhone, setSupportPhone] = useState<string>('');

  // Invoice & Printing states
  const [companyName, setCompanyName] = useState<string>('ذبائح المملكة');
  const [companyNameEn, setCompanyNameEn] = useState<string>('Dhabayih Lmamlaka');
  const [vatNumber, setVatNumber] = useState<string>('310198765400003');
  const [crNumber, setCrNumber] = useState<string>('1010892341');
  const [invoicePhone, setInvoicePhone] = useState<string>('0568741660');
  const [invoiceEmail, setInvoiceEmail] = useState<string>('info@dhabayih.com');
  const [invoiceAddress, setInvoiceAddress] = useState<string>('طريق الملك فهد - الرياض');
  const [paperFormat, setPaperFormat] = useState<'thermal_80' | 'a4'>('thermal_80');
  const [receiptWidth, setReceiptWidth] = useState<number>(80);
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showQr, setShowQr] = useState<boolean>(true);
  const [headerNote, setHeaderNote] = useState<string>('ذبائح ولحوم بلدية طازجة وفق الشريعة الإسلامية');
  const [footerNote, setFooterNote] = useState<string>('شكراً لتسوقكم من ذبائح المملكة | خدمة العملاء: 0568741660');
  const [vatRate, setVatRate] = useState<number>(15);
  const [invoicePrefix, setInvoicePrefix] = useState<string>('INV-');

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const results = await Promise.allSettled([
        adminApi.getLoyaltySettings(),
        adminApi.getPublicSettings(),
        adminApi.getInvoiceSettings(),
        adminApi.getAppVersionSettings(),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value?.loyaltySettings) {
        const ls = results[0].value.loyaltySettings;
        setEarningRate(ls.earningRate ?? 1.0);
        setRedemptionRate(ls.redemptionRate ?? 100.0);
        setMinRedemption(ls.minRedemption ?? 500);
      }

      if (results[1].status === 'fulfilled' && results[1].value?.settings) {
        const st = results[1].value.settings;
        setWhatsappNumber(st.whatsappNumber || '');
        setWhatsappDefaultMessage(st.whatsappDefaultMessage || '');
        setWhatsappEnabled(st.whatsappEnabled ?? true);
        setSupportPhone(st.supportPhone || '');
      }

      if (results[2].status === 'fulfilled' && results[2].value?.settings) {
        const inv = results[2].value.settings;
        setCompanyName(inv.companyName || 'ذبائح المملكة');
        setCompanyNameEn(inv.companyNameEn || 'Dhabayih Lmamlaka');
        setVatNumber(inv.vatNumber || '310198765400003');
        setCrNumber(inv.crNumber || '1010892341');
        setInvoicePhone(inv.phone || '0568741660');
        setInvoiceEmail(inv.email || 'info@dhabayih.com');
        setInvoiceAddress(inv.address || 'طريق الملك فهد - الرياض');
        setPaperFormat(inv.paperFormat === 'a4' ? 'a4' : 'thermal_80');
        setReceiptWidth(inv.receiptWidth || 80);
        setShowLogo(inv.showLogo !== false);
        setShowQr(inv.showQr !== false);
        setHeaderNote(inv.headerNote || 'ذبائح ولحوم بلدية طازجة وفق الشريعة الإسلامية');
        setFooterNote(inv.footerNote || 'شكراً لتسوقكم من ذبائح المملكة | خدمة العملاء: 0568741660');
        setVatRate(inv.vatRate || 15);
        setInvoicePrefix(inv.prefix || 'INV-');
      }

      if (results[3].status === 'fulfilled' && results[3].value?.settings) {
        const ver = results[3].value.settings;
        setAndroidLatestVersion(ver.android.latestVersion || '1.0.0');
        setAndroidMinVersion(ver.android.minVersion || '1.0.0');
        setAndroidForceUpdate(Boolean(ver.android.forceUpdate));
        setAndroidStoreUrl(ver.android.storeUrl || 'https://play.google.com/store/apps/details?id=com.dhabayih.lmamlaka');

        setIosLatestVersion(ver.ios.latestVersion || '1.0.0');
        setIosMinVersion(ver.ios.minVersion || '1.0.0');
        setIosForceUpdate(Boolean(ver.ios.forceUpdate));
        setIosStoreUrl(ver.ios.storeUrl || 'https://apps.apple.com/app/id6470000000');

        setUpdateTitleAr(ver.titleAr || 'تحديث جديد متوفر');
        setUpdateTitleEn(ver.titleEn || 'New Update Available');
        setUpdateMessageAr(ver.messageAr || 'يتوفر إصدار جديد من تطبيق ذبائح المملكة بمزايا وتحسينات جديدة. يرجى التحديث للمتابعة.');
        setUpdateMessageEn(ver.messageEn || 'A new version of Dhabayih Al-Mamlaka is available with new improvements. Please update to continue.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? 'فشل تحميل الإعدادات' : 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInvoice(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.updateInvoiceSettings({
        companyName,
        companyNameEn,
        vatNumber,
        crNumber,
        phone: invoicePhone,
        email: invoiceEmail,
        address: invoiceAddress,
        paperFormat,
        receiptWidth,
        showLogo,
        showQr,
        headerNote,
        footerNote,
        vatRate,
        prefix: invoicePrefix,
      });
      setSuccessMsg(isAr ? 'تم حفظ إعدادات الفاتورة والطباعة في Odoo بنجاح' : 'Invoice & Printing settings saved successfully');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? 'فشل حفظ إعدادات الفاتورة' : 'Failed to update invoice settings'));
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleSaveLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLoyalty(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.updateLoyaltySettings({
        earningRate,
        redemptionRate,
        minRedemption
      });
      setSuccessMsg(isAr ? 'تم حفظ قواعد نقاط الولاء في النظام بنجاح' : 'Loyalty rules updated successfully in ERP');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? 'فشل تحديث إعدادات الولاء' : 'Failed to update loyalty settings'));
    } finally {
      setSavingLoyalty(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.updateContactSettings({
        whatsappNumber,
        whatsappDefaultMessage,
        whatsappEnabled,
        supportPhone
      });
      setSuccessMsg(isAr ? 'تم حفظ بيانات الاتصال والدعم بنجاح' : 'Contact & WhatsApp settings updated successfully');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? 'فشل تحديث بيانات الاتصال' : 'Failed to update contact settings'));
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveAppUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAppUpdates(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.updateAppVersionSettings({
        android: {
          latestVersion: androidLatestVersion,
          minVersion: androidMinVersion,
          forceUpdate: androidForceUpdate,
          storeUrl: androidStoreUrl,
        },
        ios: {
          latestVersion: iosLatestVersion,
          minVersion: iosMinVersion,
          forceUpdate: iosForceUpdate,
          storeUrl: iosStoreUrl,
        },
        titleAr: updateTitleAr,
        titleEn: updateTitleEn,
        messageAr: updateMessageAr,
        messageEn: updateMessageEn,
      });
      setSuccessMsg(isAr ? 'تم حفظ قواعد وإعدادات تحديثات التطبيق بنجاح' : 'App version update settings saved successfully');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? 'فشل حفظ إعدادات التحديث' : 'Failed to save app update settings'));
    } finally {
      setSavingAppUpdates(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl">
      {/* Banner info */}
      <div className="bg-gradient-to-r from-primary-950 via-slate-900 to-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary-900/30">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black">
              {isAr ? 'إعدادات النظام والفوترة والخدمات' : 'System & Services Configuration'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isAr
                ? 'إدارة إعدادات الفاتورة الضريبية ZATCA، قوالب الطباعة الحرارية، الدعم المباشر، ونقاط الولاء'
                : 'Manage ZATCA e-invoicing parameters, thermal receipt templates, customer support, and loyalty rewards'}
            </p>
          </div>
        </div>

        <button
          onClick={loadSettings}
          disabled={loading}
          className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all text-white cursor-pointer self-end sm:self-auto shrink-0"
          title={isAr ? 'تحديث الإعدادات' : 'Reload Settings'}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('invoice')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3.5 sm:px-5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'invoice'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'إعدادات الفاتورة والطباعة (Invoice & Print)' : 'Invoice & Printing'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3.5 sm:px-5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'الدعم الفني والواتساب (Support & WhatsApp)' : 'Customer Support'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('loyalty')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3.5 sm:px-5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'loyalty'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'قواعد نقاط الولاء (Loyalty Rewards)' : 'Loyalty Rules'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('app_updates')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3.5 sm:px-5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'app_updates'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'تحديثات التطبيق (App Updates)' : 'App Updates & Versions'}</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 text-sm animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm">{isAr ? 'جارٍ تحميل الإعدادات...' : 'Loading settings...'}</p>
        </div>
      ) : (
        <>
          {/* TAB 1: INVOICE & PRINTING CONFIGURATION */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleSaveInvoice} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Form controls */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Card 1: Company & Tax Details */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 bg-primary-50 dark:bg-primary-950/50 rounded-xl text-primary-600 dark:text-primary-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {isAr ? 'بيانات المنشأة والفوترة الضريبية (Seller & Tax Details)' : 'Company & Tax Details'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isAr
                            ? 'تظهر هذه البيانات رسمياً في أعلى الفاتورة الضريبية المبسطة وكود هيئة الزكاة (ZATCA)'
                            : 'Official data printed on simplified tax invoices and encoded in ZATCA QR'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'اسم المنشأة بالعربية *' : 'Company Name (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="مثال: شركة ذبائح المملكة للتجارة"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'اسم المنشأة بالإنجليزية' : 'Company Name (English)'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={companyNameEn}
                          onChange={(e) => setCompanyNameEn(e.target.value)}
                          placeholder="Dhabayih Lmamlaka Trading Co."
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'الرقم الضريبي (15 رقم) *' : 'VAT / Tax Number (15 digits) *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          maxLength={15}
                          value={vatNumber}
                          onChange={(e) => setVatNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="310198765400003"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'رقم السجل التجاري (CR Number) *' : 'Commercial Registration *'}
                        </label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          value={crNumber}
                          onChange={(e) => setCrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="1010892341"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'هاتف الفواتير والتواصل' : 'Billing Hotline'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={invoicePhone}
                          onChange={(e) => setInvoicePhone(e.target.value)}
                          placeholder="0568741660"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'البريد الإلكتروني للفواتير' : 'Billing Email'}
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          value={invoiceEmail}
                          onChange={(e) => setInvoiceEmail(e.target.value)}
                          placeholder="info@dhabayih.com"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'العنوان الوطني / المدينة والفرع' : 'National Address / City'}
                        </label>
                        <input
                          type="text"
                          value={invoiceAddress}
                          onChange={(e) => setInvoiceAddress(e.target.value)}
                          placeholder="المملكة العربية السعودية - الرياض - طريق الملك فهد"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Print Layout & Paper Format */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {isAr ? 'تنسيق ورق الطباعة وإعدادات الطابعة' : 'Print & Paper Format Configuration'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isAr
                            ? 'تحديد نمط الطباعة الافتراضي (طابعة إيصالات حرارية للمسلخ / ورق A4 رسمي)'
                            : 'Choose default format: 80mm thermal receipt roll or standard A4 paper'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* Thermal 80mm Option */}
                      <button
                        type="button"
                        onClick={() => setPaperFormat('thermal_80')}
                        className={`min-h-[44px] p-4 rounded-2xl border text-right cursor-pointer transition-all flex items-start gap-3.5 ${
                          paperFormat === 'thermal_80'
                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-950 dark:text-primary-100 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`size-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            paperFormat === 'thermal_80'
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-slate-400 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {paperFormat === 'thermal_80' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="block font-bold text-xs">
                            {isAr ? 'إيصال حراري (Thermal 80mm)' : 'Thermal Receipt (80mm)'}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {isAr
                              ? 'مخصص لطابعات المسالخ وسيارات التوصيل السريع (Epson/Xprinter/Bixolon)'
                              : 'Recommended for butchery packing and courier handheld thermal printers'}
                          </span>
                        </div>
                      </button>

                      {/* A4 Option */}
                      <button
                        type="button"
                        onClick={() => setPaperFormat('a4')}
                        className={`min-h-[44px] p-4 rounded-2xl border text-right cursor-pointer transition-all flex items-start gap-3.5 ${
                          paperFormat === 'a4'
                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-950 dark:text-primary-100 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`size-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            paperFormat === 'a4'
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-slate-400 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {paperFormat === 'a4' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="block font-bold text-xs">
                            {isAr ? 'ورقة قياسية كاملة (Standard A4)' : 'Standard A4 Sheet'}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {isAr
                              ? 'فاتورة محاسبية كاملة للشركات والطلبات الكبيرة مع تفاصيل التجهيز الكاملة'
                              : 'Full corporate invoice layout with complete item specifications'}
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'عرض الإيصال (مليمتر)' : 'Receipt Width (mm)'}
                        </label>
                        <select
                          value={receiptWidth}
                          onChange={(e) => setReceiptWidth(Number(e.target.value))}
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value={80}>80 mm (القياس المعتمد الشائع)</option>
                          <option value={72}>72 mm</option>
                          <option value={58}>58 mm (إيصالات مصغرة)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'نسبة ضريبة القيمة المضافة' : 'VAT Rate %'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={vatRate}
                            onChange={(e) => setVatRate(Number(e.target.value))}
                            className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-xs font-bold text-slate-400">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'بادئة رقم الفاتورة' : 'Invoice Number Prefix'}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={invoicePrefix}
                          onChange={(e) => setInvoicePrefix(e.target.value)}
                          placeholder="INV-"
                          className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[44px]">
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                            {isAr ? 'رمز الاستجابة السريع (ZATCA QR)' : 'ZATCA QR Code'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {isAr ? 'مطلوب إلزامياً من هيئة الزكاة' : 'Mandatory e-invoice barcode'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowQr(!showQr)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                            showQr ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              showQr ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[44px]">
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                            {isAr ? 'إظهار لوجو ذبائح المملكة' : 'Show Store Logo'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {isAr ? 'طباعة الشعار الرسمي بأعلى الفاتورة' : 'Print brand logo in header'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLogo(!showLogo)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                            showLogo ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              showLogo ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Notes & Policy */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {isAr ? 'نصوص الترويسة وتذييل الفاتورة (Header & Footer Notes)' : 'Header & Footer Text'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isAr
                            ? 'العبارات التعريفية وشكر العميل وسياسة الذبح المعتمدة'
                            : 'Greeting messages, customer service note, and health inspection guarantees'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isAr ? 'ملاحظة الترويسة (أسفل اسم المتجر)' : 'Header Tagline'}
                      </label>
                      <input
                        type="text"
                        value={headerNote}
                        onChange={(e) => setHeaderNote(e.target.value)}
                        placeholder="ذبائح ولحوم بلدية طازجة وفق الشريعة الإسلامية ومفحوصة بيطرياً"
                        className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isAr ? 'ملاحظة التذييل والشكر (أسفل الفاتورة)' : 'Footer Note & Customer Service'}
                      </label>
                      <textarea
                        rows={2}
                        value={footerNote}
                        onChange={(e) => setFooterNote(e.target.value)}
                        placeholder="شكراً لتسوقكم من ذبائح المملكة | خدمة العملاء: 0568741660 | اللحوم الطازجة تحفظ مبردة فور الاستلام"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Col: Live Invoice Preview Card */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary-600" />
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                          {isAr ? 'معاينة حية لشكل الفاتورة' : 'Live Receipt Preview'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                        {paperFormat === 'thermal_80' ? '80mm Thermal' : 'Standard A4'}
                      </span>
                    </div>

                    {/* Paper Mockup */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-[11px] space-y-3 font-mono shadow-inner overflow-x-auto">
                      {/* Header */}
                      <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                        {showLogo && (
                          <div className="size-10 rounded-full bg-primary-600 text-white font-black flex items-center justify-center mx-auto text-xs shadow-xs">
                            ذ.م
                          </div>
                        )}
                        <h5 className="font-black text-sm">{companyName || 'ذبائح المملكة'}</h5>
                        <p className="text-[10px] text-slate-500">{headerNote}</p>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5 pt-1">
                          <p>الرقم الضريبي: {vatNumber || '310198765400003'}</p>
                          <p>السجل التجاري: {crNumber || '1010892341'}</p>
                          <p>العنوان: {invoiceAddress || 'الرياض'}</p>
                        </div>
                      </div>

                      {/* Order info */}
                      <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">رقم الفاتورة:</span>
                          <span className="font-bold">{invoicePrefix}2026-0891</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">التاريخ:</span>
                          <span>2026-10-27 14:30</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">طريقة الدفع:</span>
                          <span className="font-bold text-emerald-600">مدى (Mada)</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                        <div className="flex justify-between font-bold text-[10px] text-slate-500">
                          <span>الصنف</span>
                          <span>المجموع</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold block">خروف حري بلدي (كامل)</span>
                            <span className="text-[9px] text-slate-500 block">تفصيل ثلاجة | كرتون مبرد | بدون رأس</span>
                          </div>
                          <span className="font-bold">1,200.00 ر.س</span>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">المجموع غير شامل الضريبة:</span>
                          <span>1,043.48 ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">ضريبة القيمة المضافة ({vatRate}%):</span>
                          <span>156.52 ر.س</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">رسوم التوصيل المبرد:</span>
                          <span>31.95 ر.س</span>
                        </div>
                        <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300 dark:border-slate-700 text-primary-700 dark:text-primary-400">
                          <span>الإجمالي المستحق:</span>
                          <span>1,231.95 ر.س</span>
                        </div>
                      </div>

                      {/* QR Code */}
                      {showQr && (
                        <div className="text-center pt-2 space-y-1">
                          <div className="size-20 mx-auto bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                            <QrCode className="w-16 h-16 text-slate-900" />
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold block">
                            فاتورة ضريبية مبسطة معتمدة - ZATCA
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="text-center text-[9px] text-slate-500 pt-1 border-t border-dashed border-slate-300 dark:border-slate-700">
                        <p>{footerNote}</p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={savingInvoice}
                      className="min-h-[44px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {savingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isAr ? 'حفظ إعدادات الفاتورة في النظام' : 'Save Invoice Configuration'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: WHATSAPP & SUPPORT */}
          {activeTab === 'contact' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm max-w-2xl">
              <form onSubmit={handleSaveContact} className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {isAr ? 'الدعم الفني وخدمة الواتساب' : 'Customer Support & WhatsApp'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'تخصيص الرقم الافتراضي والزر العائم للعميل' : 'Customize floating WhatsApp button and hotlines'}
                    </p>
                  </div>
                </div>

                {/* Toggle WhatsApp */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 min-h-[44px]">
                  <div>
                    <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                      {isAr ? 'تفعيل زر الواتساب العائم' : 'Enable Floating WhatsApp Widget'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {isAr ? 'يظهر للعميل في أسفل واجهة المتجر' : 'Displays in customer shopping storefront'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                      whatsappEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        whatsappEnabled ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')
                      }`}
                    />
                  </button>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'رقم الواتساب الرسمي (مع المقدمة الدولية)' : 'Official WhatsApp Number'}</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+966500000000"
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  />
                </div>

                {/* Default WhatsApp Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'نص الرسالة الافتراضية عند بدء المحادثة' : 'Default Pre-filled WhatsApp Message'}
                  </label>
                  <textarea
                    rows={3}
                    value={whatsappDefaultMessage}
                    onChange={(e) => setWhatsappDefaultMessage(e.target.value)}
                    placeholder={isAr ? 'مرحباً، أود الاستفسار عن ذبائح المملكة' : 'Hello, I have an inquiry...'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Support Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary-600" />
                    <span>{isAr ? 'هاتف الدعم الموحد أو الجوال المباشر' : 'Customer Support Phone / Hotline'}</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="920000000"
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingContact}
                    className="min-h-[44px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {savingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isAr ? 'حفظ إعدادات التواصل' : 'Save Contact Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: LOYALTY RULES */}
          {activeTab === 'loyalty' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm max-w-2xl">
              <form onSubmit={handleSaveLoyalty} className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {isAr ? 'قواعد برنامج مكافآت ونقاط الولاء' : 'Loyalty Points Program Rules'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'معدلات اكتساب النقاط والاستبدال والحد الأدنى' : 'Set earning rates, redemption values, and thresholds'}
                    </p>
                  </div>
                </div>

                {/* Earning Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'معدل الاكتساب (نقطة لكل 1 ر.س مشتريات)' : 'Earning Rate (Points per 1 SAR)'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    {isAr
                      ? 'مثال: 1.00 يعني أن كل ريال ينفقه العميل يمنحه نقطة واحدة'
                      : 'e.g. 1.00 grants 1 point for every 1 SAR purchased'}
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={earningRate}
                      onChange={(e) => setEarningRate(parseFloat(e.target.value) || 0)}
                      className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-xs font-bold text-slate-400">
                      {isAr ? 'نقطة / 1 ر.س' : 'pts / 1 SAR'}
                    </span>
                  </div>
                </div>

                {/* Redemption Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'معدل الاستبدال (كم نقطة تساوي 1 ر.س خصم)' : 'Redemption Rate (Points = 1 SAR)'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    {isAr
                      ? 'مثال: 100.00 يعني أن كل 100 نقطة يمكن تحويلها إلى خصم بقيمة 1 ريال'
                      : 'e.g. 100 points equals 1 SAR deduction at checkout'}
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={redemptionRate}
                      onChange={(e) => setRedemptionRate(parseFloat(e.target.value) || 1)}
                      className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-xs font-bold text-slate-400">
                      {isAr ? 'نقطة = 1 ر.س' : 'pts = 1 SAR'}
                    </span>
                  </div>
                </div>

                {/* Min Redemption */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الحد الأدنى لرصيد الاستبدال' : 'Minimum Points for Redemption'}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    {isAr
                      ? 'لا يستطيع العميل الاستبدال إلا إذا بلغ رصيده هذا الحد على الأقل'
                      : 'Customer must reach this minimum balance to redeem points'}
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={minRedemption}
                      onChange={(e) => setMinRedemption(parseInt(e.target.value) || 0)}
                      className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-xs font-bold text-slate-400">
                      {isAr ? 'نقطة' : 'points'}
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingLoyalty}
                    className="min-h-[44px] w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {savingLoyalty ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isAr ? 'حفظ إعدادات برنامج الولاء' : 'Save Loyalty Rules'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: APP UPDATES & VERSION MANAGEMENT (FORCE / OPTIONAL) */}
          {activeTab === 'app_updates' && (
            <form onSubmit={handleSaveAppUpdates} className="space-y-6 max-w-4xl">
              {/* Guidance Info Card */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-start gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-950/50 rounded-2xl text-primary-600 shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {isAr ? 'آلية إدارة تحديثات التطبيق (Force vs Optional Updates)' : 'App Version Rules & Mechanism'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isAr
                      ? '• التحديث الإجباري (Force Update): يظهر عندما يكون إصدار التطبيق لدى العميل أقل من "الحد الأدنى"، أو عند تفعيل زر التحديث الإجباري. يتم حظر استخدام التطبيق حتى يقوم بالترقية من المتجر.\n• التحديث الاختياري (Optional Update): يظهر كإشعار تنبيهي لطيف إذا كان العميل يمتلك إصداراً قديماً ولكن أعلى من الحد الأدنى، مع إمكانية التخطي والمتابعة.'
                      : '• Force Update: Block app usage until updated when installed version is below the minimum required version, or when Force Update flag is ON.\n• Optional Update: Friendly prompt allowing user to update now or skip for later.'}
                  </p>
                </div>
              </div>

              {/* 2-Column Grid: Android & iOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Android Configuration */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        AND
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {isAr ? 'تطبيق أندرويد (Google Play)' : 'Android Configuration'}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      androidForceUpdate
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40'
                    }`}>
                      {androidForceUpdate ? (isAr ? 'إجباري مفعل' : 'Force Enabled') : (isAr ? 'اختياري' : 'Optional')}
                    </span>
                  </div>

                  {/* Android Latest Version */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'الإصدار الأخير في المتجر (Latest Version)' : 'Latest Store Version'}
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.1"
                      value={androidLatestVersion}
                      onChange={(e) => setAndroidLatestVersion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Android Min Supported Version */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'الحد الأدنى للإصدار (Min Required Version)' : 'Minimum Supported Version'}
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={androidMinVersion}
                      onChange={(e) => setAndroidMinVersion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isAr ? 'أي إصدار أقل من هذا سيتم منعه من الدخول وإجباره على التحديث.' : 'Versions below this are forced to update.'}
                    </p>
                  </div>

                  {/* Force Update Toggle Switch */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isAr ? 'فرض التحديث الإجباري دائماً' : 'Always Force Update'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isAr ? 'إغلاق التطبيق حتى يتم التحديث لجميع الإصدارات القديمة' : 'Block older versions unconditionally'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={androidForceUpdate}
                        onChange={(e) => setAndroidForceUpdate(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Android Store URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'رابط تطبيق أندرويد في Google Play' : 'Google Play URL'}
                    </label>
                    <input
                      type="url"
                      value={androidStoreUrl}
                      onChange={(e) => setAndroidStoreUrl(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* iOS Configuration */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        iOS
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {isAr ? 'تطبيق آيفون (Apple App Store)' : 'iOS Configuration'}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      iosForceUpdate
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40'
                    }`}>
                      {iosForceUpdate ? (isAr ? 'إجباري مفعل' : 'Force Enabled') : (isAr ? 'اختياري' : 'Optional')}
                    </span>
                  </div>

                  {/* iOS Latest Version */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'الإصدار الأخير في المتجر (Latest Version)' : 'Latest Store Version'}
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.1"
                      value={iosLatestVersion}
                      onChange={(e) => setIosLatestVersion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* iOS Min Supported Version */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'الحد الأدنى للإصدار (Min Required Version)' : 'Minimum Supported Version'}
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={iosMinVersion}
                      onChange={(e) => setIosMinVersion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isAr ? 'أي إصدار أقل من هذا سيتم منعه من الدخول وإجباره على التحديث.' : 'Versions below this are forced to update.'}
                    </p>
                  </div>

                  {/* Force Update Toggle Switch */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isAr ? 'فرض التحديث الإجباري دائماً' : 'Always Force Update'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isAr ? 'إغلاق التطبيق حتى يتم التحديث لجميع الإصدارات القديمة' : 'Block older versions unconditionally'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={iosForceUpdate}
                        onChange={(e) => setIosForceUpdate(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* iOS Store URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'رابط تطبيق آيفون في App Store' : 'Apple App Store URL'}
                    </label>
                    <input
                      type="url"
                      value={iosStoreUrl}
                      onChange={(e) => setIosStoreUrl(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Update Dialog Text & Localization */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                  {isAr ? 'نصوص ورسائل نافذة التحديث في التطبيق' : 'Update Dialog Title & Description'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'عنوان التنبيه (عربي)' : 'Alert Title (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={updateTitleAr}
                      onChange={(e) => setUpdateTitleAr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'عنوان التنبيه (إنجليزي)' : 'Alert Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={updateTitleEn}
                      onChange={(e) => setUpdateTitleEn(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'رسالة التحديث للعميل (عربي)' : 'Update Message (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={updateMessageAr}
                      onChange={(e) => setUpdateMessageAr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'رسالة التحديث للعميل (إنجليزي)' : 'Update Message (English)'}
                    </label>
                    <textarea
                      rows={3}
                      value={updateMessageEn}
                      onChange={(e) => setUpdateMessageEn(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingAppUpdates}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {savingAppUpdates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isAr ? 'حفظ إعدادات تحديثات التطبيق' : 'Save App Update Settings'}</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};
