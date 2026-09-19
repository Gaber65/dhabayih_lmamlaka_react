import React from 'react';
import { motion } from 'framer-motion';

export interface CartoonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'white' | 'outline' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const CartoonButton: React.FC<CartoonButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl font-bold gap-1.5',
    md: 'px-5 py-2.5 text-sm md:text-base rounded-2xl font-bold gap-2',
    lg: 'px-7 py-3.5 text-base md:text-lg rounded-2xl font-extrabold gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 hover:from-brand-800 hover:to-brand-600 text-white shadow-luxury-glow hover:shadow-lg border border-brand-700/40',
    gold:
      'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-charcoal-950 shadow-gold-glow hover:shadow-lg border border-gold-400/40',
    white:
      'bg-white hover:bg-slate-50 text-charcoal-900 shadow-luxury-sm hover:shadow-md border border-slate-200/80',
    outline:
      'bg-white/60 hover:bg-brand-50 text-brand-800 shadow-luxury-sm hover:shadow-md border border-brand-300/80',
    ghost:
      'bg-transparent hover:bg-slate-100/70 text-charcoal-800 shadow-none border-none',
    danger:
      'bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white shadow-md border border-rose-500/30',
    dark:
      'bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-luxury hover:shadow-lg border border-charcoal-700',
  }[variant];

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.015, y: disabled || isLoading ? 0 : -1 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98, y: disabled ? 0 : 0 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export const LuxuryButton = CartoonButton;
export const Button = CartoonButton;