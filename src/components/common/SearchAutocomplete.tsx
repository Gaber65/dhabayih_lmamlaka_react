import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, TrendingUp, Clock, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Product } from '../../types/product.types';
import { catalogApi } from '../../api/catalog';

const POPULAR_SEARCHES = [
  'خروف نعيمي بلدي',
  'خروف حري طازج',
  'تيس عارضي بلدي',
  'عجل بلدي مفروم',
  'حاشي لباني',
  'بوكس الشواء المشكل',
  'تقطيع ثلاجة سحب هواء',
];

export const SearchAutocomplete: React.FC<{
  className?: string;
  placeholder?: string;
}> = ({ className = '', placeholder }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dhabayih_recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live search results with debounce
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await catalogApi.searchProducts(query);
        setProducts(results.slice(0, 5));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    // Save to recents
    const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('dhabayih_recent_searches', JSON.stringify(updated));
    } catch {}

    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const removeRecent = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem('dhabayih_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(query);
        }}
        className="relative w-full"
      >
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder || t('search_placeholder', 'ابحث عن نوع الذبيحة، نعيمي، حري، تقطيع ثلاجة...')}
          className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-brand-900 rounded-xl py-2.5 ps-10 pe-10 text-xs md:text-sm font-medium text-slate-800 outline-none transition shadow-inner"
        />

        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setProducts([]);
            }}
            className="absolute end-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full start-0 end-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs">
          {/* 1. Live Matching Products Preview */}
          {query.trim() && (
            <div className="p-3 border-b border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>نتائج البحث المباشرة عن "{query}"</span>
                {loading && <span className="animate-pulse text-brand-900">جاري البحث...</span>}
              </div>

              {products.length > 0 ? (
                <div className="space-y-1.5">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/product/${prod.id}`);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '/images/onboarding/butchery.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {prod.nameAr || prod.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {prod.weight ? `الوزن: ${prod.weight}` : 'طازج ذبح اليوم'}
                        </div>
                      </div>
                      <div className="font-bold text-brand-900 font-mono flex-shrink-0">
                        {prod.price.toLocaleString('en-US')} ر.س
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleSearchSubmit(query)}
                    className="w-full mt-2 py-2 bg-slate-50 hover:bg-brand-50 text-brand-900 font-bold text-center rounded-xl flex items-center justify-center gap-1 transition"
                  >
                    <span>عرض كافة النتائج ({products.length})</span>
                    {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : !loading ? (
                <div className="py-4 text-center text-slate-400">
                  لا توجد نتائج مطابقة، اضغط Enter للبحث الشامل
                </div>
              ) : null}
            </div>
          )}

          {/* 2. Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>عمليات البحث الأخيرة</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchSubmit(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition"
                  >
                    <span>{item}</span>
                    <button
                      onClick={(e) => removeRecent(e, item)}
                      className="text-slate-400 hover:text-rose-600 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Popular Marketplace Searches */}
          {!query && (
            <div className="p-3">
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>الكلمات الأكثر بحثاً اليوم</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-900 border border-slate-200/80 text-slate-700 font-medium transition cursor-pointer"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
