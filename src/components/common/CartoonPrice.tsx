import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CartoonPriceProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CartoonPrice: React.FC<CartoonPriceProps> = ({
  price,
  originalPrice,
  size = 'md',
  className = '',
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: { price: 'text-sm font-bold', unit: 'text-xs font-semibold', orig: 'text-xs' },
    md: { price: 'text-lg font-black', unit: 'text-xs font-bold', orig: 'text-xs' },
    lg: { price: 'text-2xl md:text-3xl font-black', unit: 'text-sm font-bold', orig: 'text-sm' },
    xl: { price: 'text-3xl md:text-4xl font-black', unit: 'text-base font-bold', orig: 'text-base' },
  }[size];

  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`text-brand-900 tracking-tight font-sans ${sizeClasses.price}`}>
        {Number(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </span>
      <span className={`text-gold-700 font-bold ${sizeClasses.unit}`}>
        {t('sar')}
      </span>
      {hasDiscount && (
        <span className={`text-slate-400 line-through font-semibold ms-1.5 ${sizeClasses.orig}`}>
          {Number(originalPrice).toLocaleString('en-US')} {t('sar')}
        </span>
      )}
    </div>
  );
};

export const PriceTag = CartoonPrice;
export const Price = CartoonPrice;