import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Image as ImageIcon,
  Ticket,
  Bell,
  Send,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  Percent,
  Calendar,
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { adminApi, Offer, AdminBanner, AdminCoupon, Product, normalizeImageUrl } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';

type MarketingTab = 'offers' | 'banners' | 'coupons' | 'notifications';

interface AdminMarketingViewProps {
  initialTab?: MarketingTab;
  onNavigateSubTab?: (subtab: string) => void;
}

export const AdminMarketingView: React.FC<AdminMarketingViewProps> = ({
  initialTab = 'offers',
  onNavigateSubTab,
}) => {
  const { language, isRTL } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<MarketingTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tabId: MarketingTab) => {
    setActiveTab(tabId);
    if (onNavigateSubTab) {
      onNavigateSubTab(tabId);
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search & Copy states
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [offerModal, setOfferModal] = useState<{ open: boolean; data: Offer | null }>({ open: false, data: null });
  const [bannerModal, setBannerModal] = useState<{ open: boolean; data: AdminBanner | null }>({ open: false, data: null });
  const [couponModal, setCouponModal] = useState<{ open: boolean; data: AdminCoupon | null }>({ open: false, data: null });

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    couponId?: number;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: '',
    onConfirm: async () => { }
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms
  const [offerForm, setOfferForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    badgeText: 'باقة التوفير',
    discountValue: 15,
    discountType: 'percentage' as 'percentage' | 'fixed',
    selectedProductIds: [] as number[],
    startDate: '',
    endDate: '',
    bannerImage: '',
    isActive: true
  });
  const [bannerForm, setBannerForm] = useState({ title: '', image: '', link: '', sequence: 10, isActive: true });
  const [couponForm, setCouponForm] = useState({
    code: '',
    name: 'كوبون خصم',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 15,
    minOrderAmount: 200,
    usageLimit: 100,
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Push notification form
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushTopic, setPushTopic] = useState<'all' | 'users' | 'admins'>('all');
  const [sendingPush, setSendingPush] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);

  const [saving, setSaving] = useState(false);

  const generateRandomCouponCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'JABIN-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm((prev) => ({ ...prev, code }));
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        adminApi.getOffers(),
        adminApi.getBanners(),
        adminApi.getCoupons(),
        adminApi.getProducts(),
      ]);

      if (results[0].status === 'fulfilled') setOffers(Array.isArray(results[0].value.offers) ? results[0].value.offers : []);
      if (results[1].status === 'fulfilled') setBanners(Array.isArray(results[1].value.banners) ? results[1].value.banners : []);
      if (results[2].status === 'fulfilled') setCoupons(Array.isArray(results[2].value.coupons) ? results[2].value.coupons : []);
      if (results[3].status === 'fulfilled') setProducts(Array.isArray(results[3].value.products) ? results[3].value.products : []);
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'فشل تحميل البيانات التسويقية' : 'Failed to load marketing data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handlers for Offer
  const handleOpenOfferModal = (offer?: Offer) => {
    if (offer) {
      setOfferForm({
        title: offer.title,
        subtitle: offer.subtitle || '',
        description: offer.description || '',
        badgeText: offer.badgeText || 'خصم خاص',
        discountValue: offer.discountValue ?? offer.discountPercentage ?? 15,
        discountType: offer.discountType || 'percentage',
        selectedProductIds: offer.productIds?.length ? offer.productIds : (offer.productId ? [offer.productId] : []),
        startDate: offer.startDate || '',
        endDate: offer.endDate || '',
        bannerImage: offer.bannerImage || '',
        isActive: offer.isActive
      });
      setOfferModal({ open: true, data: offer });
    } else {
      setOfferForm({
        title: '',
        subtitle: '',
        description: '',
        badgeText: 'باقة التوفير',
        discountValue: 15,
        discountType: 'percentage',
        selectedProductIds: products.length > 0 ? [products[0].id] : [],
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        bannerImage: '',
        isActive: true
      });
      setOfferModal({ open: true, data: null });
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم العرض أو الباقة' : 'Please provide offer title');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: offerForm.title.trim(),
        subtitle: offerForm.subtitle.trim(),
        description: offerForm.description.trim(),
        badge_text: offerForm.badgeText.trim(),
        discount_type: offerForm.discountType,
        discount_value: Number(offerForm.discountValue) || 0,
        active: offerForm.isActive,
      };

      const sanitizeDate = (val?: string) => {
        if (!val || !val.trim()) return undefined;
        const parts = val.trim().split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          } else if (parts[2].length === 4) {
            // Check if parts[0] is month or day
            const p0 = parseInt(parts[0], 10);
            const p1 = parseInt(parts[1], 10);
            if (p0 > 12) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        }
        return val.trim();
      };

      if (offerForm.startDate && offerForm.startDate.trim()) {
        payload.start_date = sanitizeDate(offerForm.startDate);
      }
      if (offerForm.endDate && offerForm.endDate.trim()) {
        payload.end_date = sanitizeDate(offerForm.endDate);
      } else if (offerModal.data) {
        payload.end_date = false;
      }

      if (offerForm.selectedProductIds && offerForm.selectedProductIds.length > 0) {
        payload.product_ids = offerForm.selectedProductIds;
      }

      // ONLY send banner_image if user uploaded a new image
      if (offerForm.bannerImage && offerForm.bannerImage.startsWith('data:image/')) {
        payload.banner_image = offerForm.bannerImage;
      }

      if (offerModal.data) {
        await adminApi.updateOffer(offerModal.data.id, payload);
      } else {
        await adminApi.createOffer(payload);
      }
      setOfferModal({ open: false, data: null });
      await loadData();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (language === 'ar' ? 'فشل حفظ العرض' : 'Error saving offer');
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Handlers for Banner
  const handleOpenBannerModal = (banner?: AdminBanner) => {
    if (banner) {
      setBannerForm({
        title: banner.title,
        image: banner.image,
        link: banner.link || '',
        sequence: banner.sequence,
        isActive: banner.isActive
      });
      setBannerModal({ open: true, data: banner });
    } else {
      setBannerForm({
        title: '',
        image: '',
        link: '/catalog',
        sequence: 10,
        isActive: true
      });
      setBannerModal({ open: true, data: null });
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: bannerForm.title.trim(),
        title: bannerForm.title.trim(),
        deep_link: bannerForm.link || '',
        link: bannerForm.link || '',
        sequence: Number(bannerForm.sequence || 10),
        active: bannerForm.isActive,
      };

      if (bannerForm.image && bannerForm.image.startsWith('data:image/')) {
        payload.image = bannerForm.image;
      }

      if (bannerModal.data) {
        await adminApi.updateBanner(bannerModal.data.id, payload);
      } else {
        await adminApi.createBanner(payload);
      }
      setBannerModal({ open: false, data: null });
      await loadData();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error saving banner';
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Handlers for Coupon
  const handleOpenCouponModal = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let autoCode = 'JABIN-';
    for (let i = 0; i < 8; i++) {
      autoCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm({
      code: autoCode,
      name: 'كوبون تخفيض ذبائح',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 200,
      usageLimit: 100,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      isActive: true
    });
    setCouponModal({ open: true, data: null });
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        code: couponForm.code.trim().toUpperCase(),
        name: couponForm.name || 'كوبون خصم',
        discount_type: couponForm.discountType,
        discount_value: couponForm.discountValue,
        minimum_order_amount: couponForm.minOrderAmount,
        usage_limit: couponForm.usageLimit,
        start_date: couponForm.startDate || undefined,
        end_date: couponForm.endDate || undefined,
        active: couponForm.isActive,
        is_active: couponForm.isActive,
      };
      await adminApi.createCoupon(payload);
      setCouponModal({ open: false, data: null });
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Error creating coupon');
    } finally {
      setSaving(false);
    }
  };

  // Handler for FCM Push
  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;
    setSendingPush(true);
    try {
      await adminApi.sendBroadcastNotification({
        title: pushTitle.trim(),
        body: pushBody.trim(),
        topic: pushTopic
      });
      setPushSuccess(true);
      setPushTitle('');
      setPushBody('');
      setTimeout(() => setPushSuccess(false), 5000);
    } catch (err: any) {
      alert(err?.message || 'Failed to send broadcast push');
    } finally {
      setSendingPush(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Push Announcement CTA Card */}
      <div className="bg-gradient-to-r from-primary-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Bell className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-black">
              {language === 'ar' ? 'مركز التسويق وحملات الإشعارات' : 'Marketing & Broadcast Campaigns'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {language === 'ar'
                ? 'إدارة العروض الترويجية، البنرات الإعلانية، كوبونات الخصم، وإرسال تنبيهات فورية لجميع العملاء'
                : 'Manage discounts, banners, coupon codes, and push live mobile broadcasts to all shoppers'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('notifications')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{language === 'ar' ? 'إرسال إشعار فوري' : 'Send Push Alert'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'offers', labelAr: 'العروض الترويجية والباقات', labelEn: 'Offers & Bundles', count: offers.length, icon: Tag },
            { id: 'banners', labelAr: 'البنرات الإعلانية', labelEn: 'Banners', count: banners.length, icon: ImageIcon },
            { id: 'coupons', labelAr: 'كوبونات الخصم', labelEn: 'Coupons', count: coupons.length, icon: Ticket },
            { id: 'notifications', labelAr: 'إشعارات FCM الفورية', labelEn: 'FCM Push Broadcast', count: null, icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as MarketingTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${isSelected
                    ? 'bg-primary-600 text-white shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab !== 'notifications' && (
          <button
            onClick={() => {
              if (activeTab === 'offers') handleOpenOfferModal();
              else if (activeTab === 'banners') handleOpenBannerModal();
              else if (activeTab === 'coupons') handleOpenCouponModal();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'offers' && (language === 'ar' ? 'إضافة عرض أو باقة' : 'New Offer / Bundle')}
              {activeTab === 'banners' && (language === 'ar' ? 'إضافة بنر' : 'New Banner')}
              {activeTab === 'coupons' && (language === 'ar' ? 'إنشاء كود خصم' : 'New Coupon')}
            </span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm">{language === 'ar' ? 'جارٍ تحميل البيانات...' : 'Loading data...'}</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-red-600 dark:text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold">
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* TAB 1: Offers & Bundles */}
      {!loading && !error && activeTab === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => {
            const isFixed = offer.discountType === 'fixed';
            const discountLabel = isFixed
              ? `-${offer.discountValue || offer.discountPercentage} ر.س`
              : `-${offer.discountPercentage || offer.discountValue}%`;

            return (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                {/* Banner Header if available */}
                {offer.bannerImage && (
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 w-full overflow-hidden relative">
                    <img
                      src={normalizeImageUrl(offer.bannerImage)}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {offer.badgeText && (
                      <span className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 px-2.5 py-1 rounded-lg text-[11px] font-black bg-brand-600/90 text-white backdrop-blur-md shadow-sm">
                        {offer.badgeText}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-600">
                          <Percent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{offer.title}</h4>
                          {offer.subtitle && (
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
                              {offer.subtitle}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {offer.productName || (language === 'ar' ? 'عرض عام على جميع الذبائح' : 'Storewide')}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono">
                        {discountLabel}
                      </span>
                    </div>

                    {offer.description && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{offer.description}</p>
                    )}

                    {(offer.startDate || offer.endDate) && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {offer.startDate || '—'} {offer.endDate ? `إلى ${offer.endDate}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className={`text-xs font-bold ${offer.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {offer.isActive ? (language === 'ar' ? 'باقة / عرض نشط' : 'Active Offer') : (language === 'ar' ? 'متوقف' : 'Inactive')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenOfferModal(offer)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors cursor-pointer"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteDialog({
                            open: true,
                            title: offer.title,
                            onConfirm: async () => {
                              await adminApi.deleteOffer(offer.id);
                              await loadData();
                            }
                          });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Banners */}
      {!loading && !error && activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="h-44 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                {banner.image ? (
                  <img
                    src={normalizeImageUrl(banner.image)}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                )}
                <span className="absolute top-3 ltr:left-3 rtl:right-3 px-2 py-1 bg-slate-900/70 backdrop-blur-md text-white text-xs font-mono font-bold rounded-lg">
                  #{banner.sequence}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{banner.title}</h4>
                  {banner.link && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 truncate flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{banner.link}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className={`text-xs font-bold ${banner.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}>
                    {banner.isActive ? (language === 'ar' ? 'بنر معروض' : 'Displayed') : (language === 'ar' ? 'مخفي' : 'Hidden')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenBannerModal(banner)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteDialog({
                          open: true,
                          title: banner.title,
                          onConfirm: async () => {
                            await adminApi.deleteBanner(banner.id);
                            await loadData();
                          }
                        });
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Coupons */}
      {!loading && !error && activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white dark:bg-slate-900 border border-dashed border-primary-300 dark:border-primary-800 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-mono font-black text-sm rounded-xl tracking-wider">
                    {coupon.code}
                  </span>

                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors"
                    title={language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                  >
                    {copiedCode === coupon.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `${coupon.discountValue} ${language === 'ar' ? 'ر.س' : 'SAR'}`}
                    <span className="text-xs font-normal text-slate-500 mx-2">
                      {language === 'ar' ? 'خصم مباشر' : 'discount'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'ar'
                      ? `الحد الأدنى للطلب: ${coupon.minOrderAmount} ر.س`
                      : `Min order: ${coupon.minOrderAmount} SAR`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar'
                      ? `تم الاستخدام: ${coupon.timesUsed || 0} من ${coupon.usageLimit || 'غير محدود'}`
                      : `Used: ${coupon.timesUsed || 0} of ${coupon.usageLimit || 'Unlimited'}`}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await adminApi.toggleCouponActive(coupon.id);
                      await loadData();
                    } catch (err: any) {
                      alert(err?.message || 'Failed to update coupon status');
                    }
                  }}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${coupon.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  title={language === 'ar' ? 'انقر للتعطيل أو التفعيل' : 'Toggle active status'}
                >
                  <span className={`w-2 h-2 rounded-full ${coupon.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>
                    {coupon.isActive
                      ? (language === 'ar' ? 'كود مفعّل' : 'Active')
                      : (language === 'ar' ? 'معطّل' : 'Disabled')}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setDeleteDialog({
                      open: true,
                      title: coupon.code,
                      couponId: coupon.id,
                      onConfirm: async () => {
                        await adminApi.deleteCoupon(coupon.id);
                        await loadData();
                      }
                    });
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  title={language === 'ar' ? 'حذف الكود' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: FCM Push Broadcast */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Composer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary-600" />
              <span>{language === 'ar' ? 'بث إشعار ترويجي فوري (FCM)' : 'Broadcast Push Notification'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {language === 'ar'
                ? 'يصل هذا الإشعار كرسالة منبثقة على أجهزة العملاء فور الإرسال عبر Google Firebase'
                : 'Pushes instantly to customers mobile devices via Google Firebase Cloud Messaging'}
            </p>

            {pushSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm mb-4 animate-fade-in">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">
                  {language === 'ar' ? 'تم إرسال الإشعار الترويجي لجميع الأجهزة بنجاح' : 'Push broadcast dispatched successfully'}
                </span>
              </div>
            )}

            <form onSubmit={handleSendPush} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الفئة المستهدفة *' : 'Target Topic *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', labelAr: 'جميع المشتركين', labelEn: 'All Users' },
                    { id: 'users', labelAr: 'العملاء فقط', labelEn: 'Customers' },
                    { id: 'admins', labelAr: 'فريق الإدارة', labelEn: 'Admins' },
                  ].map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setPushTopic(topic.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${pushTopic === topic.id
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                    >
                      {language === 'ar' ? topic.labelAr : topic.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'عنوان الإشعار *' : 'Notification Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'عرض خاص: نعيمي بلدي طازج بخصم 15%' : 'Flash Sale: Fresh Naemi 15% off'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'نص الرسالة *' : 'Notification Body *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'استمتع بأشهى الذبائح الطازجة مع التقطيع والتغليف المبرد المجاني. اطلب الآن قبل نفاد الكمية!'
                      : 'Enjoy the freshest meat with complimentary butchery and refrigerated packing. Order now!'
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md disabled:opacity-50 transition-all"
              >
                {sendingPush ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{language === 'ar' ? 'إرسال الحملة فوراً' : 'Broadcast Push Now'}</span>
              </button>
            </form>
          </div>

          {/* Live Mobile Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span>{language === 'ar' ? 'معاينة الإشعار على هاتف العميل' : 'Mobile Alert Preview'}</span>
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                {language === 'ar' ? 'كيف سيظهر الإشعار على شاشة القفل لدى المستلم' : 'Simulated device lockscreen banner'}
              </p>

              {/* Mock Device Banner */}
              <div className="max-w-sm mx-auto p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-slate-200">{language === 'ar' ? 'ذبائح المملكة' : 'Dhabayih Al-Mamlaka'}</span>
                  </div>
                  <span>{language === 'ar' ? 'الآن' : 'now'}</span>
                </div>
                <h5 className="font-bold text-sm text-white">{pushTitle || (language === 'ar' ? 'عنوان الإشعار الترويجي' : 'Campaign Headline')}</h5>
                <p className="text-xs text-slate-300 mt-1 line-clamp-3">
                  {pushBody || (language === 'ar' ? 'سيظهر هنا نص الإشعار الكامل الذي كتبته...' : 'The push notification body text will appear here...')}
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ar' ? 'ملاحظة تشغيلية:' : 'Operational Note:'}
              </span>
              {language === 'ar'
                ? 'يتم إرسال الإشعار لجميع الأجهزة المسجلة فوراً عبر خادم FCM في Odoo، تأكد من دقة الصياغة قبل البث.'
                : 'Dispatches immediately to all registered tokens via backend FCM endpoint. Check copy before sending.'}
            </div>
          </div>
        </div>
      )}

      {/* Offer / Bundle Add / Edit Modal (Matching Odoo 1:1) */}
      {offerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-600" />
              <span>
                {offerModal.data
                  ? (language === 'ar' ? 'تعديل بيانات العرض أو الباقة' : 'Edit Offer / Bundle')
                  : (language === 'ar' ? 'إضافة عرض أو باقة جديدة' : 'New Offer / Bundle')}
              </span>
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              {/* Offer Banner Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'صورة وبنر العرض أو الباقة' : 'Offer / Bundle Banner'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {offerForm.bannerImage ? (
                      <img src={normalizeImageUrl(offerForm.bannerImage)} alt="Offer" className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition">
                      <span>{language === 'ar' ? 'رفع صورة العرض...' : 'Choose banner...'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setOfferForm((prev) => ({ ...prev, bannerImage: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      {language === 'ar' ? 'صورة بنر ترويجي تظهر في شاشة العروض والباقات' : 'Promotional graphic'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Offer Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'اسم العرض أو الباقة *' : 'Offer / Bundle Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: باقة العزائم والمناسبات' : 'e.g. Feast Package'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'العنوان الفرعي للباقة' : 'Subtitle / Tagline'}
                  </label>
                  <input
                    type="text"
                    value={offerForm.subtitle}
                    onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: تكفي 8 إلى 12 فرداً' : 'e.g. Serves 8-12 people'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Discount Type & Value & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'نوع الخصم' : 'Discount Type'}
                  </label>
                  <select
                    value={offerForm.discountType}
                    onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  >
                    <option value="percentage">{language === 'ar' ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{language === 'ar' ? 'مبلغ ثابت (ر.س)' : 'Fixed Amount (SAR)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar'
                      ? (offerForm.discountType === 'percentage' ? 'نسبة الخصم (%) *' : 'قيمة الخصم (ر.س) *')
                      : 'Discount Value *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={offerForm.discountValue}
                    onChange={(e) => setOfferForm({ ...offerForm, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'نص الشارة (Badge)' : 'Badge Text'}
                  </label>
                  <input
                    type="text"
                    value={offerForm.badgeText}
                    onChange={(e) => setOfferForm({ ...offerForm, badgeText: e.target.value })}
                    placeholder={language === 'ar' ? 'باقة التوفير' : 'Special Offer'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'تاريخ بداية العرض' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'تاريخ نهاية العرض' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={offerForm.endDate}
                    onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                </div>
              </div>

              {/* Bundled / Included Products (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'الذبائح والمنتجات المشمولة في الباقة (اختيار متعدد)' : 'Included Livestock / Products'}
                  </label>
                  <span className="text-[11px] font-bold text-primary-600">
                    {offerForm.selectedProductIds.length > 0
                      ? (language === 'ar' ? `تم تحديد ${offerForm.selectedProductIds.length} منتج` : `${offerForm.selectedProductIds.length} selected`)
                      : (language === 'ar' ? 'عرض عام على جميع المنتجات' : 'All Products')}
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                  {products.map((p) => {
                    const isChecked = offerForm.selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs font-semibold ${
                          isChecked
                            ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOfferForm((prev) => ({
                                  ...prev,
                                  selectedProductIds: [...prev.selectedProductIds, p.id],
                                }));
                              } else {
                                setOfferForm((prev) => ({
                                  ...prev,
                                  selectedProductIds: prev.selectedProductIds.filter((id) => id !== p.id),
                                }));
                              }
                            }}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                          />
                          <span>{p.name}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">{p.price} ر.س</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الوصف التفصيلي للباقة أو شروط العرض' : 'Description & Terms'}
                </label>
                <textarea
                  rows={2}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder={language === 'ar' ? 'محتويات الباقة، مواصفات التجهيز، وشروط الاستفادة...' : 'Package contents, terms and details...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={offerForm.isActive}
                  onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="offerActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'ar' ? 'تفعيل العرض أو الباقة فوراً في المتجر والتطبيق' : 'Active offer in store'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOfferModal({ open: false, data: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{language === 'ar' ? 'حفظ العرض' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Add / Edit Modal */}
      {bannerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-600" />
              <span>
                {bannerModal.data
                  ? (language === 'ar' ? 'تعديل البنر' : 'Edit Banner')
                  : (language === 'ar' ? 'إضافة بنر إعلاني جديد' : 'New Banner')}
              </span>
            </h3>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Banner Image Upload (Requested by User) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'صورة البنر *' : 'Banner Image *'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {bannerForm.image ? (
                      <img src={normalizeImageUrl(bannerForm.image)} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition">
                      <span>{language === 'ar' ? 'اختيار صورة...' : 'Choose image...'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setBannerForm((prev) => ({ ...prev, image: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      {language === 'ar' ? 'صورة عريضة للصفحة الرئيسية للمتجر' : 'Horizontal banner image'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'عنوان البنر *' : 'Banner Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder={language === 'ar' ? 'بنر موسم الذبائح الطازجة' : 'Fresh Season Banner'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'رابط التوجيه (Link / Deep Link)' : 'Click Target URL'}
                </label>
                <input
                  type="text"
                  value={bannerForm.link}
                  onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                  placeholder="/catalog"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'ترتيب العرض (Sequence)' : 'Sequence'}
                </label>
                <input
                  type="number"
                  value={bannerForm.sequence}
                  onChange={(e) => setBannerForm({ ...bannerForm, sequence: parseInt(e.target.value) || 10 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label htmlFor="bannerActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'ar' ? 'إظهار البنر في الصفحة الرئيسية' : 'Active and visible'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBannerModal({ open: false, data: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{language === 'ar' ? 'حفظ البنر' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal (With Auto-Generate, Dates, and Limits - Requested by User) */}
      {couponModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-brand-600" />
              <span>{language === 'ar' ? 'إنشاء كود خصم ترويجي جديد' : 'New Promo Coupon'}</span>
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'اسم الكوبون *' : 'Coupon Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.name}
                  onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                  placeholder={language === 'ar' ? 'خصم عملاء التطبيق' : 'App Customers Discount'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'كود الخصم (Code) *' : 'Coupon Code *'}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCouponCode}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-gold-400 hover:underline cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>{language === 'ar' ? 'توليد كود تلقائياً (Auto-generate)' : 'Auto-Generate'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="JABIN-9ZEL4K28"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'نوع الخصم' : 'Discount Type'}
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  >
                    <option value="percentage">{language === 'ar' ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{language === 'ar' ? 'مبلغ ثابت (ر.س)' : 'Fixed (SAR)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'قيمة الخصم *' : 'Discount Value *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الحد الأدنى للطلب (ر.س)' : 'Min Order (SAR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'أقصى مرات استخدام (Limit)' : 'Usage Limit'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                    placeholder={language === 'ar' ? '0 = غير محدود' : '0 = unlimited'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Start & End Dates for Coupon (Requested by User) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'تاريخ البداية' : 'Valid From'}
                  </label>
                  <input
                    type="date"
                    value={couponForm.startDate}
                    onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'تاريخ الانتهاء' : 'Valid Until'}
                  </label>
                  <input
                    type="date"
                    value={couponForm.endDate}
                    onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label htmlFor="couponActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'ar' ? 'تفعيل الكوبون للعملاء فوراً' : 'Active coupon'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCouponModal({ open: false, data: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{language === 'ar' ? 'حفظ الكوبون' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {language === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف "${deleteDialog.title}"؟`
                : `Are you sure you want to delete "${deleteDialog.title}"?`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteDialog({ open: false, title: '', onConfirm: async () => { } })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteDialog.onConfirm();
                    setDeleteDialog({ open: false, title: '', onConfirm: async () => { } });
                  } catch (err: any) {
                    const errorMsg =
                      err?.response?.data?.errors?.[0]?.message ||
                      err?.response?.data?.message ||
                      err?.message ||
                      (language === 'ar' ? 'فشل الحذف' : 'Delete failed');

                    // If coupon has associated orders in database
                    if (errorMsg.includes('associated with') || errorMsg.includes('order')) {
                      const shouldDisable = window.confirm(
                        language === 'ar'
                          ? `لا يمكن حذف كود الخصم "${deleteDialog.title}" نهائياً لأنه مرتبط بطلبات شراء سابقة في النظام (حفاظاً على سلامة الفواتير والتقارير المالية).\n\nهل ترغب في تعطيل الكود (إيقافه) بدلاً من حذفه حتى لا يتمكن أي عميل من استخدامه مجدداً؟`
                          : `Cannot permanently delete coupon "${deleteDialog.title}" because it is linked to past orders.\n\nWould you like to deactivate it instead?`
                      );
                      if (shouldDisable && deleteDialog.couponId) {
                        try {
                          await adminApi.toggleCouponActive(deleteDialog.couponId);
                          await loadData();
                          setDeleteDialog({ open: false, title: '', onConfirm: async () => { } });
                          return;
                        } catch (toggleErr: any) {
                          alert(toggleErr?.message || 'Failed to deactivate coupon');
                        }
                      }
                    } else {
                      alert(errorMsg);
                    }
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{language === 'ar' ? 'نعم، حذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
