import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { Product } from '../../types/product.types';
import { CartoonProductCard } from './CartoonProductCard';
import { CartoonEmptyState } from '../common/CartoonEmptyState';
import { FilterState } from './FilterSidebar';

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenMobileFilter: () => void;
  filters: FilterState;
  onRemoveFilterTag: (type: keyof FilterState, val?: any) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onOpenMobileFilter,
  filters,
  onRemoveFilterTag,
  onQuickView,
}) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'popular', label: t('sort_popular', 'الأكثر شعبية وطلباً') },
    { value: 'price-asc', label: t('sort_price_low', 'السعر: من الأقل للأعلى') },
    { value: 'price-desc', label: t('sort_price_high', 'السعر: من الأعلى للأقل') },
    { value: 'newest', label: t('sort_newest', 'الأحدث وصولاً') },
  ];

  const hasActiveFilters =
    filters.categoryId !== null ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000 ||
    filters.selectedWeights.length > 0 ||
    filters.selectedCuttingStyles.length > 0 ||
    filters.selectedPackaging.length > 0 ||
    filters.inStockOnly ||
    filters.offersOnly;

  return (
    <div className="space-y-4">
      {/* Top Bar: Count, Sort Dropdown & View Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left: Result Count & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileFilter}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('filter', 'تصفية')} ({products.length})</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            {t('found_products_count', 'تم العثور على')} <b className="text-slate-900 font-mono text-sm">{products.length}</b> {t('sacrifices_and_products', 'ذبيحة ومنتج')}
          </span>
        </div>

        {/* Right: Sort & View Toggle */}
        <div className="flex items-center gap-2">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher (Desktop) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={t('grid_view', 'عرض شبكي')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={t('list_view', 'عرض طولي')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">{t('active_filters', 'الفلاتر النشطة:')}</span>

          {filters.categoryId !== null && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg font-bold">
              <span>{t('category_filter', 'القسم المختار')}</span>
              <X
                onClick={() => onRemoveFilterTag('categoryId')}
                className="w-3.5 h-3.5 hover:text-brand-900 cursor-pointer"
              />
            </span>
          )}

          {filters.offersOnly && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg font-bold">
              <span>{t('offers_only', 'العروض والتخفيضات فقط')}</span>
              <X
                onClick={() => onRemoveFilterTag('offersOnly')}
                className="w-3.5 h-3.5 hover:text-brand-900 cursor-pointer"
              />
            </span>
          )}

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
              <span>{t('in_stock_only', 'المتوفر حالياً')}</span>
              <X
                onClick={() => onRemoveFilterTag('inStockOnly')}
                className="w-3.5 h-3.5 hover:text-emerald-900 cursor-pointer"
              />
            </span>
          )}

          {filters.selectedWeights.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold"
            >
              <span>{w}</span>
              <X
                onClick={() => onRemoveFilterTag('selectedWeights', w)}
                className="w-3.5 h-3.5 hover:text-slate-900 cursor-pointer"
              />
            </span>
          ))}
        </div>
      )}

      {/* Products Render */}
      {products.length === 0 ? (
        <CartoonEmptyState
          title={t('no_products_found', 'لم يتم العثور على ذبائح مطابقة')}
          description={t('no_products_desc', 'جرّب تغيير خيارات التصفية أو البحث عن كلمة أخرى')}
          actionText={t('reset_filters', 'إعادة ضبط الفلاتر')}
          onAction={() => onRemoveFilterTag('categoryId')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <CartoonProductCard
              key={p.id}
              product={p}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <CartoonProductCard
              key={p.id}
              product={p}
              className="flex-row items-center p-3"
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </div>
  );
};
