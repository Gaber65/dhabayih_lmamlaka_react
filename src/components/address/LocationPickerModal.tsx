import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, X, Check, Plus, Home, Building2, Landmark, Phone, User, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useAddressStore } from '../../store/useAddressStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Address } from '../../types/address.types';

export const LocationPickerModal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    isLocationModalOpen,
    closeLocationModal,
    activeAddress,
    setActiveAddress,
    addresses,
    fetchAddresses,
    addAddress,
    isLoading,
  } = useAddressStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    city: 'الرياض',
    street: '',
    recipient_name: '',
    recipient_phone: '',
    is_default: false,
  });

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (isLocationModalOpen) {
      if (isAuthenticated) {
        fetchAddresses();
      }
      setShowAddForm(false);
    }
  }, [isLocationModalOpen, isAuthenticated]);

  if (!isLocationModalOpen) return null;

  const handleSelectAddress = (addr: Address) => {
    setActiveAddress(addr);
    addToast({
      type: 'success',
      title: t('delivery_address_selected', 'تم تحديد عنوان التوصيل'),
      message: `${addr.title} - ${addr.street || addr.city}`,
    });
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.street.trim()) {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: t('fill_required_fields', 'يرجى إدخال اسم العنوان والشارع/الحي'),
      });
      return;
    }

    try {
      await addAddress(formData);
      addToast({
        type: 'success',
        title: t('address_added_success', 'تم حفظ العنوان بنجاح'),
        message: formData.title,
      });
      setShowAddForm(false);
      setFormData({
        title: '',
        city: 'الرياض',
        street: '',
        recipient_name: '',
        recipient_phone: '',
        is_default: false,
      });
    } catch {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: t('address_save_failed', 'تعذر حفظ العنوان الجديد'),
      });
    }
  };

  const getAddressIcon = (title?: string) => {
    const tLower = (title || '').toLowerCase();
    if (tLower.includes('عمل') || tLower.includes('work') || tLower.includes('office')) {
      return <Building2 className="w-4 h-4 text-brand-600" />;
    }
    if (tLower.includes('استراحة') || tLower.includes('مزرعة') || tLower.includes('farm')) {
      return <Landmark className="w-4 h-4 text-amber-600" />;
    }
    return <Home className="w-4 h-4 text-brand-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={closeLocationModal} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {showAddForm ? t('add_new_address', 'إضافة عنوان توصيل جديد') : t('select_delivery_address', 'اختر عنوان التوصيل')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('delivery_addresses_subtitle', 'توصيل مبرد طازج لباب منزلك أو مكان مناسبتك')}
              </p>
            </div>
          </div>

          <button
            onClick={closeLocationModal}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {showAddForm ? (
          <form onSubmit={handleCreateAddress} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('address_title_label', 'اسم العنوان')} *
                </label>

                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('address_title_placeholder', 'المنزل، الاستراحة، العمل')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('city', 'المدينة')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('street_and_district', 'الحي والشارع')} *
              </label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder={t('street_placeholder_eg', 'حي الملقا، شارع أنس بن مالك')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('recipient_name', 'اسم المستلم')}
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  placeholder={t('full_name', 'الاسم الكامل')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('recipient_phone', 'رقم جوال التواصل')}
                </label>
                <input
                  type="tel"
                  value={formData.recipient_phone}
                  onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-medium outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_def"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
              <label htmlFor="is_def" className="text-xs font-medium text-slate-700 cursor-pointer">
                {t('set_as_default_btn', 'تعيين كعنوان افتراضي')}
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer transition"
              >
                {t('cancel', 'إلغاء')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black cursor-pointer transition shadow-xs"
              >
                {isLoading ? t('saving', 'جاري الحفظ...') : t('save_address_btn', 'حفظ واختيار')}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Real Addresses List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pe-1">
              {addresses.map((addr) => {
                const isSelected = activeAddress?.id === addr.id;

                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50/80 border-brand-500 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-brand-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getAddressIcon(addr.title)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs md:text-sm text-slate-900 truncate">
                            {addr.title}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              {t('default_tag', 'افتراضي')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-0.5 truncate">
                          {addr.street ? `${addr.city} - ${addr.street}` : addr.fullAddress || addr.city}
                        </p>

                        {(addr.recipientName || addr.recipientPhone) && (
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                            {addr.recipientName && <span>{addr.recipientName}</span>}
                            {addr.recipientPhone && <span className="font-mono">{addr.recipientPhone}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ms-2 flex-shrink-0">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-slate-300 bg-white block" />
                      )}
                    </div>
                  </div>
                );
              })}

              {addresses.length === 0 && !isLoading && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    {t('no_saved_addresses_yet', 'لا توجد عناوين محفوظة بعد')}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {t('add_address_prompt', 'أضف عنوانك الأول لتسهيل وصول طلبات الذبائح واللحوم بدقة')}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('add_new_address', 'إضافة عنوان جديد')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeLocationModal();
                  navigate('/addresses');
                }}
                className="py-2 px-3 text-xs text-brand-600 hover:underline font-bold cursor-pointer"
              >
                {t('manage_all_addresses', 'إدارة دفتر العناوين')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
