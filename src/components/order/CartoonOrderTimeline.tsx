import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Scissors, PackageCheck, Truck, Sparkles, Check } from 'lucide-react';
import { OrderTimeline } from '../../types/order.types';

export const CartoonOrderTimeline: React.FC<{
  currentState: string;
  timeline?: OrderTimeline[];
}> = ({ currentState, timeline = [] }) => {
  const { t } = useTranslation();

  const steps = [
    { key: 'pending', label: t('order_status_pending', 'استلام الطلب'), icon: Clock },
    { key: 'confirmed', label: t('order_status_confirmed', 'تأكيد الحجز'), icon: CheckCircle2 },
    { key: 'preparing', label: t('order_status_preparing', 'الذبح والتقطيع'), icon: Scissors },
    { key: 'ready', label: t('order_status_ready', 'التغليف الحراري'), icon: PackageCheck },
    { key: 'out', label: t('order_status_out', 'في طريق التوصيل المبرد'), icon: Truck },
    { key: 'delivered', label: t('order_status_delivered', 'تم التسليم بنجاح'), icon: Sparkles },
  ];

  const stateOrder = ['draft', 'pending', 'confirmed', 'preparing', 'ready', 'out', 'delivered'];
  const currentIndex = Math.max(0, stateOrder.indexOf(currentState.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-luxury space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-900" />
        <h4 className="text-base md:text-lg font-black text-charcoal-900">
          مسار وتتبع تجهيز الذبيحة
        </h4>
      </div>

      {/* Step Roadmap */}
      <div className="relative">
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex - 1 || currentState === 'delivered';
            const isCurrent = idx === currentIndex - 1;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute start-5 top-10 bottom-0 w-0.5 -ms-0.5 rounded-full ${
                      isCompleted ? 'bg-mint-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 z-10 ${
                    isCompleted
                      ? 'bg-mint-600 text-white border-mint-700 shadow-sm'
                      : isCurrent
                      ? 'bg-brand-900 text-white border-brand-950 shadow-luxury-glow'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Step Text Info */}
                <div className="pt-1">
                  <div
                    className={`text-xs md:text-sm font-black ${
                      isCurrent
                        ? 'text-brand-900 font-black'
                        : isCompleted
                        ? 'text-mint-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isCurrent && (
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                      قيد التنفيذ بأيدي قصابين وفريق نقل مبرد معتمد
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const OrderTimelineRoadmap = CartoonOrderTimeline;