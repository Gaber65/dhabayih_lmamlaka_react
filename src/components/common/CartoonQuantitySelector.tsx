import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface CartoonQuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CartoonQuantitySelector: React.FC<CartoonQuantitySelectorProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: { btn: 'w-6 h-6 text-xs', num: 'min-w-[22px] text-xs font-bold' },
    md: { btn: 'w-8 h-8 text-sm', num: 'min-w-[28px] text-sm font-black' },
    lg: { btn: 'w-10 h-10 text-base', num: 'min-w-[36px] text-base font-black' },
  }[size];

  return (
    <div
      className={`inline-flex items-center bg-slate-100/90 border border-slate-200/80 rounded-xl p-1 gap-1 shadow-sm ${className}`}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200/60 cursor-pointer transition ${sizeClasses.btn}`}
      >
        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
      </motion.button>

      <span className={`text-center text-charcoal-900 select-none font-sans ${sizeClasses.num}`}>
        {value}
      </span>

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`flex items-center justify-center bg-brand-900 hover:bg-brand-800 disabled:opacity-30 text-white rounded-lg shadow-sm cursor-pointer transition ${sizeClasses.btn}`}
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
};

export const QuantitySelector = CartoonQuantitySelector;