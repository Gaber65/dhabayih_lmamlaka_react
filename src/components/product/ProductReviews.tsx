import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, CheckCircle2, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';
import { ProductReview } from '../../types/review.types';
import { useUIStore } from '../../store/useUIStore';

export const ProductReviews: React.FC<{ productName: string }> = ({ productName }) => {
  const { addToast } = useUIStore();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      addToast({
        type: 'error',
        title: 'تنبيه',
        message: 'يرجى كتابة الاسم والتعليق لإرسال التقييم',
      });
      return;
    }

    setIsSubmitting(true);
    const added: ProductReview = {
      id: 'r_' + Date.now(),
      authorName: newAuthor.trim(),
      city: 'الرياض',
      rating: newRating,
      date: 'اليوم',
      comment: newComment.trim(),
      verifiedPurchase: true,
      likesCount: 0,
    };

    setReviews([added, ...reviews]);
    setNewAuthor('');
    setNewComment('');
    setIsSubmitting(false);

    addToast({
      type: 'success',
      title: 'شكراً لتقييمك',
      message: 'تم إضافة تقييمك بنجاح',
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews List or Empty State */}
      {reviews.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-2">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">لا توجد تقييمات بعد</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            كن أول من يشارك تجربته مع {productName} بعد استلام الذبيحة!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-900 font-bold text-xs flex items-center justify-center">
                    {rev.authorName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{rev.authorName}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مشتري موثق</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{rev.city}</div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
              </div>

              <RatingStars rating={rev.rating} size="xs" showCount={false} />

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}


      {/* Write a Review Form */}
      <form onSubmit={handleSubmitReview} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-brand-900" />
          <span>أضف تقييمك وتجربتك لـ {productName}</span>
        </h4>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold">تقييمك:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setNewRating(s)}
                className="p-1 cursor-pointer"
              >
                <Star
                  className={`w-5 h-5 ${
                    s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder="اسمك الكريم"
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-brand-900"
          />
        </div>

        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="اكتب تفاصيل تجربتك مع الذبيحة، التقطيع، التغليف وسرعة التوصيل..."
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none resize-none focus:border-brand-900"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>إرسال التقييم</span>
        </button>
      </form>
    </div>
  );
};
