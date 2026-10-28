import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Megaphone,
  Store,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Scissors,
  Box,
  Ban,
  Scale,
  Tag,
  Ticket,
  Image as ImageIcon,
  Bell,
  Coins,
  CreditCard,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'marketing'
  | 'users'
  | 'loyalty'
  | 'branches'
  | 'payments'
  | 'settings'
  // Legacy aliases for backward compatibility
  | 'cutting'
  | 'packaging'
  | 'excluded'
  | 'sizes'
  | 'offers'
  | 'coupons'
  | 'banners'
  | 'notifications';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavGroup {
  groupKeyAr: string;
  groupKeyEn: string;
  items: Array<{
    id: AdminTab;
    labelAr: string;
    labelEn: string;
    icon: React.ElementType;
  }>;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const { language, isRTL } = useLanguageStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAr = language === 'ar';

  // Professional clean groups matching modern ERP & store standards
  const navGroups: NavGroup[] = [
    {
      groupKeyAr: 'المتجر والعمليات',
      groupKeyEn: 'Store & Operations',
      items: [
        {
          id: 'dashboard',
          labelAr: 'نظرة عامة والتحليلات',
          labelEn: 'Overview & KPIs',
          icon: LayoutDashboard,
        },
        {
          id: 'orders',
          labelAr: 'الطلبات ومسار التجهيز',
          labelEn: 'Orders & Dispatch',
          icon: ShoppingBag,
        },
        {
          id: 'products',
          labelAr: 'الذبائح والمنتجات',
          labelEn: 'Products & Livestock',
          icon: Package,
        },
        {
          id: 'categories',
          labelAr: 'أقسام وتجهيزات الذبائح',
          labelEn: 'Livestock Categories & Butchery',
          icon: FolderTree,
        },
      ],
    },
    {
      groupKeyAr: 'التسويق والعملاء',
      groupKeyEn: 'Marketing & Customers',
      items: [
        {
          id: 'marketing',
          labelAr: 'العروض والتسويق',
          labelEn: 'Promotions & Marketing',
          icon: Tag,
        },
        {
          id: 'users',
          labelAr: 'قاعدة بيانات العملاء',
          labelEn: 'Customer Database',
          icon: Users,
        },
        {
          id: 'loyalty',
          labelAr: 'برنامج ونقاط الولاء',
          labelEn: 'Loyalty Program',
          icon: Coins,
        },
      ],
    },
    {
      groupKeyAr: 'المواقع والنظام',
      groupKeyEn: 'Locations & System',
      items: [
        {
          id: 'branches',
          labelAr: 'فروع المتجر والمسالخ',
          labelEn: 'Branches & Hubs',
          icon: Store,
        },
        {
          id: 'payments',
          labelAr: 'طرق وبوابات الدفع',
          labelEn: 'Payment Gateways',
          icon: CreditCard,
        },
        {
          id: 'settings',
          labelAr: 'إعدادات النظام والواجهة',
          labelEn: 'System & Layout Settings',
          icon: Settings,
        },
      ],
    },
  ];

  const isItemActive = (itemId: AdminTab) => {
    if (currentTab === itemId) return true;
    if (itemId === 'categories' && ['cutting', 'packaging', 'excluded', 'sizes'].includes(currentTab)) return true;
    if (itemId === 'marketing' && ['offers', 'coupons', 'banners', 'notifications'].includes(currentTab)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <aside
      className={`fixed top-0 bottom-0 z-30 transition-all duration-200 flex flex-col bg-white dark:bg-slate-900 border-e border-slate-200/90 dark:border-slate-800 ${
        isRTL ? 'right-0' : 'left-0'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="size-11 rounded-2xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center border border-gold-500/30 flex-shrink-0 shadow-md shadow-brand-950/20 overflow-hidden ring-1 ring-gold-400/20">
            <img
              src="/app_logo.png"
              alt="ذبائح المملكة"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-black text-sm text-slate-900 dark:text-slate-100 block">
                {isAr ? 'ذبائح المملكة' : 'Dhabayih Al Mamlaka'}
              </span>
              <span className="text-[10px] text-brand-600 dark:text-gold-400 font-bold uppercase tracking-wider block">
                {isAr ? 'لوحة الإدارة المركزية' : 'Executive Portal'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="size-7 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <ChevronIcon size={14} className={collapsed ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.groupKeyAr} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                {isAr ? group.groupKeyAr : group.groupKeyEn}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? (isAr ? item.labelAr : item.labelEn) : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 via-red-600 to-brand-700 text-white shadow-md shadow-brand-900/35 font-black ring-1 ring-white/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`flex-shrink-0 transition-transform ${isActive ? 'text-gold-300 scale-105' : ''}`} />
                    {!collapsed && <span className="tracking-tight">{isAr ? item.labelAr : item.labelEn}</span>}
                  </div>
                  {!collapsed && isActive && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse shadow-sm shadow-gold-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User profile card & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div
          className={`flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 ${
            collapsed ? 'flex-col gap-2' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="size-8 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-black text-xs flex items-center justify-center flex-shrink-0">
              {user?.name ? user.name[0]?.toUpperCase() : 'A'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {user?.email || 'admin@dhabayih.sa'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isAr ? 'تسجيل الخروج' : 'Logout'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
