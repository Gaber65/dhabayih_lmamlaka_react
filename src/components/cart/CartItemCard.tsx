import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Scissors, PackageCheck, Ban } from 'lucide-react';
import { CartLine } from '../../types/cart.types';
import { CartoonPrice } from '../common/CartoonPrice';
import { CartoonQuantitySelector } from '../common/CartoonQuantitySelector';

export const CartItemCard: React.FC<{
  item: CartLine;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}> = ({ item, onUpdateQuantity, onRemove }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-luxury-sm flex flex-col gap-3">
      <div className="flex gap-3.5 items-start">
        {/* Item Image */}
        <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
          {item.productImageUrl ? (
            <img
              src={item.productImageUrl}
              alt={item.productName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/images/onboarding/butchery.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
              ذبيحة
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-sm md:text-base font-black text-charcoal-900 truncate">
              {item.productName}
            </h4>
            <button
              onClick={onRemove}
              title={t('remove')}
              className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Customization Details */}
          <div className="mt-1 space-y-1 text-xs text-slate-500 font-semibold">
            {item.cuttingOption && (
              <div className="flex items-center gap-1.5">
                <Scissors className="w-3 h-3 text-brand-800 flex-shrink-0" />
                <span>التقطيع: {item.cuttingOption.name}</span>
              </div>
            )}
            {item.packagingOptions && item.packagingOptions.length > 0 && (
              <div className="flex items-center gap-1.5">
                <PackageCheck className="w-3 h-3 text-gold-600 flex-shrink-0" />
                <span>التغليف: {item.packagingOptions.map((p) => p.name).join(', ')}</span>
              </div>
            )}
            {item.excludedParts && item.excludedParts.length > 0 && (
              <div className="flex items-center gap-1.5 text-rose-600">
                <Ban className="w-3 h-3 flex-shrink-0" />
                <span>مستبعد: {item.excludedParts.map((p) => p.name).join(', ')}</span>
              </div>
            )}
            {item.notes && (
              <div className="italic text-slate-400 bg-slate-50 px-2 py-0.5 rounded text-[11px]">
                "{item.notes}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quantity and Price Bottom Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <CartoonQuantitySelector
          value={item.quantity}
          onChange={onUpdateQuantity}
          size="sm"
        />

        <CartoonPrice price={item.lineTotal || item.priceUnit * item.quantity} size="md" />
      </div>
    </div>
  );
};