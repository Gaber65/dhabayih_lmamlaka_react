import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { addressApi } from '../api/address';
import { Address } from '../types/address.types';
import { CartoonModal } from '../components/common/CartoonModal';
import { CartoonLoadingState } from '../components/common/CartoonLoadingState';
import { CartoonEmptyState } from '../components/common/CartoonEmptyState';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const AddressesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const isRtl = i18n.language === 'ar';

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState(t('home_label', 'المنزل'));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(t('riyadh_city', 'الرياض'));
  const [street, setStreet] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressApi.getAddresses();
      setAddresses(res);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/addresses' } });
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleCreate = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!street.trim()) return;

    try {
      await addressApi.createAddress({
        title,
        recipient_name: name,
        recipient_phone: phone,
        city,
        street,
        latitude: 24.7136,
        longitude: 46.6753,
        is_default: addresses.length === 0,
      });

      addToast({
        type: 'success',
        title: t('address_title', 'العنوان'),
        message: t('address_saved', 'تم حفظ العنوان بنجاح'),
      });
      setIsModalOpen(false);
      fetchAddresses();
    } catch {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: t('address_save_failed', 'تعذر إضافة العنوان'),
      });
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressApi.setDefaultAddress(id);
      addToast({
        type: 'success',
        title: t('default_address_title', 'العنوان الافتراضي'),
        message: t('default_address_success', 'تم تعيين العنوان كافتراضي بنجاح'),
      });
      fetchAddresses();
    } catch {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('delete_address_confirm', 'هل أنت متأكد من حذف هذا العنوان؟'))) return;
    try {
      await addressApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      addToast({
        type: 'success',
        title: t('delete', 'حذف'),
        message: t('address_deleted_success', 'تم حذف العنوان بنجاح'),
      });
    } catch {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  if (loading) {
    return <CartoonLoadingState message={t('loading_addresses', 'جاري استرجاع العناوين المحفوظة...')} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              {t('address_book', 'دفتر العناوين')}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {t('my_addresses', 'عناويني المحفوظة')}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
            {t('address_book_subtitle', 'إدارة عناوين التوصيل السريع للمنازل والمناسبات')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black transition shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_new_address', 'إضافة عنوان جديد')}</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <CartoonEmptyState
          title={t('no_addresses_title', 'لم تقم بإضافة أي عنوان بعد')}
          description={t('no_addresses_desc', 'أضف عنوان منزلك أو موقع المناسبة لتسهيل سرعة التوصيل المبرد.')}
          actionText={t('add_new_address', 'إضافة عنوان جديد')}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                addr.isDefault
                  ? 'bg-brand-50/60 border-brand-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      addr.isDefault ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900">{addr.title}</h4>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-brand-100 text-brand-700 border border-brand-300 font-black px-2 py-0.5 rounded-full">
                          {t('default_tag', 'افتراضي')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                      {addr.fullAddress || `${addr.city}، ${addr.street}`}
                    </p>
                    {addr.recipientName && (
                      <p className="text-[11px] text-slate-400 mt-1 font-bold">
                        {t('recipient_label', 'المستلم:')} {addr.recipientName} ({addr.recipientPhone})
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                  title={t('delete', 'حذف')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-black text-brand-600 hover:text-brand-700 text-start pt-2 border-t border-slate-100 cursor-pointer"
                >
                  {t('set_as_default_btn', 'تعيين كعنوان افتراضي')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <CartoonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('add_new_address', 'إضافة عنوان جديد')}
        subtitle={t('enter_address_details_prompt', 'أدخل تفاصيل العنوان الجديد بدقة')}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              {t('address_title', 'اسم العنوان')}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('address_title_placeholder', 'مثال: المنزل، الاستراحة، العمل')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {t('recipient_name', 'اسم المستلم')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {t('recipient_phone', 'رقم الجوال')}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {t('city', 'المدينة')}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {t('street', 'الحي والشارع')}
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder={t('street_placeholder_eg', 'حي الملقا، شارع أنس بن مالك')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs transition cursor-pointer shadow-xs active:scale-95"
          >
            {t('save_address', 'حفظ العنوان')}
          </button>
        </form>
      </CartoonModal>
    </div>
  );
};