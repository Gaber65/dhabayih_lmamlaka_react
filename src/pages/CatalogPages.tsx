import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { catalogApi } from '../api/catalog';
import { Category, Product } from '../types/product.types';
import { FilterSidebar, FilterState } from '../components/product/FilterSidebar';
import { ProductGrid, SortOption } from '../components/product/ProductGrid';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { CartoonSkeleton } from '../components/common/CartoonLoadingState';

const normalizeArabic = (text: string) =>
  (text || '')
    .toLowerCase()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .trim();

const matchWeight = (p: Product, selectedWeights: string[]): boolean => {
  if (selectedWeights.length === 0) return true;
  const numWeight = parseFloat(p.weight || '0');
  const text = normalizeArabic(`${p.name || ''} ${p.description || ''} ${p.weight || ''}`);

  return selectedWeights.some((w) => {
    if (w.includes('8 - 10')) {
      if (numWeight >= 7.5 && numWeight <= 10.5) return true;
      if (text.includes('لباني') || text.includes('صغير')) return true;
    }
    if (w.includes('11 - 14')) {
      if (numWeight >= 10.6 && numWeight <= 14.5) return true;
      if (text.includes('جذع') || text.includes('وسط')) return true;
    }
    if (w.includes('15 - 18')) {
      if (numWeight >= 14.6 && numWeight <= 18.5) return true;
      if (text.includes('ثني') || text.includes('كبير')) return true;
    }
    if (w.includes('20+')) {
      if (numWeight >= 18.6) return true;
      if (text.includes('ولائم') || text.includes('عزائم') || text.includes('كامل')) return true;
    }
    return false;
  });
};

const matchCutting = (p: Product, selectedCuts: string[]): boolean => {
  if (selectedCuts.length === 0) return true;
  const cuts = (p.cuttingOptions || [])
    .map((c: any) => (typeof c === 'string' ? c : c.name || c.nameAr || ''))
    .join(' ');
  const combined = normalizeArabic(`${p.name || ''} ${p.description || ''} ${cuts}`);

  return selectedCuts.some((cut) => {
    if (cut.includes('ثلاجة')) {
      return combined.includes('ثلاجة');
    }
    if (cut.includes('مفصل')) {
      return combined.includes('مفصل') || combined.includes('مفطح');
    }
    if (cut.includes('أنصاف')) {
      return combined.includes('أنصاف') || combined.includes('نصف');
    }
    if (cut.includes('أرباع')) {
      return combined.includes('أرباع') || combined.includes('ربع');
    }
    if (cut.includes('كبسة') || cut.includes('شواء')) {
      return combined.includes('كبسة') || combined.includes('شواء') || combined.includes('مندي');
    }
    return false;
  });
};

const matchPackaging = (p: Product, selectedPkgs: string[]): boolean => {
  if (selectedPkgs.length === 0) return true;
  const pkgs = (p.packagingOptions || [])
    .map((pkg: any) => (typeof pkg === 'string' ? pkg : pkg.name || pkg.nameAr || ''))
    .join(' ');
  const combined = normalizeArabic(`${p.name || ''} ${p.description || ''} ${pkgs}`);

  return selectedPkgs.some((pkg) => {
    if (pkg.includes('سحب هواء') || pkg.includes('مفرغ')) {
      return combined.includes('سحب هواء') || combined.includes('مفرغ') || combined.includes('فكيوم');
    }
    if (pkg.includes('نايلون') || pkg.includes('أكياس') || pkg.includes('تفريز')) {
      return combined.includes('أكياس') || combined.includes('نايلون') || combined.includes('تفريز');
    }
    if (pkg.includes('فلين') || pkg.includes('فوم') || pkg.includes('أطباق')) {
      return combined.includes('أطباق') || combined.includes('فلين') || combined.includes('فوم') || combined.includes('صحون');
    }
    if (pkg.includes('كرتون') || pkg.includes('مبرد')) {
      return combined.includes('كرتون') || combined.includes('مبرد') || combined.includes('حراري');
    }
    return false;
  });
};

export const CategoriesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAr = i18n.language === 'ar';
  const isRtl = isAr;

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    categoryId: searchParams.get('cat') ? Number(searchParams.get('cat')) || null : null,
    searchQuery: searchParams.get('q') || searchParams.get('search') || '',
    minPrice: 0,
    maxPrice: 5000,
    selectedWeights: [],
    selectedCuttingStyles: [],
    selectedPackaging: [],
    inStockOnly: false,
    offersOnly: searchParams.get('offer') === 'true',
  });

  useEffect(() => {
    const fetchInit = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts(),
        ]);
        setCategories(cats);
        setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  // Sync category & search params
  useEffect(() => {
    const catParam = searchParams.get('cat');
    const qParam = searchParams.get('q') || searchParams.get('search') || '';
    const offerParam = searchParams.get('offer') === 'true';
    setFilters((prev) => ({
      ...prev,
      categoryId: catParam ? Number(catParam) || null : null,
      searchQuery: qParam,
      offersOnly: offerParam,
    }));
  }, [searchParams]);

  const activeCategory = categories.find((c) => c.id === filters.categoryId);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search Query Filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const qRaw = filters.searchQuery.trim();
      if (qRaw.includes('عجل وحاشي') || qRaw === 'عجل وحاشي') {
        result = result.filter((p) => {
          const text = normalizeArabic(`${p.name || ''} ${p.nameAr || ''} ${p.description || ''} ${p.categoryName || ''}`);
          return ['عجل', 'حاشي', 'بقر'].some((t) => text.includes(normalizeArabic(t)));
        });
      } else {
        const words = qRaw.split(/\s+/).filter((w) => w.length > 1 && !['و', 'مع', 'في', 'من'].includes(w));
        result = result.filter((p) => {
          const text = normalizeArabic(`${p.name || ''} ${p.nameAr || ''} ${p.description || ''} ${p.categoryName || ''}`);
          return words.every((word) => text.includes(normalizeArabic(word)));
        });
      }
    }

    // Category Filter
    if (filters.categoryId !== null) {
      const selectedCat = categories.find((c) => c.id === filters.categoryId);
      result = result.filter((p) => {
        if (p.categoryId !== undefined && p.categoryId === filters.categoryId) return true;
        if (selectedCat && p.categoryName && (
          p.categoryName === selectedCat.name ||
          p.categoryName === selectedCat.nameAr ||
          selectedCat.name?.includes(p.categoryName) ||
          p.categoryName?.includes(selectedCat.name)
        )) return true;
        return false;
      });
    }

    // Offers Filter
    if (filters.offersOnly) {
      result = result.filter((p) => p.isOnOffer || p.isOffer);
    }

    // In Stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.isAvailable !== false);
    }

    // Price Filter
    if (filters.minPrice > 0 || filters.maxPrice < 5000) {
      result = result.filter((p) => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    }

    // Weight filter
    if (filters.selectedWeights.length > 0) {
      result = result.filter((p) => matchWeight(p, filters.selectedWeights));
    }

    // Cutting Styles filter
    if (filters.selectedCuttingStyles.length > 0) {
      result = result.filter((p) => matchCutting(p, filters.selectedCuttingStyles));
    }

    // Packaging Options filter
    if (filters.selectedPackaging.length > 0) {
      result = result.filter((p) => matchPackaging(p, filters.selectedPackaging));
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [allProducts, filters, sortBy, categories]);

  const handleResetFilters = () => {
    setFilters({
      categoryId: null,
      searchQuery: '',
      minPrice: 0,
      maxPrice: 5000,
      selectedWeights: [],
      selectedCuttingStyles: [],
      selectedPackaging: [],
      inStockOnly: false,
      offersOnly: false,
    });
    setSearchParams({});
  };

  const handleRemoveFilterTag = (type: keyof FilterState, val?: any) => {
    if (type === 'categoryId') {
      setFilters((prev) => ({ ...prev, categoryId: null }));
      const next = new URLSearchParams(searchParams);
      next.delete('cat');
      setSearchParams(next);
    } else if (type === 'searchQuery') {
      setFilters((prev) => ({ ...prev, searchQuery: '' }));
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      next.delete('search');
      setSearchParams(next);
    } else if (type === 'offersOnly') {
      setFilters((prev) => ({ ...prev, offersOnly: false }));
      const next = new URLSearchParams(searchParams);
      next.delete('offer');
      setSearchParams(next);
    } else if (type === 'inStockOnly') {
      setFilters((prev) => ({ ...prev, inStockOnly: false }));
    } else if (type === 'selectedWeights' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedWeights: prev.selectedWeights.filter((w) => w !== val),
      }));
    } else if (type === 'selectedCuttingStyles' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedCuttingStyles: prev.selectedCuttingStyles.filter((c) => c !== val),
      }));
    } else if (type === 'selectedPackaging' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedPackaging: prev.selectedPackaging.filter((p) => p !== val),
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home', 'الرئيسية')}</span>
        </Link>
        <span>/</span>
        <Link to="/categories" onClick={handleResetFilters} className="hover:text-brand-600 transition">
          {t('all_sacrifices_and_livestock', 'جميع الذبائح والمواشي')}
        </Link>
        {activeCategory ? (
          <>
            <span>/</span>
            <span className="font-bold text-slate-900">
              {isAr ? activeCategory.nameAr || activeCategory.name : activeCategory.nameEn || activeCategory.name}
            </span>
          </>
        ) : filters.searchQuery ? (
          <>
            <span>/</span>
            <span className="font-bold text-slate-900">
              {filters.searchQuery}
            </span>
          </>
        ) : null}
      </div>

      {/* Category Banner Card */}
      <div
        style={{ backgroundColor: '#380004' }}
        className="bg-gradient-to-r from-[#2b0003] via-[#5c0b11] to-[#1c0002] border border-red-900/40 text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-start">
          <h1 className="text-xl md:text-3xl font-black text-white">
            {activeCategory
              ? (isAr ? activeCategory.nameAr || activeCategory.name : activeCategory.nameEn || activeCategory.name)
              : filters.searchQuery
              ? `${t('search_results_for', 'نتائج تصفية')}: "${filters.searchQuery}"`
              : t('fresh_livestock_marketplace', 'سوق الذبائح والمواشي الطازجة')}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            {activeCategory?.description ||
              t('catalog_banner_desc', 'اختر من أجود أنواع الأغنام والمواشي البلدية والمستوردة مع خيارات التقطيع والتغليف المفرغ والتوصيل المبرد لباب منزلك.')}
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, categoryId: null, searchQuery: '' }));
              setSearchParams({});
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filters.categoryId === null && !filters.searchQuery
                ? 'bg-white text-brand-900 shadow'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {t('all', 'عرض الكل')}
          </button>
          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            const name = isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, categoryId: cat.id, searchQuery: '' }));
                  setSearchParams({ cat: String(cat.id) });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-brand-900 shadow'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main PLP 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filter Sidebar (3 Cols) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-28">
          <FilterSidebar
            categories={categories}
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Sliding Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="absolute inset-y-0 start-0 max-w-xs w-full bg-white shadow-2xl p-4 overflow-y-auto">
              <FilterSidebar
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
                isMobileDrawer={true}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid & Sorting (9 Cols) */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-slate-200 space-y-3">
                  <CartoonSkeleton className="h-40 w-full rounded-xl" />
                  <CartoonSkeleton className="h-4 w-3/4" />
                  <CartoonSkeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
              filters={filters}
              onRemoveFilterTag={handleRemoveFilterTag}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          )}
        </div>
      </div>
    </div>
  );
};