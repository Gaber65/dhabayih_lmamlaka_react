import React, { useEffect, useState } from 'react';
import {
  Wallet,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { adminApi, AdminDashboardStats } from '../api/adminApi';
import { AdminStatCard } from '../components/AdminStatCard';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AdminTab } from '../components/AdminSidebar';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguageStore();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'فشل تحميل بيانات لوحة التحكم من خادم Odoo ERP' : 'Failed to load dashboard stats from Odoo'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'مؤشرات الأداء الرئيسية' : 'Executive Overview'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {isAr ? 'بيانات المبيعات والطلبات والمخزون محدثة لحظياً' : 'Live analytics synchronized with Odoo ERP'}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث البيانات' : 'Refresh Stats'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between text-red-600 dark:text-red-400 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
          >
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title={isAr ? 'إجمالي المبيعات' : 'Total Revenue'}
          value={`${(stats?.monthlySales || 0).toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}`}
          subtitle={`${isAr ? 'مبيعات هذا الشهر' : 'This Month'}: ${(stats?.currentMonthRevenue || 0).toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}`}
          icon={Wallet}
          trend={{ value: 14.8, isPositive: true }}
          colorScheme="primary"
        />

        <AdminStatCard
          title={isAr ? 'إجمالي الطلبات' : 'Total Orders'}
          value={stats?.totalOrders || 0}
          subtitle={`${isAr ? 'طلبات الشهر' : 'This Month'}: ${stats?.currentMonthOrders || 0}`}
          icon={ShoppingBag}
          trend={{ value: 8.2, isPositive: true }}
          colorScheme="blue"
          onClick={() => onNavigateTab('orders')}
        />

        <AdminStatCard
          title={isAr ? 'الذبائح والمنتجات' : 'Livestock & Products'}
          value={stats?.totalProducts || 0}
          subtitle={`${isAr ? 'مخزون منخفض' : 'Low Stock Alert'}: ${stats?.lowStockCount || 0}`}
          icon={Package}
          colorScheme="amber"
          onClick={() => onNavigateTab('products')}
        />

        <AdminStatCard
          title={isAr ? 'العملاء المسجلين' : 'Active Customers'}
          value={stats?.activeCustomers || 0}
          subtitle={isAr ? 'قاعدة عملاء ذبائح المملكة' : 'Registered App Users'}
          icon={Users}
          colorScheme="emerald"
          onClick={() => onNavigateTab('users')}
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'طلبات بانتظار الدفع / جديدة' : 'Pending Payment Orders'}
            </span>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats?.pendingOrdersCount || 0}
              </h4>
              <span className="text-xs text-slate-400">{isAr ? 'طلب' : 'orders'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'قيد الذبح والتجهيز المبرد' : 'Preparing & Dispatching'}
            </span>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {stats?.preparingOrdersCount || 0}
              </h4>
              <span className="text-xs text-slate-400">{isAr ? 'ذبيحة' : 'items'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'طلبات تم تسليمها بنجاح' : 'Delivered Successfully'}
            </span>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats?.deliveredOrdersCount || 0}
              </h4>
              <span className="text-xs text-slate-400">{isAr ? 'طلب' : 'orders'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Access Operational Modules */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'الإجراءات الإدارية المباشرة' : 'Direct Management Shortcuts'}
          </h3>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
            {isAr ? 'لوحة تحكم ذبائح المملكة' : 'Enterprise Admin Console'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('products')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isAr ? 'إدارة الذبائح والأسعار' : 'Manage Products'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? 'تحديث الأسعار والمخزون' : 'Update stock & prices'}
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('categories')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isAr ? 'التقطيع والتغليف والأحجام' : 'Preparation Options'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? '5 خيارات للتجهيز' : 'Cutting, sizes & packing'}
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('branches')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isAr ? 'الفروع والمسالخ' : 'Store Branches'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? 'إدارة نقاط الاستلام' : 'Slaughterhouse hubs'}
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-start transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isAr ? 'الواتساب وإعدادات الولاء' : 'WhatsApp & Settings'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr ? 'رقم الدعم الفني المباشر' : 'Support number & rules'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
