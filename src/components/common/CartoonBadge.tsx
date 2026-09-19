import React from 'react';

export interface CartoonBadgeProps {
  variant?: 'brand' | 'gold' | 'mint' | 'charcoal' | 'outline' | 'offer';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CartoonBadge: React.FC<CartoonBadgeProps> = ({
  variant = 'brand',
  size = 'md',
  icon,
  children,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] font-bold',
    md: 'px-3 py-1 text-xs font-extrabold',
  }[size];

  const variantClasses = {
    brand: 'bg-brand-50 text-brand-800 border border-brand-200/80 shadow-sm',
    gold: 'bg-gold-50 text-gold-900 border border-gold-300/80 shadow-sm',
    mint: 'bg-mint-50 text-mint-700 border border-mint-200/80 shadow-sm',
    charcoal: 'bg-charcoal-900 text-white shadow-sm border border-charcoal-700',
    outline: 'bg-white text-slate-700 border border-slate-200 shadow-sm',
    offer: 'bg-gradient-to-r from-brand-900 via-brand-800 to-rose-700 text-white font-extrabold shadow-luxury-sm',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export const LuxuryBadge = CartoonBadge;
export const Badge = CartoonBadge;