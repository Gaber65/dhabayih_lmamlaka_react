import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  MapPin,
  Globe,
  User as UserIcon,
  LogIn,
  PhoneCall,
  ChevronDown,
  Heart,
  Menu,
  Clock,
  LogOut,
  Package,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAddressStore } from '../../store/useAddressStore';
import { useUIStore } from '../../store/useUIStore';
import { SearchAutocomplete } from '../common/SearchAutocomplete';
import { MegaMenu } from './MegaMenu';
import { LocationPickerModal } from '../address/LocationPickerModal';

export const CartoonHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart, openCartDrawer } = useCartStore();
  const { favoriteIds } = useFavoritesStore();
  const { toggleLanguage } = useLanguageStore();
  const { activeAddress, openLocationModal, fetchAddresses } = useAddressStore();
  const { addToast } = useUIStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isRtl = i18n.language === 'ar';
  const cartCount = cart?.lines?.reduce((sum, l) => sum + l.quantity, 0) || 0;
  const cartTotal = cart?.total || cart?.subtotal || 0;
  const favCount = favoriteIds.length;

  const handleOpenLocation = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_for_location', 'يرجى تسجيل الدخول لتحديد عنوان التوصيل وإدارة عناوينك'),
      });
      navigate('/login');
      return;
    }
    openLocationModal();
  };

  const handleOpenFavorites = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_for_favorites', 'يرجى تسجيل الدخول أولاً لعرض المفضلة'),
      });
      navigate('/login');
      return;
    }
    navigate('/favorites');
  };

  const handleOpenCart = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_for_cart', 'يرجى تسجيل الدخول أولاً للوصول إلى سلة المشتريات'),
      });
      navigate('/login');
      return;
    }
    openCartDrawer();
  };

  const handleOpenOrders = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_required_for_orders', 'يرجى تسجيل الدخول لعرض وتتبع طلباتك'),
      });
      navigate('/login');
      return;
    }
    navigate('/orders');
  };


  const navCategories = [
    { label: t('home', 'الرئيسية'), path: '/home' },
    { label: t('all_sacrifices', 'جميع الذبائح'), path: '/categories' },
    { label: t('nuaimi_local', 'نعيمي بلدي'), path: '/categories?cat=1' },
    { label: t('harri_fresh', 'حري طازج'), path: '/categories?cat=2' },
    { label: t('teos_local', 'تيوس بلدية'), path: '/categories?cat=3' },
    { label: t('veal_camel', 'عجل وحاشي'), path: '/categories' },
    { label: t('flash_deals', 'عروض اليوم'), path: '/offers', highlight: true },
    { label: t('favorites', 'المفضلة'), path: '/favorites' },
    { label: t('track_orders', 'تتبع الطلب'), path: '/orders' },
  ];

  return (
    <>
      <LocationPickerModal />

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs transition-all">
        {/* Top Utility Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-200">
                <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
                <span>{t('customer_support_speed', 'خدمة العملاء والطلب السريع:')} <b className="text-white font-mono">920000000</b></span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{t('fast_delivery_riyadh', 'توصيل مبرد طازج يومياً لجميع أحياء الرياض')}</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('halal_certified', 'ذبح حلال 100% بإشراف بيطري')}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <Link to="/offers" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold">
                <Percent className="w-3 h-3" />
                <span>{t('exclusive_offers', 'عروض وخصومات حصرية')}</span>
              </Link>
              <span className="text-slate-600">|</span>
              <button
                onClick={handleOpenOrders}
                className="hover:text-white transition cursor-pointer"
              >
                {t('track_my_order', 'تتبع طلبي')}
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 hover:text-white transition cursor-pointer font-bold"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isRtl ? 'English' : 'العربية'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Marketplace Header */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0"
          >
            <img
              src="/app_logo.png"
              alt="ذبائح المملكة"
              className="w-11 h-11 object-contain drop-shadow-xs"
            />
            <div>
              <div className="text-lg md:text-xl font-black text-brand-600 leading-tight">
                {t('app_name', 'ذبائح المملكة')}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold hidden sm:block">
                {t('app_tagline_short', 'سوق اللحوم والمواشي الطازجة')}
              </div>
            </div>
          </div>

          {/* Delivery Location Selector Modal Trigger */}
          <div
            onClick={handleOpenLocation}
            className="hidden lg:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 cursor-pointer transition flex-shrink-0"
          >
            <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <div className="text-start max-w-[180px]">
              <div className="text-[10px] text-slate-400 font-medium">{t('delivery_location_title', 'موقع التوصيل المبرد')}</div>
              <div className="font-bold text-slate-800 flex items-center gap-1 truncate">
                <span className="truncate">
                  {activeAddress
                    ? `${activeAddress.title} (${activeAddress.street || activeAddress.city})`
                    : t('select_delivery_address', 'اختر عنوان التوصيل')}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
              </div>
            </div>
          </div>


          {/* Live Search Bar with Autocomplete */}
          <div className="flex-1 max-w-xl hidden md:block">
            <SearchAutocomplete />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Mobile Search Icon */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-brand-500 transition cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-brand-500" />
            </button>

            {/* Wishlist / Favorites Button */}
            <button
              onClick={handleOpenFavorites}
              className="relative p-2 md:px-3 md:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title={t('favorites', 'المفضلة')}
            >
              <Heart className={`w-4 h-4 ${favCount > 0 ? 'text-brand-500 fill-brand-500' : 'text-slate-600'}`} />
              <span className="hidden lg:inline">{t('favorites', 'المفضلة')}</span>
              {favCount > 0 && (
                <span className="bg-brand-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {favCount}
                </span>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={handleOpenCart}
              className="relative px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cart', 'السلة')}</span>
              {cartCount > 0 && (
                <span className="bg-white text-brand-600 px-1.5 py-0.2 rounded-full text-[11px] font-black">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden md:inline border-s border-brand-400/50 ps-2 text-[11px] font-mono">
                  {cartTotal.toLocaleString('en-US')} {t('sar', 'ر.س')}
                </span>
              )}
            </button>


            {/* User Account Button with Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 md:px-3 md:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800 hidden md:inline truncate max-w-[100px]">
                      {user?.name || t('my_account', 'حسابي')}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden md:inline" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                      className="absolute end-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 text-xs space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-bold text-slate-900 truncate">{user?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{user?.phone || user?.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('profile', 'الملف الشخصي')}</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('orders', 'طلباتي السابقة')}</span>
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('address_book', 'دفتر العناوين')}</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/home');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold text-start cursor-pointer border-t border-slate-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('logout', 'تسجيل الخروج')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-600" />
                  <span>{t('sign_in', 'دخول')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Category Navigation & MegaMenu Trigger */}
        <div className="border-t border-slate-100 bg-white px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-none py-2 text-xs font-bold text-slate-600">
              {/* MegaMenu Trigger Button */}
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  isMegaMenuOpen ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Menu className="w-3.5 h-3.5" />
                <span>{t('all_categories_btn', 'كافة الأقسام')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {navCategories.map((cat, idx) => {
                const isActive = location.pathname === cat.path;
                return (
                  <Link
                    key={idx}
                    to={cat.path}
                    className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                      cat.highlight
                        ? 'text-brand-600 bg-brand-50 font-black'
                        : isActive
                        ? 'text-brand-600 bg-brand-50 font-black'
                        : 'hover:text-brand-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Quick Delivery Tag */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('same_day_delivery_until_10pm', 'توصيل اليوم متاح حتى 10 مساءً')}</span>
            </div>
          </div>

          {/* MegaMenu Dropdown */}
          <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
        </div>
      </header>
    </>
  );
};

export const Header = CartoonHeader;