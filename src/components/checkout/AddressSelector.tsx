import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Check } from 'lucide-react';
import { Address } from '../../types/address.types';

export const AddressSelector: React.FC<{
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (id: number) => void;
  onAddNew: () => void;
}> = ({ addresses, selectedAddressId, onSelectAddress, onAddNew }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs md:text-sm font-black text-charcoal-900">
          <MapPin className="w-4 h-4 text-brand-900" />
          <span>{t('select_address', 'عنوان التوصيل')}</span>
        </label>

        <button
          type="button"
          onClick={onAddNew}
          className="text-xs font-black text-brand-900 hover:text-brand-700 flex items-center gap-1 cursor-pointer bg-brand-50 px-3 py-1 rounded-lg border border-brand-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('add_new_address', 'إضافة عنوان')}</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <button
          type="button"
          onClick={onAddNew}
          className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Plus className="w-4 h-4 text-brand-900" />
          <span>إضافة عنوان جديد لتوصيل الذبيحة</span>
        </button>
      ) : (
        <div className="space-y-2.5">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;

            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-brand-50/80 border-brand-800 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isSelected ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-charcoal-900">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-gold-100 text-gold-900 border border-gold-300 px-2 py-0.5 rounded-full font-bold">
                          افتراضي
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-semibold">
                      {addr.fullAddress || `${addr.city}, ${addr.street}`}
                    </p>
                    {addr.recipientName && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        المستلم: {addr.recipientName} ({addr.recipientPhone})
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};