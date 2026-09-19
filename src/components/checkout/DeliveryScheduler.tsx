import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Sun, Sunset, Moon } from 'lucide-react';

export const DeliveryScheduler: React.FC<{
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}> = ({ selectedDate, onSelectDate, selectedSlot, onSelectSlot }) => {
  const { t } = useTranslation();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const slots = [
    { id: 'morning', label: t('morning_slot', 'الفترة الصباحية (8:00 ص - 12:00 م)'), icon: <Sun className="w-4 h-4 text-gold-500" /> },
    { id: 'afternoon', label: t('afternoon_slot', 'فترة بعد الظهر (1:00 م - 5:00 م)'), icon: <Sunset className="w-4 h-4 text-brand-700" /> },
    { id: 'evening', label: t('evening_slot', 'الفترة المسائية (6:00 م - 10:00 م)'), icon: <Moon className="w-4 h-4 text-slate-700" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div>
        <label className="flex items-center gap-2 text-xs md:text-sm font-black text-charcoal-900 mb-2.5">
          <Calendar className="w-4 h-4 text-brand-900" />
          <span>{t('delivery_date', 'موعد الذبح والتوصيل')}</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectDate(todayStr)}
            className={`p-3 rounded-xl border text-xs md:text-sm font-black transition cursor-pointer text-center ${
              selectedDate === todayStr
                ? 'bg-brand-900 text-white border-brand-950 shadow-luxury-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
            }`}
          >
            {t('today', 'اليوم (طازج فوراً)')}
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(tomorrowStr)}
            className={`p-3 rounded-xl border text-xs md:text-sm font-black transition cursor-pointer text-center ${
              selectedDate === tomorrowStr
                ? 'bg-brand-900 text-white border-brand-950 shadow-luxury-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
            }`}
          >
            {t('tomorrow', 'غداً')}
          </button>
        </div>
      </div>

      {/* Time Slot Picker */}
      <div>
        <label className="flex items-center gap-2 text-xs md:text-sm font-black text-charcoal-900 mb-2.5">
          <Clock className="w-4 h-4 text-brand-900" />
          <span>{t('time_slot', 'فترة الاستلام المفضلة')}</span>
        </label>
        <div className="space-y-2">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot(slot.id)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-xs md:text-sm font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50/80 border-brand-800 text-brand-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {slot.icon}
                  <span>{slot.label}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-brand-900 bg-brand-900' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};