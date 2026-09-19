import React from 'react';
import { Sparkles } from 'lucide-react';

export const CartoonLoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'جاري تحميل قائمة الذبائح...',
  className = 'py-20',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-900 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-gold-600">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700 animate-pulse">{message}</p>
    </div>
  );
};

export const CartoonSkeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`bg-slate-200/80 rounded-2xl animate-pulse ${className}`} />;
};

export const LoadingState = CartoonLoadingState;
export const Skeleton = CartoonSkeleton;