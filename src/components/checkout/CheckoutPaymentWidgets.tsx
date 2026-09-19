import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Check, X, CreditCard, Banknote, ShieldCheck, Coins } from 'lucide-react';
import { CartoonButton } from '../common/CartoonButton';
import { PaymentMethod } from '../../types/order.types';

export const CouponInput: React.FC<{
  onApply: (code: string) => Promise<void>;
  onRemove: () => Promise<void>;
  appliedCode?: string;
}> = ({ onApply, onRemove, appliedCode }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      await onApply(code.trim());
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-luxury-sm">
      <label className="flex items-center gap-2 text-xs md:text-sm font-black text-charcoal-900 mb-2">
        <Tag className="w-4 h-4 text-gold-600" />
        <span>{t('coupon_code', 'كود الخصم أو القسيمة')}</span>
      </label>

      {appliedCode ? (
        <div className="flex items-center justify-between bg-mint-50 border border-mint-300 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-mint-700" />
            <span className="font-black text-xs md:text-sm text-mint-900">{appliedCode}</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            {t('remove', 'إلغاء')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="مثال: DHABAYIH2026"
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-brand-800 rounded-xl px-4 py-2 text-xs md:text-sm font-bold text-charcoal-900 outline-none uppercase transition"
          />
          <CartoonButton type="submit" variant="gold" size="sm" isLoading={loading}>
            {t('apply', 'تطبيق')}
          </CartoonButton>
        </form>
      )}
    </div>
  );
};

export const LoyaltyPointsRedeemer: React.FC<{
  availablePoints: number;
  isRedeemed: boolean;
  onToggleRedeem: (redeem: boolean) => void;
}> = ({ availablePoints, isRedeemed, onToggleRedeem }) => {
  const { t } = useTranslation();

  if (availablePoints <= 0) return null;

  const estimatedSar = (availablePoints / 10).toFixed(0);

  return (
    <div className="bg-gold-50/60 border border-gold-300/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-luxury-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center flex-shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs md:text-sm font-black text-charcoal-900">{t('loyalty_points', 'نقاط الولاء')}</div>
          <div className="text-[11px] text-gold-800 font-bold">
            {t('available_points', { points: availablePoints })} (~{estimatedSar} {t('sar')})
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggleRedeem(!isRedeemed)}
        className={`px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
          isRedeemed
            ? 'bg-gold-500 text-charcoal-950 border-gold-600 shadow-sm'
            : 'bg-white text-gold-900 border-gold-300 hover:bg-gold-100'
        }`}
      >
        {isRedeemed ? 'تم تفعيل الخصم' : t('redeem_points_btn', 'استخدام النقاط')}
      </button>
    </div>
  );
};

export const PaymentMethodPicker: React.FC<{
  methods: PaymentMethod[];
  selectedMethodId: number | null;
  onSelectMethod: (id: number) => void;
}> = ({ methods, selectedMethodId, onSelectMethod }) => {
  const { t } = useTranslation();

  if (methods.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        جاري تحميل خيارات الدفع المتاحة...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs md:text-sm font-black text-slate-900">
        <CreditCard className="w-4 h-4 text-brand-900" />
        <span>{t('payment_method', 'طريقة الدفع')}</span>
      </label>

      <div className="space-y-2.5">
        {methods.map((pm: PaymentMethod) => {
          const isSelected = selectedMethodId === pm.id;

          return (
            <div
              key={pm.id}
              onClick={() => onSelectMethod(pm.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-brand-50/80 border-brand-800 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isSelected ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {pm.code === 'cod' ? (
                    <Banknote className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs md:text-sm text-slate-900">{pm.name}</div>
                  {pm.description && (
                    <div className="text-[11px] text-slate-500 font-medium">{pm.description}</div>
                  )}
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};