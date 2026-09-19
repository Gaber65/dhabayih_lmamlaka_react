import React from 'react';
import { PackageOpen } from 'lucide-react';
import { CartoonButton } from './CartoonButton';

export interface CartoonEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const CartoonEmptyState: React.FC<CartoonEmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 ${className}`}>
      <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-5 shadow-inner">
        {icon || <PackageOpen className="w-10 h-10 text-brand-800" />}
      </div>
      <h3 className="text-xl md:text-2xl font-black text-charcoal-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed font-semibold">
        {description}
      </p>
      {actionText && onAction && (
        <CartoonButton variant="primary" size="md" onClick={onAction}>
          {actionText}
        </CartoonButton>
      )}
    </div>
  );
};

export const EmptyState = CartoonEmptyState;