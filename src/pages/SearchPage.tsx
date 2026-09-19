import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { catalogApi } from '../api/catalog';
import { Product } from '../types/product.types';
import { CartoonProductCard } from '../components/product/CartoonProductCard';
import { CartoonSkeleton } from '../components/common/CartoonLoadingState';
import { CartoonEmptyState } from '../components/common/CartoonEmptyState';

export const SearchPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isAr = i18n.language === 'ar';

  const popularKeywords = isAr
    ? ['نعيمي', 'حري', 'سواكني', 'عجل بلدي', 'حاشي', 'هرفي', 'تقطيع ثلاجة']
    : ['Naimi', 'Hari', 'Sawkani', 'Veal', 'Camel', 'Harfi', 'Fridge Cut'];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const prods = await catalogApi.getProducts();
        setAllProducts(prods);
        setFilteredProducts(prods);
      } catch {
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts(allProducts);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = allProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const nameAr = (p.nameAr || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || nameAr.includes(q) || desc.includes(q);
    });

    setFilteredProducts(matches);
  }, [query, allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 min-h-[70vh]">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder', 'ابحث عن نعيمي، حري، حاشي، خيارات التقطيع...')}
            className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-2xl py-4 ps-12 pe-4 text-sm md:text-base font-bold text-slate-900 shadow-xs outline-none transition"
          />
          <Search className="w-5 h-5 text-brand-500 absolute start-4 top-4.5" />
        </div>

        {/* Popular Search Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
          <span className="text-slate-400">{t('popular_searches', 'الأكثر بحثاً:')}</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setQuery(kw)}
              className="bg-slate-100 hover:bg-brand-50 hover:text-brand-600 border border-slate-200/80 px-3 py-1 rounded-lg transition cursor-pointer"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <h3 className="text-base md:text-lg font-black text-slate-900">
          {query
            ? `${t('search_results_for', 'نتائج البحث عن')} "${query}"`
            : t('all_available_sacrifices', 'جميع الذبائح المتوفرة')}
        </h3>
        <span className="text-xs font-bold text-slate-500">
          {filteredProducts.length} {t('sacrifices_and_products', 'ذبيحة')}
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
              <CartoonSkeleton className="h-44 w-full" />
              <CartoonSkeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <CartoonEmptyState
          title={t('search_no_results', { query }) || `لم نجد نتائج مطابقة لـ "${query}"`}
          description={t('search_no_results_desc', 'جرب البحث بكلمات أخرى أو تصفح قائمة الذبائح المتاحة.')}
          actionText={t('clear_search_btn', 'مسح البحث')}
          onAction={() => setQuery('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <CartoonProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};