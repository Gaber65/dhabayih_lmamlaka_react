import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, CheckCircle2, Quote, ThumbsUp } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';
import { ProductReview } from '../../types/review.types';

export const CustomerReviewsSection: React.FC<{ reviews?: ProductReview[] }> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-0.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>تجارب حقيقية موثقة</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              تقييمات وتجارب العملاء
            </h3>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 relative"
            >
              <Quote className="w-8 h-8 text-slate-100 absolute top-4 end-4 pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <RatingStars rating={rev.rating} size="sm" showCount={false} />
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <span>{rev.authorName}</span>
                    {rev.verifiedPurchase && (
                      <span title="مشتري موثق">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    )}
                  </div>

                  {rev.city && <div className="text-[11px] text-slate-400">{rev.city}</div>}
                </div>

                {rev.date && <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

