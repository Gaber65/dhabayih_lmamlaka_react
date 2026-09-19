import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  reviewsCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 5,
  maxRating = 5,
  reviewsCount,
  size = 'sm',
  showCount = true,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textClasses = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const starSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          if (rating >= starValue) {
            return <Star key={index} className={`${starSize} fill-amber-400 text-amber-400`} />;
          } else if (rating >= starValue - 0.5) {
            return <StarHalf key={index} className={`${starSize} fill-amber-400 text-amber-400`} />;
          } else {
            return <Star key={index} className={`${starSize} text-slate-200 fill-slate-100`} />;
          }
        })}
      </div>

      {showCount && (
        <span className={`${textClasses[size]} font-bold text-slate-600 font-mono`}>
          {rating.toFixed(1)}
          {reviewsCount !== undefined && (
            <span className="text-slate-400 font-normal ms-1">({reviewsCount})</span>
          )}
        </span>
      )}
    </div>
  );
};
