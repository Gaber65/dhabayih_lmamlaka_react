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

  // Sync category param
  useEffect(() => {
    const catParam = searchParams.get('cat');
    const offerParam = searchParams.get('offer') === 'true';
    setFilters((prev) => ({
      ...prev,
      categoryId: catParam ? Number(catParam) || null : null,
      offersOnly: offerParam,
    }));
  }, [searchParams]);

  const activeCategory = categories.find((c) => c.id === filters.categoryId);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

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
      result = result.filter((p) => p.weight && filters.selectedWeights.some((w) => p.weight!.includes(w)));
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
      setSearchParams({});
    } else if (type === 'offersOnly') {
      setFilters((prev) => ({ ...prev, offersOnly: false }));
    } else if (type === 'inStockOnly') {
      setFilters((prev) => ({ ...prev, inStockOnly: false }));
    } else if (type === 'selectedWeights' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedWeights: prev.selectedWeights.filter((w) => w !== val),
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
        {activeCategory && (
          <>
            <span>/</span>
            <span className="font-bold text-slate-900">
              {isAr ? activeCategory.nameAr || activeCategory.name : activeCategory.nameEn || activeCategory.name}
            </span>
          </>
        )}
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
              setFilters((prev) => ({ ...prev, categoryId: null }));
              setSearchParams({});
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filters.categoryId === null
                ? 'bg-white text-brand-900 shadow'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {t('all', 'الكل')}
          </button>
          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            const name = isAr ? cat.nameAr || cat.name : cat.nameEn || cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, categoryId: cat.id }));
                  setSearchParams({ cat: String(cat.id) });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-brand-900 shadow'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                )}
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