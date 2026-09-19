import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scissors, PackageCheck, Ban, FileText, Check } from 'lucide-react';
import { ProductOption } from '../../types/product.types';

export const CuttingOptionSelector: React.FC<{
  options: ProductOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}> = ({ options, selectedId, onSelect }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          <Scissors className="w-3.5 h-3.5" />
        </div>
        <span>{t('cutting_options_title', 'خيارات التقطيع المتاحة')}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const label = isAr ? opt.nameAr || opt.name : opt.nameEn || opt.name;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`p-3.5 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer text-center relative ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 shadow-xs'
              }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 end-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PackagingOptionSelector: React.FC<{
  options: ProductOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}> = ({ options, selectedIds, onToggle }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
          <PackageCheck className="w-3.5 h-3.5" />
        </div>
        <span>{t('packaging_options_title', 'خيارات التغليف والتعبئة')}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedIds.includes(opt.id);
          const label = isAr ? opt.nameAr || opt.name : opt.nameEn || opt.name;

          return (
            <label
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <span className="text-xs md:text-sm font-bold">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export const ExcludedPartsSelector: React.FC<{
  parts: ProductOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}> = ({ parts, selectedIds, onToggle }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  if (!parts || parts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
          <Ban className="w-3.5 h-3.5" />
        </div>
        <span>{t('excluded_parts_title', 'الملحقات المستبعدة (عزل حسب الرغبة)')}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {parts.map((part) => {
          const isSelected = selectedIds.includes(part.id);
          const label = isAr ? part.nameAr || part.name : part.nameEn || part.name;

          return (
            <label
              key={part.id}
              onClick={() => onToggle(part.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export const ProductCustomizationSummary: React.FC<{
  cuttingName?: string;
  packagingNames: string[];
  excludedNames: string[];
  notes?: string;
}> = ({ cuttingName, packagingNames, excludedNames, notes }) => {
  const { t } = useTranslation();

  if (!cuttingName && packagingNames.length === 0 && excludedNames.length === 0 && !notes) {
    return null;
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs md:text-sm">
      <div className="font-black text-slate-900 mb-2 flex items-center gap-1.5">
        <FileText className="w-4 h-4 text-brand-600" />
        <span>{t('customization_summary_title', 'ملخص التجهيز المخصص:')}</span>
      </div>

      {cuttingName && (
        <div className="flex gap-2">
          <span className="text-slate-500 font-semibold">{t('cutting_label', 'التقطيع:')}</span>
          <span className="font-bold text-slate-900">{cuttingName}</span>
        </div>
      )}

      {packagingNames.length > 0 && (
        <div className="flex gap-2">
          <span className="text-slate-500 font-semibold">{t('packaging_label', 'التغليف:')}</span>
          <span className="font-bold text-slate-900">{packagingNames.join('، ')}</span>
        </div>
      )}

      {excludedNames.length > 0 && (
        <div className="flex gap-2">
          <span className="text-slate-500 font-semibold">{t('excluded_label', 'المستبعد:')}</span>
          <span className="font-bold text-rose-700">{excludedNames.join('، ')}</span>
        </div>
      )}

      {notes && (
        <div className="flex gap-2">
          <span className="text-slate-500 font-semibold">{t('notes_label', 'ملاحظات:')}</span>
          <span className="font-bold text-slate-800 italic">{notes}</span>
        </div>
      )}
    </div>
  );
};