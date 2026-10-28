import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AdminDashboardView } from '../views/AdminDashboardView';
import { AdminProductsView } from '../views/AdminProductsView';
import { AdminCategoriesView } from '../views/AdminCategoriesView';
import { AdminOrdersView } from '../views/AdminOrdersView';
import { AdminMarketingView } from '../views/AdminMarketingView';
import { AdminBranchesView } from '../views/AdminBranchesView';
import { AdminUsersView } from '../views/AdminUsersView';
import { AdminSettingsView } from '../views/AdminSettingsView';
import { AdminPaymentsView } from '../views/AdminPaymentsView';

export const AdminLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { language, isRTL } = useLanguageStore();

  const rawTab = (searchParams.get('tab') as AdminTab) || null;
  const rawSubTab = searchParams.get('subtab') || undefined;

  // Resolve current active tab with fallback to localStorage
  const currentTab: AdminTab = rawTab || (localStorage.getItem('admin_last_tab') as AdminTab) || 'dashboard';

  // Keep localStorage in sync so direct /admin reloads work seamlessly
  useEffect(() => {
    localStorage.setItem('admin_last_tab', currentTab);
  }, [currentTab]);

  const handleSelectTab = (tab: AdminTab, subtab?: string) => {
    localStorage.setItem('admin_last_tab', tab);
    const params: Record<string, string> = { tab };
    if (subtab) params.subtab = subtab;
    setSearchParams(params, { replace: true });
  };

  const handleSelectSubTab = (subtab: string) => {
    const parentTab = ['cutting', 'packaging', 'excluded', 'sizes'].includes(subtab)
      ? 'categories'
      : ['offers', 'coupons', 'banners', 'notifications'].includes(subtab)
      ? 'marketing'
      : currentTab;

    localStorage.setItem('admin_last_tab', parentTab);
    setSearchParams({ tab: parentTab, subtab }, { replace: true });
  };

  const tabTitles: Record<string, { titleAr: string; titleEn: string; subtitleAr: string; subtitleEn: string }> = {
    dashboard: {
      titleAr: 'لوحة التحكم والتحليلات المركزية',
      titleEn: 'Executive Dashboard & Analytics',
      subtitleAr: 'متابعة لحظية لحركة المبيعات، الطلبات، والذبائح المتوفرة',
      subtitleEn: 'Real-time overview of sales, active orders, and livestock inventory',
    },
    orders: {
      titleAr: 'إدارة ومسار تجهيز الطلبات',
      titleEn: 'Orders & Butchery Dispatch',
      subtitleAr: 'متابعة مراحل الذبح، التقطيع، التجهيز المبرد، والتسليم للعميل',
      subtitleEn: 'Track slaughtering, refrigerated packing, and delivery dispatch',
    },
    products: {
      titleAr: 'إدارة المنتجات والذبائح',
      titleEn: 'Products & Livestock Catalog',
      subtitleAr: 'التحكم بالأسعار، المخزون، العروض، وتفاصيل المواصفات والأوزان',
      subtitleEn: 'Manage prices, stock quantities, active discounts, and portion weights',
    },
    categories: {
      titleAr: 'أقسام وتجهيزات الذبائح',
      titleEn: 'Livestock Categories & Butchery Options',
      subtitleAr: 'إدارة أقسام المتجر، طرق التقطيع، أساليب التغليف، المستبعدات، والأحجام',
      subtitleEn: 'Manage store categories, carcass cuts, packaging, excluded parts, and weight sizes',
    },
    marketing: {
      titleAr: 'العروض والحملات التسويقية',
      titleEn: 'Marketing & Promotional Campaigns',
      subtitleAr: 'إدارة العروض الترويجية، البنرات الإعلانية، كوبونات الخصم، وبث الإشعارات',
      subtitleEn: 'Manage product discounts, promo banners, voucher coupons, and push broadcasts',
    },
    cutting: {
      titleAr: 'خيارات وأنماط التقطيع',
      titleEn: 'Cutting Styles & Options',
      subtitleAr: 'تحديد طرق التقطيع المتاحة للعملاء ورسوم التجهيز الإضافية',
      subtitleEn: 'Configure butcher cutting styles and additional preparation fees',
    },
    packaging: {
      titleAr: 'خيارات التغليف والتجهيز',
      titleEn: 'Packaging & Packing Styles',
      subtitleAr: 'إدارة أساليب التغليف (سحب هواء، أطباق فوم، كرتون مبرد)',
      subtitleEn: 'Manage packaging types (vacuum, foam trays, refrigerated carton)',
    },
    excluded: {
      titleAr: 'الأجزاء والمرفقات المستبعدة',
      titleEn: 'Excluded Carcass Parts',
      subtitleAr: 'التحكم بالأجزاء التي يمكن للعميل طلب استبعادها من الذبيحة',
      subtitleEn: 'Manage optional excluded parts (head, viscera, tripe)',
    },
    sizes: {
      titleAr: 'أحجام الذبائح وحصص التوزيع',
      titleEn: 'Carcass Sizes & Portions',
      subtitleAr: 'إدارة أوزان وأحجام الذبائح وحصص البيع (كامل، نصف، ربع)',
      subtitleEn: 'Manage carcass weights, portions, and price tier structures',
    },
    offers: {
      titleAr: 'العروض الترويجية والخصومات',
      titleEn: 'Promotional Offers',
      subtitleAr: 'إدارة عروض الخصم الموسمية على الذبائح والمنتجات',
      subtitleEn: 'Manage limited-time product discounts and promotions',
    },
    coupons: {
      titleAr: 'كوبونات وأكواد الخصم',
      titleEn: 'Promo & Discount Coupons',
      subtitleAr: 'إنشاء ومتابعة أكواد الخصم الترويجية وشروط الاستخدام',
      subtitleEn: 'Create promo voucher codes, usage limits, and minimum orders',
    },
    banners: {
      titleAr: 'البانرات والإعلانات الترويجية',
      titleEn: 'Promotional Banners',
      subtitleAr: 'إدارة لافتات واجهة المتجر وروابط التوجيه المباشرة',
      subtitleEn: 'Manage home slider banners, image uploads, and redirection links',
    },
    notifications: {
      titleAr: 'بث إشعارات FCM الفورية',
      titleEn: 'FCM Push Notifications',
      subtitleAr: 'إرسال حملات إشعارات فورية للأجهزة مع معاينة شاشة القفل',
      subtitleEn: 'Broadcast push notifications to customer devices with lockscreen preview',
    },
    users: {
      titleAr: 'قاعدة بيانات العملاء وسجل الحسابات',
      titleEn: 'Customer Database & Accounts',
      subtitleAr: 'سجل العملاء، إدارة الحسابات، والمتابعة المباشرة',
      subtitleEn: 'Customer records, account statuses, and direct communications',
    },
    loyalty: {
      titleAr: 'برنامج ومكافآت نقاط الولاء',
      titleEn: 'Loyalty Points Program',
      subtitleAr: 'إدارة أرصدة نقاط العملاء، تسوية وإضافة/خصم النقاط يدوياً',
      subtitleEn: 'Manage customer loyalty balances, reward tiers, and manual adjustments',
    },
    branches: {
      titleAr: 'فروع المتجر والمسالخ المعتمدة',
      titleEn: 'Store Branches & Slaughterhouses',
      subtitleAr: 'إدارة مواقع الفروع، المسالخ، العناوين وأرقام التواصل المباشر',
      subtitleEn: 'Manage physical branches, local slaughterhouse hubs, and contacts',
    },
    payments: {
      titleAr: 'طرق الدفع وبوابات المعاملات',
      titleEn: 'Payment Gateways & Transactions',
      subtitleAr: 'إدارة بوابات ميسر وماي فاتورة، مدى، أبل باي، والدفع عند الاستلام',
      subtitleEn: 'Configure Moyasar, MyFatoorah, Mada, Apple Pay & Cash on Delivery',
    },
    settings: {
      titleAr: 'إعدادات النظام والواجهة',
      titleEn: 'Store & Layout Settings',
      subtitleAr: 'التحكم برقم الواتساب الافتراضي، هاتف الدعم، وقواعد اكتساب واستبدال النقاط',
      subtitleEn: 'Configure official WhatsApp support number, phone, and loyalty rules',
    },
  };

  const currentMeta = tabTitles[currentTab] || tabTitles.dashboard;
  const title = language === 'ar' ? currentMeta.titleAr : currentMeta.titleEn;
  const subtitle = language === 'ar' ? currentMeta.subtitleAr : currentMeta.subtitleEn;

  const isCategoriesActive =
    currentTab === 'categories' || ['cutting', 'packaging', 'excluded', 'sizes'].includes(currentTab);
  const categoriesInitialSubTab =
    rawSubTab || (['cutting', 'packaging', 'excluded', 'sizes'].includes(currentTab) ? currentTab : 'categories');

  const isMarketingActive =
    currentTab === 'marketing' || ['offers', 'coupons', 'banners', 'notifications'].includes(currentTab);
  const marketingInitialSubTab =
    rawSubTab || (['offers', 'coupons', 'banners', 'notifications'].includes(currentTab) ? currentTab : 'offers');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isRTL
            ? sidebarCollapsed ? 'mr-20' : 'mr-64'
            : sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <AdminHeader title={title} subtitle={subtitle} />

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto ${currentTab === 'orders' ? 'max-w-[1700px]' : 'max-w-7xl'}`}>
          {currentTab === 'dashboard' && <AdminDashboardView onNavigateTab={handleSelectTab} />}
          {currentTab === 'orders' && <AdminOrdersView />}
          {currentTab === 'products' && <AdminProductsView />}
          
          {/* Unified Category & Butchery Options View */}
          {isCategoriesActive && (
            <AdminCategoriesView
              initialTab={categoriesInitialSubTab as any}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onNavigateSubTab={handleSelectSubTab}
            />
          )}

          {/* Unified Marketing View */}
          {isMarketingActive && (
            <AdminMarketingView
              initialTab={marketingInitialSubTab as any}
              onNavigateSubTab={handleSelectSubTab}
            />
          )}

          {/* Users & Loyalty */}
          {currentTab === 'users' && <AdminUsersView mode="users" />}
          {currentTab === 'loyalty' && <AdminUsersView mode="loyalty" />}

          {/* Locations, Payments & Settings */}
          {currentTab === 'branches' && <AdminBranchesView />}
          {currentTab === 'payments' && <AdminPaymentsView />}
          {currentTab === 'settings' && <AdminSettingsView />}
        </main>
      </div>
    </div>
  );
};
