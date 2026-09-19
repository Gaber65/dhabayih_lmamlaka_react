import React from 'react';
import { motion } from 'framer-motion';

export interface CartoonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'cream' | 'brand' | 'gold' | 'glass';
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const CartoonCard: React.FC<CartoonCardProps> = ({
  variant = 'white',
  hoverEffect = false,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    white: 'bg-white border border-slate-200/80 shadow-luxury text-charcoal-900',
    cream: 'bg-slate-50 border border-slate-200 shadow-luxury text-charcoal-900',
    brand: 'bg-brand-50 border border-brand-200 shadow-luxury text-brand-900',
    gold: 'bg-gold-50/80 border border-gold-200 shadow-luxury text-gold-950',
    glass: 'bg-white/90 backdrop-blur-md border border-white/80 shadow-luxury-lg text-charcoal-900',
  }[variant];

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  }[padding];

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : {}}
      className={`rounded-2xl transition-all duration-300 ${variantClasses} ${paddingClasses} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

export const LuxuryCard = CartoonCard;
export const Card = CartoonCard;