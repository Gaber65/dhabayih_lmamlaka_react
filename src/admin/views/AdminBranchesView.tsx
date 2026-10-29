import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Building2,
  Phone,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Navigation,
  Globe,
  X
} from 'lucide-react';
import { adminApi, Branch } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useUIStore } from '../../store/useUIStore';

export const AdminBranchesView: React.FC = () => {
  const { language, isRTL } = useLanguageStore();
  const { addToast } = useUIStore();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formOpeningHours, setFormOpeningHours] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLat, setFormLat] = useState<number | undefined>(undefined);
  const [formLng, setFormLng] = useState<number | undefined>(undefined);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBranches();
      setBranches(res.branches || []);
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'فشل تحميل بيانات الفروع' : 'Failed to load branches'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const totalCount = branches.length;
  const activeCount = branches.filter((b) => b.isActive).length;
  const distinctCities = useMemo(() => Array.from(new Set(branches.map((b) => b.city).filter(Boolean))), [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (statusFilter === 'active' && !b.isActive) return false;
      if (statusFilter === 'inactive' && b.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = b.name.toLowerCase().includes(q);
        const mCity = b.city.toLowerCase().includes(q);
        const mAddress = b.address.toLowerCase().includes(q);
        const mCode = (b.code || '').toLowerCase().includes(q);
        const mPhone = (b.phone || '').toLowerCase().includes(q);
        return mName || mCity || mAddress || mCode || mPhone;
      }
      return true;
    });
  }, [branches, statusFilter, searchQuery]);

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setSelectedBranch(branch);
      setFormName(branch.name);
      setFormCity(branch.city);
      setFormAddress(branch.address);
      setFormPhone(branch.phone || '');
      setFormCode(branch.code || '');
      setFormOpeningHours(branch.openingHours || '');
      setFormIsActive(branch.isActive);
      setFormLat(branch.latitude);
      setFormLng(branch.longitude);
    } else {
      setSelectedBranch(null);
      setFormName('');
      setFormCity('الرياض');
      setFormAddress('');
      setFormPhone('');
      setFormCode(`BR-${branches.length + 1}`);
      setFormOpeningHours('08:00 AM - 11:00 PM');
      setFormIsActive(true);
      setFormLat(undefined);
      setFormLng(undefined);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم الفرع أو المسلخ' : 'Please provide branch name');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formName.trim(),
        city: (formCity || 'الرياض').trim(),
        address: (formAddress || formName).trim(),
        phone: formPhone.trim(),
        code: formCode.trim(),
        opening_hours: formOpeningHours.trim() || '08:00 AM - 11:00 PM',
        active: formIsActive,
        is_active: formIsActive,
      };
      if (formLat !== undefined) payload.latitude = formLat;
      if (formLng !== undefined) payload.longitude = formLng;

      if (selectedBranch) {
        await adminApi.updateBranch(selectedBranch.id, payload);
        addToast({
          type: 'success',
          message: language === 'ar' ? 'تم تحديث بيانات الفرع بنجاح' : 'Branch updated successfully',
        });
      } else {
        await adminApi.createBranch(payload);
        addToast({
          type: 'success',
          message: language === 'ar' ? 'تمت إضافة الفرع بنجاح' : 'Branch added successfully',
        });
      }

      setModalOpen(false);
      await loadBranches();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || err?.message || (language === 'ar' ? 'فشل حفظ الفرع' : 'Failed to save branch');
      addToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.branch) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteBranch(deleteDialog.branch.id);
      addToast({
        type: 'success',
        message: language === 'ar' ? 'تم حذف الفرع بنجاح' : 'Branch deleted successfully',
      });
      setDeleteDialog({ open: false, branch: null });
      await loadBranches();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || err?.message || (language === 'ar' ? 'فشل حذف الفرع' : 'Failed to delete branch');
      addToast({ type: 'error', message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {language === 'ar' ? 'فروع المتجر ومسالخ التجهيز' : 'Branches & Slaughterhouses'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {language === 'ar'
              ? `إجمالي ${totalCount} فرع ومسلخ معتمد في ${distinctCities.length} مدن`
              : `${totalCount} branches & slaughterhouses in ${distinctCities.length} cities`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-950/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>{language === 'ar' ? 'إضافة فرع أو مسلخ' : 'Add Branch'}</span>
          </button>

          <button
            onClick={loadBranches}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer shrink-0"
            title={language === 'ar' ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي الفروع' : 'Total Locations'}
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalCount}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'الفروع النشطة' : 'Active Branches'}
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'المدن المغطاة' : 'Cities Covered'}
            </p>
            <p className="text-lg sm:text-xl font-black text-primary-600 dark:text-primary-400 mt-1">{distinctCities.length}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'التوزيع اللوجستي' : 'Logistics Reach'}
            </p>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 mt-2 font-mono">100% On-time</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 ltr:left-3 rtl:right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث بالاسم، المدينة، العنوان، أو كود الفرع...' : 'Search by name, city, address, code...'}
            className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'active', labelAr: 'نشطة', labelEn: 'Active' },
            { id: 'inactive', labelAr: 'معطلة', labelEn: 'Inactive' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? pill.labelAr : pill.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs font-bold text-slate-400">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-primary-600" />
            <span>{language === 'ar' ? 'جارٍ تحميل قائمة الفروع والمسالخ...' : 'Loading branches...'}</span>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-bold text-slate-400">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <span>{language === 'ar' ? 'لا توجد فروع تطابق معايير البحث' : 'No branches match search'}</span>
          </div>
        ) : (
          filteredBranches.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary-500/30 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{b.name}</h3>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{b.code || `BR-${b.id}`}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      b.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {b.isActive ? (language === 'ar' ? 'نشط' : 'Active') : language === 'ar' ? 'معطل' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="font-bold">{b.city}</span> • <span>{b.address || '-'}</span>
                  </div>

                  {b.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a href={`tel:${b.phone}`} className="font-mono hover:underline min-h-[36px] inline-flex items-center">
                        {b.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenModal(b)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title={language === 'ar' ? 'تعديل' : 'Edit'}
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => setDeleteDialog({ open: true, branch: b })}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Branch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {selectedBranch ? (language === 'ar' ? 'تعديل بيانات الفرع / المسلخ' : 'Edit Branch') : (language === 'ar' ? 'إضافة فرع / مسلخ جديد' : 'New Branch')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'اسم الفرع أو المسلخ *' : 'Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: مسلخ الرياض المركزي' : 'e.g. Riyadh Slaughterhouse'}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="الرياض"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'هاتف التواصل' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'العنوان التفصيلي' : 'Address'}
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder={language === 'ar' ? 'حي المروة، طريق ديراب' : 'District, Street'}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'كود الفرع' : 'Branch Code'}
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="BR-01"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'ساعات العمل' : 'Opening Hours'}
                  </label>
                  <input
                    type="text"
                    value={formOpeningHours}
                    onChange={(e) => setFormOpeningHours(e.target.value)}
                    placeholder="08:00 AM - 11:00 PM"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'خط العرض (Latitude)' : 'Latitude'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLat ?? ''}
                    onChange={(e) => setFormLat(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="24.7136"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'خط الطول (Longitude)' : 'Longitude'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLng ?? ''}
                    onChange={(e) => setFormLng(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="46.6753"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 min-h-[44px]">
                <input
                  type="checkbox"
                  id="bActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label htmlFor="bActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'ar' ? 'الفرع نشط ويستقبل طلبات التجهيز' : 'Active & receiving orders'}
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-center"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-primary-600 hover:bg-primary-700 text-white shadow-xs cursor-pointer disabled:opacity-50 transition text-center"
                >
                  {saving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الفرع' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.open && deleteDialog.branch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            <h3 className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'ar'
                ? `هل أنت متأكد من حذف فرع (${deleteDialog.branch.name})؟`
                : `Are you sure you want to delete (${deleteDialog.branch.name})?`}
            </p>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeleteDialog({ open: false, branch: null })}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-center"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 transition text-center"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
