import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Scissors,
  Package,
  Ban,
  Scale,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ImageIcon,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { adminApi, AdminOptionEntity, AdminSizeEntity, Category, Product } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AdminTab } from '../components/AdminSidebar';

type CategoryTab = 'categories' | 'cutting' | 'packaging' | 'excluded' | 'sizes';

interface AdminCategoriesViewProps {
  initialTab?: CategoryTab;
  onNavigateTab?: (tab: AdminTab) => void;
  onNavigateSubTab?: (subtab: string) => void;
}

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({
  initialTab = 'categories',
  onNavigateTab,
  onNavigateSubTab,
}) => {
  const { language, isRTL } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<CategoryTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tabId: CategoryTab) => {
    setActiveTab(tabId);
    if (onNavigateSubTab) {
      onNavigateSubTab(tabId);
    } else if (onNavigateTab) {
      onNavigateTab(tabId as AdminTab);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'with_fee' | 'free'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cuttingOptions, setCuttingOptions] = useState<AdminOptionEntity[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<AdminOptionEntity[]>([]);
  const [excludedParts, setExcludedParts] = useState<AdminOptionEntity[]>([]);
  const [sizes, setSizes] = useState<AdminSizeEntity[]>([]);

  // Modals state
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; data: Category | null }>({ open: false, data: null });
  const [catModalTab, setCatModalTab] = useState<'info' | 'products'>('info');
  const [optionModal, setOptionModal] = useState<{ open: boolean; type: 'cutting' | 'packaging' | 'excluded'; data: AdminOptionEntity | null }>({
    open: false,
    type: 'cutting',
    data: null
  });
  const [sizeModal, setSizeModal] = useState<{ open: boolean; data: AdminSizeEntity | null }>({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; title: string; onConfirm: () => Promise<void> }>({
    open: false,
    title: '',
    onConfirm: async () => { }
  });

  // Form states
  const [catForm, setCatForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    image: '',
    sequence: 10,
    active: true,
  });
  const [newCatImageBase64, setNewCatImageBase64] = useState<string | null>(null);
  const [optForm, setOptForm] = useState({ name: '', description: '', extraPrice: 0, isActive: true });
  const [sizeForm, setSizeForm] = useState({ name: '', subTitle: '', price: 0, calories: 0, productId: 0, isDefault: false });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        adminApi.getCategories(),
        adminApi.getProducts(),
        adminApi.getCuttingOptions(),
        adminApi.getPackagings(),
        adminApi.getExcludedParts(),
        adminApi.getSizes(),
      ]);

      if (results[0].status === 'fulfilled') setCategories(results[0].value.categories || []);
      if (results[1].status === 'fulfilled') setProducts(results[1].value.products || []);
      if (results[2].status === 'fulfilled') setCuttingOptions(results[2].value.cuttingOptions || []);
      if (results[3].status === 'fulfilled') setPackagingOptions(results[3].value.packagings || []);
      if (results[4].status === 'fulfilled') setExcludedParts(results[4].value.excludedParts || []);
      if (results[5].status === 'fulfilled') setSizes(results[5].value.sizes || []);
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'فشل تحميل بيانات التصنيفات والخيارات' : 'Failed to load categories & options'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Category counts
  const catCount = Array.isArray(categories) ? categories.length : 0;
  const cutCount = Array.isArray(cuttingOptions) ? cuttingOptions.length : 0;
  const packCount = Array.isArray(packagingOptions) ? packagingOptions.length : 0;
  const exclCount = Array.isArray(excludedParts) ? excludedParts.length : 0;
  const sizeCount = Array.isArray(sizes) ? sizes.length : 0;

  // Filtered lists
  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const filterOptionList = (list: AdminOptionEntity[]) => {
    if (!Array.isArray(list)) return [];
    return list.filter(o => {
      const matchSearch = o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (filterMode === 'active') return o.isActive;
      if (filterMode === 'with_fee') return o.extraPrice > 0;
      if (filterMode === 'free') return o.extraPrice === 0;
      return true;
    });
  };

  const filteredCuts = useMemo(() => filterOptionList(cuttingOptions), [cuttingOptions, searchQuery, filterMode]);
  const filteredPacks = useMemo(() => filterOptionList(packagingOptions), [packagingOptions, searchQuery, filterMode]);
  const filteredExcls = useMemo(() => filterOptionList(excludedParts), [excludedParts, searchQuery, filterMode]);

  const filteredSizes = useMemo(() => {
    if (!Array.isArray(sizes)) return [];
    return sizes.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.subTitle && s.subTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [sizes, searchQuery]);

  // Handlers
  const handleOpenCatModal = (cat?: Category) => {
    setCatModalTab('info');
    setNewCatImageBase64(null);
    if (cat) {
      setCatForm({
        name: cat.name || '',
        nameEn: (cat as any).name_en || (cat as any).nameEn || '',
        description: cat.description || '',
        descriptionEn: (cat as any).description_en || (cat as any).descriptionEn || '',
        image: cat.image || '',
        sequence: cat.sequence ?? 10,
        active: (cat as any).active !== false,
      });
      setCategoryModal({ open: true, data: cat });
    } else {
      setCatForm({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        image: '',
        sequence: 10,
        active: true,
      });
      setCategoryModal({ open: true, data: null });
    }
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    setSaving(true);
    try {
      // Send only fields valid in Odoo's jabin.category model
      const payload: any = {
        name: catForm.name.trim(),
        sequence: catForm.sequence,
        active: catForm.active,
      };
      if (catForm.description && catForm.description.trim()) {
        payload.description = catForm.description.trim();
      }
      // ONLY send image if user uploaded a new image (clean raw base64)
      if (newCatImageBase64) {
        payload.image = newCatImageBase64;
      }

      if (categoryModal.data) {
        await adminApi.updateCategory(categoryModal.data.id, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      setCategoryModal({ open: false, data: null });
      setNewCatImageBase64(null);
      await loadAll();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (language === 'ar' ? 'فشل حفظ القسم' : 'Failed to save category');
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenOptModal = (type: 'cutting' | 'packaging' | 'excluded', opt?: AdminOptionEntity) => {
    if (opt) {
      setOptForm({ name: opt.name, description: opt.description || '', extraPrice: opt.extraPrice, isActive: opt.isActive });
      setOptionModal({ open: true, type, data: opt });
    } else {
      setOptForm({ name: '', description: '', extraPrice: 0, isActive: true });
      setOptionModal({ open: true, type, data: null });
    }
  };

  const handleSaveOpt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optForm.name.trim()) return;
    setSaving(true);
    try {
      const type = optionModal.type;
      const id = optionModal.data?.id;

      // Clean payload for Odoo models
      const payload: any = {
        name: optForm.name.trim(),
        active: Boolean(optForm.isActive),
      };
      if (optForm.description && optForm.description.trim()) {
        payload.description = optForm.description.trim();
      }
      // Only cutting options have extra_price in Odoo (packaging and excluded parts do not)
      if (type === 'cutting') {
        payload.extra_price = Number(optForm.extraPrice) || 0;
      }

      if (type === 'cutting') {
        if (id) await adminApi.updateCuttingOption(id, payload);
        else await adminApi.createCuttingOption(payload);
      } else if (type === 'packaging') {
        if (id) await adminApi.updatePackaging(id, payload);
        else await adminApi.createPackaging(payload);
      } else {
        if (id) await adminApi.updateExcludedPart(id, payload);
        else await adminApi.createExcludedPart(payload);
      }
      setOptionModal({ open: false, type: 'cutting', data: null });
      await loadAll();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (language === 'ar' ? 'فشل حفظ الخيار' : 'Failed to save option');
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOptActive = async (type: 'cutting' | 'packaging' | 'excluded', opt: AdminOptionEntity) => {
    try {
      const nextActive = !opt.isActive;
      const payload = {
        active: nextActive,
      };
      if (type === 'cutting') await adminApi.updateCuttingOption(opt.id, payload);
      else if (type === 'packaging') await adminApi.updatePackaging(opt.id, payload);
      else await adminApi.updateExcludedPart(opt.id, payload);
      await loadAll();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (language === 'ar' ? 'فشل تعديل حالة الخيار' : 'Failed to toggle status');
      alert(errorMsg);
    }
  };

  const handleOpenSizeModal = (sz?: AdminSizeEntity) => {
    if (sz) {
      setSizeForm({
        name: sz.name,
        subTitle: sz.subTitle || '',
        price: sz.price,
        calories: sz.calories,
        productId: sz.productId,
        isDefault: sz.isDefault
      });
      setSizeModal({ open: true, data: sz });
    } else {
      const defaultProdId = products[0]?.id || 0;
      setSizeForm({ name: '', subTitle: '', price: 0, calories: 243, productId: defaultProdId, isDefault: false });
      setSizeModal({ open: true, data: null });
    }
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeForm.name.trim() || !sizeForm.productId) {
      alert(language === 'ar' ? 'يرجى إدخال اسم الحجم وتحديد الذبيحة' : 'Please provide size name and product');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: sizeForm.name.trim(),
        sub_title: (sizeForm.subTitle || '').trim(),
        price: Number(sizeForm.price) || 0,
        calories: Number(sizeForm.calories) || 243,
        product_id: Number(sizeForm.productId),
        is_default: Boolean(sizeForm.isDefault),
        active: true,
        sequence: 10,
      };

      if (sizeModal.data) {
        await adminApi.updateSize(sizeModal.data.id, payload);
      } else {
        await adminApi.createSize(payload);
      }
      setSizeModal({ open: false, data: null });
      await loadAll();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (language === 'ar' ? 'فشل حفظ حجم الذبيحة' : 'Failed to save carcass size');
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute top-1/2 -translate-y-1/2 text-slate-400 ltr:left-3 rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'البحث في التصنيفات، التقطيع، التغليف، الأحجام...'
                : 'Search categories, cuts, packaging, sizes...'
            }
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Action Button & Reload */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title={language === 'ar' ? 'تحديث البيانات' : 'Reload'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (activeTab === 'categories') handleOpenCatModal();
              else if (activeTab === 'cutting') handleOpenOptModal('cutting');
              else if (activeTab === 'packaging') handleOpenOptModal('packaging');
              else if (activeTab === 'excluded') handleOpenOptModal('excluded');
              else if (activeTab === 'sizes') handleOpenSizeModal();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'categories' && (language === 'ar' ? 'إضافة قسم جديد' : 'Add Category')}
              {activeTab === 'cutting' && (language === 'ar' ? 'إضافة طريقة تقطيع' : 'Add Cutting Style')}
              {activeTab === 'packaging' && (language === 'ar' ? 'إضافة خيار تغليف' : 'Add Packaging')}
              {activeTab === 'excluded' && (language === 'ar' ? 'إضافة جزء مستبعد' : 'Add Excluded Part')}
              {activeTab === 'sizes' && (language === 'ar' ? 'إضافة حجم ذبيحة' : 'Add Carcass Size')}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'categories', labelAr: 'أقسام المتجر', labelEn: 'Categories', count: catCount, icon: FolderTree },
          { id: 'cutting', labelAr: 'طرق التقطيع', labelEn: 'Cutting Styles', count: cutCount, icon: Scissors },
          { id: 'packaging', labelAr: 'خيارات التغليف', labelEn: 'Packaging', count: packCount, icon: Package },
          { id: 'excluded', labelAr: 'الأجزاء المستبعدة', labelEn: 'Excluded Parts', count: exclCount, icon: Ban },
          { id: 'sizes', labelAr: 'أحجام وأوزان الذبائح', labelEn: 'Carcass Sizes', count: sizeCount, icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CategoryTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${isSelected
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Option Filter Chips (Only for cutting, packaging, excluded) */}
      {(activeTab === 'cutting' || activeTab === 'packaging' || activeTab === 'excluded') && (
        <div className="flex items-center gap-2">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'active', labelAr: 'النشطة فقط', labelEn: 'Active Only' },
            { id: 'with_fee', labelAr: 'برسوم إضافية', labelEn: 'With Extra Fee' },
            { id: 'free', labelAr: 'مجانية', labelEn: 'Free' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterMode(chip.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === chip.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
            >
              {language === 'ar' ? chip.labelAr : chip.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm">{language === 'ar' ? 'جارٍ تحميل البيانات...' : 'Loading data...'}</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-red-600 dark:text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadAll}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* TAB 1: Categories View */}
      {!loading && !error && activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const count = products.filter(p => p.category_id === cat.id).length;
            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-40 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image.startsWith('http') || cat.image.startsWith('/') || cat.image.startsWith('data:') ? cat.image : `data:image/png;base64,${cat.image}`}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <FolderTree className="w-12 h-12 text-slate-400" />
                  )}
                  <span className="absolute top-3 ltr:left-3 rtl:right-3 px-2.5 py-1 bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{count} {language === 'ar' ? 'منتج' : 'products'}</span>
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenCatModal(cat)}
                      className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors"
                      title={language === 'ar' ? 'تعديل القسم' : 'Edit'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteDialog({
                          open: true,
                          title: cat.name,
                          onConfirm: async () => {
                            await adminApi.deleteCategory(cat.id);
                            await loadAll();
                          }
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title={language === 'ar' ? 'حذف القسم' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2, 3, 4: Options Cards (Cutting, Packaging, Excluded) */}
      {!loading && !error && (activeTab === 'cutting' || activeTab === 'packaging' || activeTab === 'excluded') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'cutting' ? filteredCuts : activeTab === 'packaging' ? filteredPacks : filteredExcls).map((opt) => {
            const optType = activeTab as 'cutting' | 'packaging' | 'excluded';
            return (
              <div
                key={opt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600">
                        {activeTab === 'cutting' && <Scissors className="w-5 h-5" />}
                        {activeTab === 'packaging' && <Package className="w-5 h-5" />}
                        {activeTab === 'excluded' && <Ban className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{opt.name}</h4>
                        <span className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${opt.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                          {opt.isActive ? (language === 'ar' ? 'نشط ومتاح' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleOptActive(optType, opt)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${opt.isActive ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${opt.isActive ? (isRTL ? '-translate-x-6' : 'translate-x-6') : (isRTL ? '-translate-x-1' : 'translate-x-1')
                          }`}
                      />
                    </button>
                  </div>

                  {opt.description && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{opt.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {opt.extraPrice > 0 ? (
                      <span className="text-primary-600 dark:text-primary-400">+{opt.extraPrice} {language === 'ar' ? 'ر.س رسوم إضافية' : 'SAR Extra'}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">{language === 'ar' ? 'مجاني بدون رسوم' : 'Free option'}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenOptModal(optType, opt)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors"
                      title={language === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteDialog({
                          open: true,
                          title: opt.name,
                          onConfirm: async () => {
                            if (optType === 'cutting') await adminApi.deleteCuttingOption(opt.id);
                            else if (optType === 'packaging') await adminApi.deletePackaging(opt.id);
                            else await adminApi.deleteExcludedPart(opt.id);
                            await loadAll();
                          }
                        });
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title={language === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: Carcass Sizes View */}
      {!loading && !error && activeTab === 'sizes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSizes.map((sz) => (
            <div
              key={sz.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{sz.name}</h4>
                        {sz.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            {language === 'ar' ? 'افتراضي' : 'Default'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {sz.productName || (language === 'ar' ? 'مرتبط بمنتج' : 'Associated Product')}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {sz.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                {sz.subTitle && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{sz.subTitle}</p>
                )}

                {sz.calories > 0 && (
                  <p className="mt-1 text-xs text-slate-400 font-medium">
                    {sz.calories} {language === 'ar' ? 'سعرة حرارية تقريبية' : 'calories'}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenSizeModal(sz)}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-lg transition-colors"
                  title={language === 'ar' ? 'تعديل' : 'Edit'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeleteDialog({
                      open: true,
                      title: sz.name,
                      onConfirm: async () => {
                        await adminApi.deleteSize(sz.id);
                        await loadAll();
                      }
                    });
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Add/Edit Modal (Matching Odoo 1:1) */}
      {categoryModal.open && (() => {
        const categoryProducts = categoryModal.data ? products.filter(p => p.category_id === categoryModal.data!.id) : [];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-primary-600" />
                  <span>
                    {categoryModal.data
                      ? (language === 'ar' ? `تعديل بيانات القسم: ${categoryModal.data.name}` : `Edit Category: ${categoryModal.data.name}`)
                      : (language === 'ar' ? 'إضافة قسم جديد' : 'New Category')}
                  </span>
                </h3>

                {/* Sub-tabs if editing */}
                {categoryModal.data && (
                  <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCatModalTab('info')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        catModalTab === 'info'
                          ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {language === 'ar' ? 'البيانات الأساسية' : 'General Info'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatModalTab('products')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        catModalTab === 'products'
                          ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{language === 'ar' ? 'المنتجات التابعة' : 'Products'}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                        {categoryProducts.length}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveCat} className="flex-1 overflow-y-auto space-y-4 pe-1">
                {catModalTab === 'info' ? (
                  <>
                    {/* Category Image Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {language === 'ar' ? 'صورة القسم (Image)' : 'Category Image'}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                          {catForm.image ? (
                            <img
                              src={catForm.image.startsWith('http') || catForm.image.startsWith('/') || catForm.image.startsWith('data:') ? catForm.image : `data:image/png;base64,${catForm.image}`}
                              alt="Category"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FolderTree className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition">
                            <span>{language === 'ar' ? 'اختيار صورة...' : 'Choose image...'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const fullDataUrl = reader.result as string;
                                    setCatForm((prev) => ({ ...prev, image: fullDataUrl }));
                                    const cleanBase64 = fullDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
                                    setNewCatImageBase64(cleanBase64);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <p className="text-[10px] text-slate-400">
                            {language === 'ar' ? 'صورة معبرة عن قسم الذبائح (JPG, PNG, WEBP)' : 'Image representing livestock category'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category Names (AR + EN matching Odoo) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'اسم القسم بالعربية *' : 'Category Name (AR) *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={catForm.name}
                          onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                          placeholder={language === 'ar' ? 'مثال: ذبائح النعيمي والنجدي' : 'e.g. Naemi & Najdi'}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'اسم القسم بالإنجليزية (EN)' : 'Category Name (EN)'}
                        </label>
                        <input
                          type="text"
                          value={catForm.nameEn}
                          onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
                          placeholder="e.g. Naemi & Najdi Sheep"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Sequence & Active Checkbox (matching Odoo 1:1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'ترتيب الظهور (Sequence)' : 'Sequence'}
                        </label>
                        <input
                          type="number"
                          value={catForm.sequence}
                          onChange={(e) => setCatForm({ ...catForm, sequence: parseInt(e.target.value) || 10 })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold"
                        />
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <input
                            type="checkbox"
                            checked={catForm.active}
                            onChange={(e) => setCatForm({ ...catForm, active: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {language === 'ar' ? 'قسم نشط ومتاح في المتجر (Active)' : 'Active Category'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Descriptions (AR + EN) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'الوصف بالعربية (Description)' : 'Description (AR)'}
                        </label>
                        <textarea
                          rows={2}
                          value={catForm.description}
                          onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                          placeholder={language === 'ar' ? 'وصف مختصر لأنواع وسلالات الذبائح في هذا القسم...' : 'Short description...'}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'الوصف بالإنجليزية (EN Description)' : 'Description (EN)'}
                        </label>
                        <textarea
                          rows={2}
                          value={catForm.descriptionEn}
                          onChange={(e) => setCatForm({ ...catForm, descriptionEn: e.target.value })}
                          placeholder="Short description in English..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* Products Tab (matching Odoo Image 1) */
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ar'
                        ? `قائمة الذبائح والمنتجات المسجلة مباشرة تحت قسم "${categoryModal.data?.name}" في Odoo:`
                        : `Livestock and products associated with "${categoryModal.data?.name}":`}
                    </p>

                    {categoryProducts.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        {language === 'ar' ? 'لا توجد منتجات مسجلة في هذا القسم حالياً' : 'No products found in this category'}
                      </div>
                    ) : (
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-start text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            <tr>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'اسم المنتج' : 'Name'}</th>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'السعر' : 'Price'}</th>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'المخزون' : 'Stock'}</th>
                              <th className="py-2.5 px-3 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {categoryProducts.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                                  {p.name}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-primary-600">
                                  {p.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                                </td>
                                <td className="py-2.5 px-3 font-mono">
                                  {p.stock_quantity ?? 0}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                      p.is_active !== false
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                  >
                                    {p.is_active !== false ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCategoryModal({ open: false, data: null })}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer transition"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>
                      {categoryModal.data
                        ? (language === 'ar' ? 'حفظ تعديلات القسم' : 'Save Changes')
                        : (language === 'ar' ? 'إضافة وتأكيد القسم' : 'Add Category')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Option Add/Edit Modal (Cutting / Packaging / Excluded) */}
      {optionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              {optionModal.type === 'packaging' && <Package className="w-5 h-5 text-primary-600" />}
              {optionModal.type === 'cutting' && <Scissors className="w-5 h-5 text-primary-600" />}
              {optionModal.type === 'excluded' && <Ban className="w-5 h-5 text-primary-600" />}
              <span>
                {optionModal.data
                  ? (language === 'ar'
                      ? (optionModal.type === 'packaging' ? 'تعديل خيار التغليف' : optionModal.type === 'cutting' ? 'تعديل طريقة التقطيع' : 'تعديل الجزء المستبعد')
                      : 'Edit Option')
                  : (language === 'ar'
                      ? (optionModal.type === 'packaging' ? 'إضافة خيار تغليف جديد' : optionModal.type === 'cutting' ? 'إضافة طريقة تقطيع جديدة' : 'إضافة جزء مستبعد جديد')
                      : 'New Option')}
              </span>
            </h3>

            <form onSubmit={handleSaveOpt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'اسم الخيار *' : 'Option Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={optForm.name}
                  onChange={(e) => setOptForm({ ...optForm, name: e.target.value })}
                  placeholder={language === 'ar' ? (optionModal.type === 'packaging' ? 'مثال: أطباق فوم مغلفة بالسلوفان' : 'اسم الخيار...') : 'Option name...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                />
              </div>

              {/* Extra Price is only applicable to cutting in Odoo */}
              {optionModal.type === 'cutting' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الرسوم الإضافية (ر.س)' : 'Extra Price (SAR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={optForm.extraPrice}
                    onChange={(e) => setOptForm({ ...optForm, extraPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={optForm.description}
                  onChange={(e) => setOptForm({ ...optForm, description: e.target.value })}
                  placeholder={language === 'ar' ? 'وصف مختصر لطريقة التغليف والتجهيز...' : 'Description...'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="optActive"
                  checked={optForm.isActive}
                  onChange={(e) => setOptForm({ ...optForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="optActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {language === 'ar' ? 'خيار نشط ومتاح للطلب (Active)' : 'Active and available for customer orders'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOptionModal({ open: false, type: 'cutting', data: null })}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer transition"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {optionModal.data
                      ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                      : (language === 'ar' ? 'إضافة وتأكيد الخيار' : 'Add Option')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Carcass Size Add/Edit Modal */}
      {sizeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span>
                {sizeModal.data
                  ? (language === 'ar' ? 'تعديل حجم الذبيحة' : 'Edit Carcass Size')
                  : (language === 'ar' ? 'إضافة حجم ذبيحة جديد' : 'New Carcass Size')}
              </span>
            </h3>

            <form onSubmit={handleSaveSize} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الذبيحة المرتبطة *' : 'Associated Product *'}
                </label>
                <select
                  required
                  value={sizeForm.productId}
                  onChange={(e) => setSizeForm({ ...sizeForm, productId: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={0}>{language === 'ar' ? '-- اختر الذبيحة --' : '-- Select Product --'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'اسم الحجم (مثال: جذع، هرفي، كبير) *' : 'Size Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={sizeForm.name}
                  onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'السعر (ر.س) *' : 'Price (SAR) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={sizeForm.price}
                    onChange={(e) => setSizeForm({ ...sizeForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'السعرات الحرارية' : 'Calories'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sizeForm.calories}
                    onChange={(e) => setSizeForm({ ...sizeForm, calories: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'تفاصيل إضافية (الوزن التقريبي)' : 'Weight / Subtitle'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'مثال: من 15 إلى 18 كجم صافي' : 'e.g. 15 to 18 kg'}
                  value={sizeForm.subTitle}
                  onChange={(e) => setSizeForm({ ...sizeForm, subTitle: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sizeDefault"
                  checked={sizeForm.isDefault}
                  onChange={(e) => setSizeForm({ ...sizeForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="sizeDefault" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'تعيين كحجم افتراضي عند فتح الذبيحة' : 'Set as default size'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSizeModal({ open: false, data: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{language === 'ar' ? 'حفظ الحجم' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {language === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف "${deleteDialog.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteDialog({ open: false, title: '', onConfirm: async () => { } })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDialog.onConfirm();
                  } catch (e: any) {
                    alert(e?.message || 'Error deleting item');
                  } finally {
                    setDeleteDialog({ open: false, title: '', onConfirm: async () => { } });
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                {language === 'ar' ? 'نعم، حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
