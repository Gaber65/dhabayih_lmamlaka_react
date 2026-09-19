import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, RotateCcw, Check } from 'lucide-react';
import { Category } from '../../types/product.types';

export interface FilterState {
  categoryId: number | null;
  minPrice: number;
  maxPrice: number;
  selectedWeights: string[];
  selectedCuttingStyles: string[];
  selectedPackaging: string[];
  inStockOnly: boolean;
  offersOnly: boolean;
}

interface FilterSidebarProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

const WEIGHT_OPTIONS = [
  '8 - 10 كجم (صغير/لباني)',
  '11 - 14 كجم (وسط/جذع)',
  '15 - 18 كجم (كبير/ثني)',
  '20+ كجم (ولائم وعزائم)',
];

const CUTTING_STYLES = [
  'تقطيع ثلاجة (قطع صغيرة)',
  'تقطيع مفصل (أرباع وأعضاء كاملة)',
  'تقطيع أنصاف (نصفين بالطول)',
  'تقطيع أرباع (4 قطع رئيسية)',
  'تفصيل كبسة وشواء مخصص',
];

const PACKAGING_OPTIONS = [
  'تغليف سحب هواء مفرغ (أعلى جودة)',
  'أكياس نايلون سميكة ومقسمة',
  'أطباق وصحون فلين مجهزة',
  'كرتون مبرد محكم الإغلاق',
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
  className = '',
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const handleCategorySelect = (catId: number | null) => {
    onFilterChange({ ...filters, categoryId: catId });
  };

  const handleWeightToggle = (w: string) => {
    const exists = filters.selectedWeights.includes(w);
    const updated = exists
      ? filters.selectedWeights.filter((item) => item !== w)
      : [...filters.selectedWeights, w];
    onFilterChange({ ...filters, selectedWeights: updated });
  };

  const handleCuttingToggle = (c: string) => {
    const exists = filters.selectedCuttingStyles.includes(c);
    const updated = exists
      ? filters.selectedCuttingStyles.filter((item) => item !== c)
      : [...filters.selectedCuttingStyles, c];
    onFilterChange({ ...filters, selectedCuttingStyles: updated });
  };

  const handlePackagingToggle = (p: string) => {
    const exists = filters.selectedPackaging.includes(p);
    const updated = exists
      ? filters.selectedPackaging.filter((item) => item !== p)
      : [...filters.selectedPackaging, p];
    onFilterChange({ ...filters, selectedPackaging: updated });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-900" />
          <h3 className="text-sm font-black text-slate-900">تصفية النتائج</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-brand-900 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة ضبط</span>
          </button>

          {isMobileDrawer && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black text-slate-800">الأقسام والتشكيلات</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
          <label
            onClick={() => handleCategorySelect(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition ${
              filters.categoryId === null
                ? 'bg-brand-50 text-brand-900 font-bold'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span>جميع الذبائح والمواشي</span>
            {filters.categoryId === null && <Check className="w-3.5 h-3.5" />}
          </label>

          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            const name = isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name;

            return (
              <label
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition ${
                  isSelected
                    ? 'bg-brand-50 text-brand-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{name}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-black text-slate-800">نطاق السعر (ر.س)</h4>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block mb-1">من</span>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ ...filters, minPrice: Number(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 text-center outline-none focus:border-brand-900"
              placeholder="0"
            />
          </div>
          <span className="text-slate-300 mt-4">-</span>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block mb-1">إلى</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) || 5000 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 text-center outline-none focus:border-brand-900"
              placeholder="5000"
            />
          </div>
        </div>
      </div>

      {/* 3. Weight Options */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-black text-slate-800">الوزن والعمر التقريبي</h4>
        <div className="space-y-1.5">
          {WEIGHT_OPTIONS.map((w, idx) => {
            const isChecked = filters.selectedWeights.includes(w);
            return (
              <label
                key={idx}
                onClick={() => handleWeightToggle(w)}
                className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 accent-brand-900 rounded"
                />
                <span>{w}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Cutting Styles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-black text-slate-800">طريقة التقطيع المتاحة</h4>
        <div className="space-y-1.5">
          {CUTTING_STYLES.map((c, idx) => {
            const isChecked = filters.selectedCuttingStyles.includes(c);
            return (
              <label
                key={idx}
                onClick={() => handleCuttingToggle(c)}
                className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 accent-brand-900 rounded"
                />
                <span>{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Packaging Styles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-black text-slate-800">خيارات التغليف</h4>
        <div className="space-y-1.5">
          {PACKAGING_OPTIONS.map((p, idx) => {
            const isChecked = filters.selectedPackaging.includes(p);
            return (
              <label
                key={idx}
                onClick={() => handlePackagingToggle(p)}
                className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 accent-brand-900 rounded"
                />
                <span>{p}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. Quick Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label
          onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className="flex items-center justify-between text-xs text-slate-700 font-bold cursor-pointer select-none"
        >
          <span>المتوفر للطلب الفوري فقط</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={() => {}}
            className="w-4 h-4 accent-brand-900 rounded"
          />
        </label>

        <label
          onClick={() => onFilterChange({ ...filters, offersOnly: !filters.offersOnly })}
          className="flex items-center justify-between text-xs text-rose-700 font-bold cursor-pointer select-none"
        >
          <span>عروض التخفيض والخصومات</span>
          <input
            type="checkbox"
            checked={filters.offersOnly}
            onChange={() => {}}
            className="w-4 h-4 accent-rose-600 rounded"
          />
        </label>
      </div>
    </div>
  );
};
