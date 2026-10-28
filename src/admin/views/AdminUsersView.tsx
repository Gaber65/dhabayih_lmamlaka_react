import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Shield,
  Coins,
  MessageSquare,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  Eye,
  Send,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Package,
  History,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { adminApi, AdminUser, AdminUserDetail } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';

type UserFilter = 'all' | 'customer' | 'admin' | 'active' | 'inactive';

interface AdminUsersViewProps {
  mode?: 'users' | 'loyalty';
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ mode = 'users' }) => {
  const { language, isRTL } = useLanguageStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<UserFilter>('all');

  // Customer Detail Drawer / Modal
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [detailData, setDetailData] = useState<AdminUserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'loyalty' | 'addresses' | 'orders'>('overview');

  // FCM Notification Wizard Modal
  const [fcmModal, setFcmModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [fcmTitle, setFcmTitle] = useState('');
  const [fcmBody, setFcmBody] = useState('');
  const [fcmType, setFcmType] = useState('admin');
  const [fcmPriority, setFcmPriority] = useState('normal');
  const [fcmDeepLink, setFcmDeepLink] = useState('jabin://offers');
  const [fcmImageUrl, setFcmImageUrl] = useState('');
  const [sendingFcm, setSendingFcm] = useState(false);

  // Loyalty Points Modal
  const [loyaltyModal, setLoyaltyModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [adjustPoints, setAdjustPoints] = useState<number>(100);
  const [adjustOperation, setAdjustOperation] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('تسوية إدارية مباشرة');
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  // Edit / Add User Modal
  const [userModal, setUserModal] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'user' | 'admin'>('user');
  const [formIsActive, setFormIsActive] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.users || []);
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'فشل تحميل بيانات العملاء' : 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;
  const totalPoints = useMemo(() => users.reduce((acc, u) => acc + (u.loyaltyPoints || 0), 0), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterMode === 'customer' && u.role === 'admin') return false;
      if (filterMode === 'admin' && u.role !== 'admin') return false;
      if (filterMode === 'active' && !u.isActive) return false;
      if (filterMode === 'inactive' && u.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = (u.name || '').toLowerCase().includes(q);
        const mPhone = (u.phone || '').toLowerCase().includes(q);
        const mEmail = (u.email || '').toLowerCase().includes(q);
        return mName || mPhone || mEmail;
      }
      return true;
    });
  }, [users, filterMode, searchQuery]);

  // Open Full Customer Detail
  const handleOpenUserDetail = async (user: AdminUser) => {
    setDetailModal({ open: true, user });
    setLoadingDetail(true);
    setDetailData(null);
    setActiveDetailTab('overview');
    try {
      const full = await adminApi.getUserDetail(user.id);
      setDetailData(full);
    } catch (err: any) {
      console.error('Failed to load user detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open FCM Notification Modal
  const handleOpenFcmModal = (user: AdminUser) => {
    setFcmModal({ open: true, user });
    setFcmTitle(language === 'ar' ? 'تنبيه خاص من إدارة ذبائح المملكة' : 'Special Notice from Dhabayih Al-Mamlaka');
    setFcmBody(language === 'ar' ? `مرحباً ${user.name}، يسعدنا تقديم عرض استثنائي على باقات الذبائح الطازجة!` : `Hello ${user.name}, enjoy our premium carcass selection today!`);
    setFcmType('admin');
    setFcmPriority('normal');
    setFcmDeepLink('jabin://offers');
    setFcmImageUrl('');
  };

  // Submit FCM Notification
  const handleSendFcmNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fcmModal.user || !fcmTitle.trim() || !fcmBody.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة عنوان ونص الرسالة' : 'Please provide notification title and message');
      return;
    }
    setSendingFcm(true);
    try {
      await adminApi.sendNotificationToUser({
        user_id: fcmModal.user.id,
        title: fcmTitle.trim(),
        body: fcmBody.trim(),
        type: fcmType,
        priority: fcmPriority,
        deep_link: fcmDeepLink.trim() || undefined,
        image_url: fcmImageUrl.trim() || undefined,
      });
      alert(language === 'ar' ? `تم إرسال إشعار FCM بنجاح إلى ${fcmModal.user.name}` : `FCM notification sent successfully to ${fcmModal.user.name}`);
      setFcmModal({ open: false, user: null });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (language === 'ar' ? 'فشل إرسال الإشعار' : 'Failed to send notification');
      alert(msg);
    } finally {
      setSendingFcm(false);
    }
  };

  // Loyalty Adjust
  const handleOpenLoyaltyModal = (user: AdminUser) => {
    setLoyaltyModal({ open: true, user });
    setAdjustPoints(100);
    setAdjustOperation('add');
    setAdjustReason('تسوية إدارية مباشرة');
  };

  const handleSaveLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltyModal.user) return;
    setSavingLoyalty(true);
    try {
      await adminApi.adjustLoyaltyPoints(loyaltyModal.user.id, {
        points: adjustPoints,
        operation: adjustOperation,
        reason: adjustReason,
      });
      setLoyaltyModal({ open: false, user: null });
      await loadUsers();
      if (detailModal.open && detailModal.user?.id === loyaltyModal.user.id) {
        handleOpenUserDetail(loyaltyModal.user);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to adjust points');
    } finally {
      setSavingLoyalty(false);
    }
  };

  // Add / Edit User
  const handleOpenUserModal = (user?: AdminUser) => {
    if (user) {
      setUserModal({ open: true, user });
      setFormName(user.name);
      setFormPhone(user.phone || '');
      setFormEmail(user.email || '');
      setFormRole(user.role === 'admin' ? 'admin' : 'user');
      setFormIsActive(user.isActive);
    } else {
      setUserModal({ open: true, user: null });
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormRole('user');
      setFormIsActive(true);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const payload = {
        name: formName,
        phone: formPhone,
        email: formEmail,
        role: formRole,
        is_active: formIsActive,
      };

      if (userModal.user) {
        await adminApi.updateUser(userModal.user.id, payload);
      } else {
        await adminApi.createUser(payload);
      }

      setUserModal({ open: false, user: null });
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || 'Failed to save user');
    } finally {
      setSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;
    setIsDeletingUser(true);
    try {
      await adminApi.deleteUser(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === 'loyalty'
              ? language === 'ar'
                ? 'برنامج ومكافآت نقاط الولاء'
                : 'Loyalty Points & Rewards'
              : language === 'ar'
              ? 'قاعدة بيانات العملاء وسجل الحسابات'
              : 'Customer Database & Accounts'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {language === 'ar'
              ? `إجمالي ${totalUsers} حساب مسجل • ${totalPoints.toLocaleString()} نقطة ولاء نشطة`
              : `${totalUsers} accounts • ${totalPoints.toLocaleString()} active loyalty points`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode !== 'loyalty' && (
            <button
              onClick={() => handleOpenUserModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-950/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ar' ? 'إضافة عميل جديد' : 'New Customer'}</span>
            </button>
          )}

          <button
            onClick={loadUsers}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title={language === 'ar' ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي الحسابات' : 'Total Customers'}
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalUsers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'الحسابات النشطة' : 'Active Accounts'}
            </p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeUsers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي نقاط الولاء' : 'Total Loyalty'}
            </p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {totalPoints.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'مدراء النظام' : 'Admins'}
            </p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{adminUsers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث باسم العميل، رقم الجوال، أو البريد...' : 'Search by name, phone, or email...'}
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'customer', 'admin', 'active', 'inactive'] as UserFilter[]).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterMode === m
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {m === 'all' && (language === 'ar' ? 'جميع الحسابات' : 'All')}
              {m === 'customer' && (language === 'ar' ? 'العملاء' : 'Customers')}
              {m === 'admin' && (language === 'ar' ? 'المشرفين' : 'Admins')}
              {m === 'active' && (language === 'ar' ? 'النشطة' : 'Active')}
              {m === 'inactive' && (language === 'ar' ? 'المعطلة' : 'Inactive')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-3 px-4">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الصلاحية' : 'Role'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    <span>{language === 'ar' ? 'جارٍ تحميل الحسابات...' : 'Loading accounts...'}</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <span>{language === 'ar' ? 'لا يوجد حسابات مطابقة للبحث' : 'No customers match the criteria'}</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={(e) => {
                      // Avoid opening detail if an action button was clicked
                      if ((e.target as HTMLElement).closest('button, a')) return;
                      handleOpenUserDetail(u);
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {u.name ? u.name[0]?.toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition flex items-center gap-1.5">
                            <span>{u.name}</span>
                            <Eye size={12} className="opacity-0 group-hover:opacity-60 transition" />
                          </p>
                          <p className="text-[10px] text-slate-400">{u.email || '-'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{u.phone || '-'}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {u.role === 'admin' ? (language === 'ar' ? 'مشرف عام' : 'Admin') : language === 'ar' ? 'عميل' : 'Customer'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLoyaltyModal(u);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 cursor-pointer hover:bg-amber-100 transition"
                        title={language === 'ar' ? 'تعديل رصيد النقاط' : 'Adjust Points'}
                      >
                        <Coins size={13} />
                        <span>{(u.loyaltyPoints || 0).toLocaleString()}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {u.isActive ? (language === 'ar' ? 'نشط' : 'Active') : language === 'ar' ? 'معطل' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* View Details */}
                        <button
                          onClick={() => handleOpenUserDetail(u)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title={language === 'ar' ? 'عرض السجل الكامل والبيانات' : 'View Full Details'}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Send FCM Notification */}
                        <button
                          onClick={() => handleOpenFcmModal(u)}
                          className="p-1.5 rounded-lg border border-purple-200 dark:border-purple-900 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                          title={language === 'ar' ? 'إرسال إشعار FCM فوري' : 'Send FCM Notification'}
                        >
                          <Send size={14} />
                        </button>

                        {/* WhatsApp */}
                        {u.phone && (
                          <a
                            href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                            title="WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title={language === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteDialog({ open: true, user: u })}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title={language === 'ar' ? 'تعطيل / حذف' : 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CUSTOMER FULL DETAIL MODAL (Matching Image 7)                          */}
      {/* ========================================================================= */}
      {detailModal.open && detailModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Top Header with Actions */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {detailModal.user.name ? detailModal.user.name[0]?.toUpperCase() : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {detailModal.user.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        detailModal.user.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {detailModal.user.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {detailModal.user.email || detailModal.user.phone || '-'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Send FCM, Adjust Points */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenFcmModal(detailModal.user!);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm cursor-pointer"
                >
                  <Send size={13} />
                  <span>{language === 'ar' ? 'إرسال إشعار FCM' : 'Send FCM Notification'}</span>
                </button>

                <button
                  onClick={() => handleOpenLoyaltyModal(detailModal.user!)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                >
                  <Coins size={13} />
                  <span>{language === 'ar' ? 'تسوية رصيد النقاط' : 'Adjust Loyalty'}</span>
                </button>

                <button
                  onClick={() => setDetailModal({ open: false, user: null })}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
              <button
                onClick={() => setActiveDetailTab('overview')}
                className={`pb-3 px-2 text-xs font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeDetailTab === 'overview'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'نظرة عامة والبيانات المالية' : 'Overview & Financial Information'}
              </button>

              <button
                onClick={() => setActiveDetailTab('loyalty')}
                className={`pb-3 px-2 text-xs font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeDetailTab === 'loyalty'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'محفظة وسجل الولاء' : 'Loyalty Wallet & History'}
              </button>

              <button
                onClick={() => setActiveDetailTab('addresses')}
                className={`pb-3 px-2 text-xs font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeDetailTab === 'addresses'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? `العناوين (${detailData?.addresses?.length || 0})` : `Addresses (${detailData?.addresses?.length || 0})`}
              </button>

              <button
                onClick={() => setActiveDetailTab('orders')}
                className={`pb-3 px-2 text-xs font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeDetailTab === 'orders'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? `الطلبات (${detailData?.orders?.length || detailData?.total_orders_count || 0})` : `Orders (${detailData?.orders?.length || detailData?.total_orders_count || 0})`}
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetail ? (
                <div className="py-16 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary-600" />
                  <p className="text-xs font-bold">{language === 'ar' ? 'جارٍ تحميل السجل الشامل للعميل...' : 'Loading comprehensive user profile...'}</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & FINANCIAL */}
                  {activeDetailTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Financial Information */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                            <DollarSign size={15} className="text-emerald-600" />
                            <span>{language === 'ar' ? 'البيانات المالية (Financial Information)' : 'Financial Information'}</span>
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'إجمالي الطلبات:' : 'Total Orders:'}</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">{detailData?.total_orders_count ?? 0}</span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'إجمالي الإنفاق:' : 'Total Spending:'}</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400">
                                {(detailData?.total_spending ?? 0).toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'متوسط قيمة الطلب:' : 'Average Order Value:'}</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">
                                {(detailData?.average_order_value ?? 0).toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'إجمالي المرتجعات:' : 'Total Refunds:'}</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">
                                {(detailData?.total_refunds ?? 0).toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                              </span>
                            </div>

                            <div className="col-span-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'طريقة الدفع المفضلة:' : 'Preferred Payment Method:'}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {detailData?.preferred_payment_method || (language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Loyalty Wallet Summary */}
                        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-3.5">
                          <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-amber-200/60 dark:border-amber-800/60 pb-2">
                            <Coins size={15} className="text-amber-600" />
                            <span>{language === 'ar' ? 'محفظة الولاء (Loyalty Wallet)' : 'Loyalty Wallet'}</span>
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'رصيد النقاط الحالي:' : 'Loyalty Points Balance:'}</span>
                              <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                                {(detailData?.loyalty_points ?? detailModal.user.loyaltyPoints ?? 0).toLocaleString()}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'إجمالي المكتسب:' : 'Total Earned Points:'}</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">
                                {(detailData?.total_earned_points ?? 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'إجمالي المستبدل:' : 'Total Redeemed Points:'}</span>
                              <span className="font-black text-slate-800 dark:text-slate-200">
                                {(detailData?.total_redeemed_points ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activity Metrics */}
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                          <Clock size={15} className="text-blue-600" />
                          <span>{language === 'ar' ? 'مؤشرات النشاط (Activity Metrics)' : 'Activity Metrics'}</span>
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'تاريخ التسجيل:' : 'Registration Date:'}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {detailData?.create_date ? detailData.create_date.slice(0, 16) : '-'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'آخر تسجيل دخول:' : 'Last Login:'}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {detailData?.last_login ? detailData.last_login.slice(0, 16) : '-'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'المدفوعات المعلقة:' : 'Pending Payments:'}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{detailData?.pending_payments_count ?? 0}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'المدفوعات المكتملة:' : 'Completed Payments:'}</span>
                            <span className="font-bold text-emerald-600">{detailData?.completed_payments_count ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LOYALTY HISTORY */}
                  {activeDetailTab === 'loyalty' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {language === 'ar' ? 'سجل العمليات وحركات النقاط' : 'Loyalty Points History'}
                        </h4>
                        <span className="text-xs font-black text-amber-600">
                          {language === 'ar' ? `الرصيد: ${(detailData?.loyalty_points ?? 0).toLocaleString()} نقطة` : `Balance: ${(detailData?.loyalty_points ?? 0).toLocaleString()} pts`}
                        </span>
                      </div>

                      {detailData?.loyalty_transactions && detailData.loyalty_transactions.length > 0 ? (
                        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                              <tr>
                                <th className="p-3">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                <th className="p-3">{language === 'ar' ? 'العملية' : 'Type'}</th>
                                <th className="p-3">{language === 'ar' ? 'النقاط' : 'Points'}</th>
                                <th className="p-3">{language === 'ar' ? 'السبب / الوصف' : 'Description'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {detailData.loyalty_transactions.map((tx) => (
                                <tr key={tx.id}>
                                  <td className="p-3 font-mono text-slate-500">{tx.date ? tx.date.slice(0, 10) : '-'}</td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        tx.type === 'earn'
                                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                      }`}
                                    >
                                      {tx.type === 'earn' ? (language === 'ar' ? 'اكتساب (+)' : 'Earn') : (language === 'ar' ? 'خصم (-)' : 'Redeem')}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold font-mono">
                                    {tx.points > 0 ? `+${tx.points}` : tx.points}
                                  </td>
                                  <td className="p-3 text-slate-600 dark:text-slate-300">{tx.description || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                          <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>{language === 'ar' ? 'لا توجد حركات ولاء مسجلة لهذا الحساب' : 'No loyalty transactions found'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ADDRESSES */}
                  {activeDetailTab === 'addresses' && (
                    <div className="space-y-4">
                      {detailData?.addresses && detailData.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {detailData.addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 relative"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  <MapPin size={14} className="text-primary-600" />
                                  <span>{addr.title || (language === 'ar' ? 'عنوان توصيل' : 'Delivery Address')}</span>
                                </span>
                                {addr.is_default && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                                    {language === 'ar' ? 'افتراضي' : 'Default'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                {[addr.street, addr.city, addr.state].filter(Boolean).join(' - ') || (language === 'ar' ? 'العنوان مسجل بدون تفاصيل شارع' : 'No street specified')}
                              </p>
                              {addr.notes && (
                                <p className="text-[11px] text-slate-400 italic">"{addr.notes}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>{language === 'ar' ? 'لا توجد عناوين توصيل مسجلة' : 'No delivery addresses found'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: ORDERS */}
                  {activeDetailTab === 'orders' && (
                    <div className="space-y-4">
                      {detailData?.orders && detailData.orders.length > 0 ? (
                        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                              <tr>
                                <th className="p-3">{language === 'ar' ? 'رقم الطلب' : 'Order Ref'}</th>
                                <th className="p-3">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                <th className="p-3">{language === 'ar' ? 'المبلغ الإجمالي' : 'Total'}</th>
                                <th className="p-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {detailData.orders.map((ord) => (
                                <tr key={ord.id}>
                                  <td className="p-3 font-bold font-mono text-primary-600">{ord.name}</td>
                                  <td className="p-3 font-mono text-slate-500">{ord.date_order ? ord.date_order.slice(0, 10) : '-'}</td>
                                  <td className="p-3 font-black text-slate-800 dark:text-slate-200">
                                    {(ord.amount_total || 0).toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {ord.state || 'pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>{language === 'ar' ? 'لا توجد طلبات سابقة لهذا العميل' : 'No past orders found'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEND FCM NOTIFICATION WIZARD MODAL (Matching Image 8)                  */}
      {/* ========================================================================= */}
      {fcmModal.open && fcmModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-purple-600">
                <Send size={18} />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {language === 'ar' ? 'إرسال إشعار فوري (Send FCM Notification)' : 'Send FCM Notification'}
                </h3>
              </div>
              <button
                onClick={() => setFcmModal({ open: false, user: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendFcmNotification} className="space-y-4">
              {/* Top Details (Recipient & Device Info) */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">{language === 'ar' ? 'المستلم (Recipient User):' : 'Recipient User:'}</span>
                  <span className="font-black text-purple-900 dark:text-purple-200">{fcmModal.user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">{language === 'ar' ? 'الأجهزة النشطة (Active FCM):' : 'Active FCM Devices:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {detailData?.fcm_tokens_count ?? 1} {language === 'ar' ? 'أجهزة مسجلة' : 'devices'}
                  </span>
                </div>
              </div>

              {/* Notification Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'نوع الإشعار (Notification Type) *' : 'Notification Type *'}
                  </label>
                  <select
                    value={fcmType}
                    onChange={(e) => setFcmType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="admin">{language === 'ar' ? 'إشعار إداري (Admin Notification)' : 'Admin Notification'}</option>
                    <option value="offer">{language === 'ar' ? 'عروض ترويجية (Offer)' : 'Promotional Offer'}</option>
                    <option value="order">{language === 'ar' ? 'حالة الطلب (Order)' : 'Order Status'}</option>
                    <option value="system">{language === 'ar' ? 'تنبيه نظام (System)' : 'System Alert'}</option>
                    <option value="loyalty">{language === 'ar' ? 'نقاط الولاء (Loyalty)' : 'Loyalty Points'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الأولوية (Priority) *' : 'Priority *'}
                  </label>
                  <select
                    value={fcmPriority}
                    onChange={(e) => setFcmPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="normal">{language === 'ar' ? 'عادية (Normal)' : 'Normal'}</option>
                    <option value="high">{language === 'ar' ? 'عاجلة وفورية (High)' : 'High'}</option>
                  </select>
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'عنوان الإشعار (Title) *' : 'Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={fcmTitle}
                  onChange={(e) => setFcmTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل عنوان الإشعار...' : 'Notification title...'}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'نص الإشعار (Message / Body) *' : 'Message / Body *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={fcmBody}
                  onChange={(e) => setFcmBody(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب الرسالة التي ستصل للعميل على هاتفه...' : 'Type push notification message here...'}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Routing & Payload */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {language === 'ar' ? 'رابط التوجيه (Deep Link)' : 'Deep Link (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={fcmDeepLink}
                    onChange={(e) => setFcmDeepLink(e.target.value)}
                    placeholder="e.g. jabin://offers"
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {language === 'ar' ? 'رابط صورة الإشعار (Image URL)' : 'Image URL (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={fcmImageUrl}
                    onChange={(e) => setFcmImageUrl(e.target.value)}
                    placeholder="https://example.com/promo.png"
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFcmModal({ open: false, user: null })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={sendingFcm}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sendingFcm ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{language === 'ar' ? 'إرسال الإشعار الآن' : 'Send FCM Notification'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOYALTY ADJUST MODAL                                                   */}
      {/* ========================================================================= */}
      {loyaltyModal.open && loyaltyModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-600">
                <Coins size={18} />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {language === 'ar' ? 'تسوية رصيد نقاط الولاء' : 'Adjust Loyalty Points'}
                </h3>
              </div>
              <button onClick={() => setLoyaltyModal({ open: false, user: null })} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs">
              <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'العميل:' : 'Customer:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{loyaltyModal.user.name}</span>
              <span className="block text-[11px] text-amber-600 font-bold mt-1">
                {language === 'ar' ? `الرصيد الحالي: ${(loyaltyModal.user.loyaltyPoints || 0).toLocaleString()} نقطة` : `Current: ${(loyaltyModal.user.loyaltyPoints || 0).toLocaleString()} pts`}
              </span>
            </div>

            <form onSubmit={handleSaveLoyalty} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'نوع العملية *' : 'Operation *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustOperation('add')}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      adjustOperation === 'add'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {language === 'ar' ? '+ إضافة نقاط' : '+ Add Points'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustOperation('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      adjustOperation === 'deduct'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {language === 'ar' ? '- خصم نقاط' : '- Deduct Points'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'عدد النقاط *' : 'Points Amount *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'سبب التسوية *' : 'Reason *'}
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLoyaltyModal({ open: false, user: null })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingLoyalty}
                  className="px-4 py-1.5 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white cursor-pointer disabled:opacity-50"
                >
                  {savingLoyalty ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'تأكيد التسوية' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EDIT USER MODAL                                                        */}
      {/* ========================================================================= */}
      {userModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              {userModal.user ? (language === 'ar' ? 'تعديل بيانات العميل' : 'Edit User') : (language === 'ar' ? 'إضافة عميل جديد' : 'New User')}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الاسم *' : 'Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserModal({ open: false, user: null })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-1.5 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white cursor-pointer disabled:opacity-50"
                >
                  {savingUser ? '...' : (language === 'ar' ? 'حفظ' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DELETE / DEACTIVATE USER CONFIRMATION                                  */}
      {/* ========================================================================= */}
      {deleteDialog.open && deleteDialog.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-rose-600">{language === 'ar' ? 'تأكيد الحذف / التعطيل' : 'Confirm Deactivation'}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'ar'
                ? `هل أنت متأكد من تعطيل/حذف حساب (${deleteDialog.user.name})؟ سيتم إيقاف صلاحية الدخول وحفظ السجلات السابقة بأمان.`
                : `Are you sure you want to deactivate/delete (${deleteDialog.user.name})? Access will be revoked while preserving order history.`}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={isDeletingUser}
                onClick={() => setDeleteDialog({ open: false, user: null })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                disabled={isDeletingUser}
                onClick={handleDeleteUser}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
