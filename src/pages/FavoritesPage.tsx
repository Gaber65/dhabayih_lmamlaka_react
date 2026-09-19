import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Trash2, Home } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useAuthStore } from '../store/useAuthStore';
import { CartoonProductCard } from '../components/product/CartoonProductCard';
import { CartoonEmptyState } from '../components/common/CartoonEmptyState';

export const FavoritesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { favorites, clearFavorites } = useFavoritesStore();
  const isRtl = i18n.language === 'ar';

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favorites' } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;


  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-[70vh]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition">
          <Home className="w-3.5 h-3.5" />
          <span>{t('home', 'الرئيسية')}</span>
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">{t('favorites_title', 'قائمة المفضلة')}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-brand-500 fill-brand-500" />
            <span>{t('favorites_title', 'قائمة المفضلة')} ({favorites.length})</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('favorites_subtitle', 'الذبائح والمنتجات التي حفظتها للرجوع إليها والطلب السريع')}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('clear_all_favorites', 'مسح المفضلة بالكامل')}</span>
          </button>
        )}
      </div>

      {/* Items Grid or Empty */}
      {favorites.length === 0 ? (
        <CartoonEmptyState
          title={t('no_favorites_title', 'قائمة المفضلة فارغة حالياً')}
          description={t('no_favorites_desc', 'يمكنك تصفح الذبائح والمواشي والضغط على علامة القلب لحفظ خياراتك المفضلة')}
          actionText={t('browse_sacrifices', 'تصفح جميع الذبائح')}
          onAction={() => navigate('/categories')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((prod) => (
            <CartoonProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
