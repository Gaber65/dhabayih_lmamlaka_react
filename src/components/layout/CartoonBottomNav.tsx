import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Grid, Search, Clock, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const CartoonBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: t('home'), path: '/home', icon: Home },
    { label: t('categories'), path: '/categories', icon: Grid },
    { label: t('search_placeholder', 'بحث'), path: '/search', icon: Search },
    { label: t('orders'), path: '/orders', icon: Clock },
    { label: t('profile'), path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-luxury-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-brand-900 font-black'
                  : 'text-slate-400 font-bold hover:text-slate-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-900 shadow-sm' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const BottomNav = CartoonBottomNav;