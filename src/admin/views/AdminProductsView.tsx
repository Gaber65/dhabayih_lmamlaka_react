import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  Edit2,
  AlertTriangle,
  Eye,
  EyeOff,
  Percent,
  ArrowDownToLine,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Scale,
  Sparkles,
  Tag,
  Sliders,
  Calendar,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useUIStore } from '../../store/useUIStore';

export const AdminProductsView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_offer'>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [cuttingOptions, setCuttingOptions] = useState<any[]>([]);
  const [packagings, setPackagings] = useState<any[]>([]);
  const [excludedParts, setExcludedParts] = useState<any[]>([]);
  
  // Quick Stock
  const [editingStockProduct, setEditingStockProduct] = useState<any | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  
  // Add / Edit Product Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Active Tab inside Add/Edit Modal
  const [modalTab, setModalTab] = useState<'general' | 'media' | 'options' | 'sizes'>('general');

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formWeight, setFormWeight] = useState<number>(15);
  const [formPreparationTime, setFormPreparationTime] = useState<number>(30);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState<boolean>(false);
  const [formIsOnOffer, setFormIsOnOffer] = useState<boolean>(false);
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(0);
  const [formOfferPrice, setFormOfferPrice] = useState<number>(0);
  const [formOfferStartDate, setFormOfferStartDate] = useState<string>('');
  const [formOfferEndDate, setFormOfferEndDate] = useState<string>('');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);
  const [formSelectedCuttingIds, setFormSelectedCuttingIds] = useState<number[]>([]);
  const [formSelectedPackagingIds, setFormSelectedPackagingIds] = useState<number[]>([]);
  const [formSelectedExcludedPartIds, setFormSelectedExcludedPartIds] = useState<number[]>([]);
  const [formDescription, setFormDescription] = useState('');
  const [formIsCarcass, setFormIsCarcass] = useState(true);
  const [formActive, setFormActive] = useState(true);
  const [formImageBase64, setFormImageBase64] = useState<string>('');
  const [formImagePreview, setFormImagePreview] = useState<string>('');
  const [formSizes, setFormSizes] = useState<Array<{
    id?: number;
    portion_type: 'full' | 'half' | 'quarter';
    name: string;
    weight_range: string;
    price: number;
    calories: number;
    sub_title: string;
    is_default: boolean;
    active: boolean;
  }>>([]);
  const [deletedSizeIds, setDeletedSizeIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Dialog
  const [deleteProductDialog, setDeleteProductDialog] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { language } = useLanguageStore();
  const { addToast } = useUIStore();
  const isAr = language === 'ar';

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        adminApi.getProducts({ limit: 200 }),
        adminApi.getCategories(),
        adminApi.getCuttingOptions(),
        adminApi.getPackagings(),
        adminApi.getExcludedParts(),
      ]);

      if (results[0].status === 'fulfilled') setProducts(results[0].value.products || []);
      if (results[1].status === 'fulfilled') setCategories(results[1].value.categories || []);
      if (results[2].status === 'fulfilled') setCuttingOptions(results[2].value.cuttingOptions || []);
      if (results[3].status === 'fulfilled') setPackagings(results[3].value.packagings || []);
      if (results[4].status === 'fulfilled') setExcludedParts(results[4].value.excludedParts || []);
    } catch {
      addToast({ type: 'error', message: isAr ? 'فشل تحميل المنتجات من الخادم' : 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setModalTab('general');
    setFormName('');
    setFormSku(`PRD-${Date.now().toString().slice(-6)}`);
    setFormBarcode(`BC-${Date.now().toString().slice(-8)}`);
    setFormCategoryId(categories[0]?.id || 0);
    setFormSellingPrice(1200);
    setFormPurchasePrice(950);
    setFormStock(20);
    setFormMinStock(5);
    setFormWeight(15);
    setFormPreparationTime(30);
    setFormIsFeatured(false);
    setFormIsBestSeller(false);
    setFormIsOnOffer(false);
    setFormDiscountType('percentage');
    setFormDiscountValue(0);
    setFormOfferPrice(0);
    setFormOfferStartDate('');
    setFormOfferEndDate('');
    setFormIsAvailable(true);
    setFormDescription('');
    setFormIsCarcass(true);
    setFormActive(true);
    setFormSelectedCuttingIds(cuttingOptions.map((c) => c.id));
    setFormSelectedPackagingIds(packagings.map((p) => p.id));
    setFormSelectedExcludedPartIds(excludedParts.map((e) => e.id));
    setFormImageBase64('');
    setFormImagePreview('');
    setFormSizes([]);
    setDeletedSizeIds([]);
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setModalTab('general');
    setFormName(p.name || p.title || '');
    setFormSku(p.sku || `PRD-${p.id}`);
    setFormBarcode(p.barcode || '');
    const catId = p.category_id?.id || p.categoryId || p.category_id || (categories[0]?.id || 0);
    setFormCategoryId(Number(catId));
    setFormSellingPrice(Number(p.selling_price || p.price || 0));
    setFormPurchasePrice(Number(p.purchase_price || (p.price ? p.price * 0.75 : 0)));
    setFormStock(Number(p.stock_quantity ?? p.stockQuantity ?? 0));
    setFormMinStock(Number(p.minimum_stock ?? 5));
    setFormWeight(Number(p.weight || 15));
    setFormPreparationTime(Number(p.preparation_time || 30));
    setFormIsFeatured(Boolean(p.is_featured));
    setFormIsBestSeller(Boolean(p.is_best_seller));
    setFormIsOnOffer(Boolean(p.is_on_offer));
    setFormDiscountType(p.discount_type || 'percentage');
    setFormDiscountValue(Number(p.discount_value || 0));
    setFormOfferPrice(Number(p.offer_price || 0));
    setFormOfferStartDate(p.offer_start_date || '');
    setFormOfferEndDate(p.offer_end_date || '');
    setFormIsAvailable(p.is_available !== false);
    setFormDescription(p.description || '');
    setFormIsCarcass(p.is_carcass !== false);
    setFormActive(p.active !== false && p.is_active !== false);

    const existingCuts = Array.isArray(p.cutting_options) ? p.cutting_options.map((x: any) => x.id || x) : [];
    const existingPacks = Array.isArray(p.packaging_options) ? p.packaging_options.map((x: any) => x.id || x) : [];
    const existingExcls = Array.isArray(p.excluded_parts) ? p.excluded_parts.map((x: any) => x.id || x) : [];

    setFormSelectedCuttingIds(existingCuts.length > 0 ? existingCuts : cuttingOptions.map((c) => c.id));
    setFormSelectedPackagingIds(existingPacks.length > 0 ? existingPacks : packagings.map((p) => p.id));
    setFormSelectedExcludedPartIds(existingExcls.length > 0 ? existingExcls : excludedParts.map((e) => e.id));

    if (Array.isArray(p.sizes) && p.sizes.length > 0) {
      setFormSizes(p.sizes.map((s: any) => ({
        id: s.id,
        portion_type: s.portion_type || 'full',
        name: s.name || '',
        weight_range: s.weight_range || '',
        price: Number(s.price || 0),
        calories: Number(s.calories || 243),
        sub_title: s.sub_title || '',
        is_default: Boolean(s.is_default),
        active: s.active !== false,
      })));
    } else {
      setFormSizes([]);
    }
    setDeletedSizeIds([]);

    setFormImageBase64('');
    setFormImagePreview(p.image || p.imageUrl || p.main_image_url || '');
    setProductModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const res = uploadEvent.target?.result as string;
      setFormImageBase64(res);
      setFormImagePreview(res);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ type: 'error', message: isAr ? 'يرجى كتابة اسم الذبيحة / المنتج' : 'Please enter product name' });
      return;
    }

    setSavingProduct(true);
    try {
      const payload: any = {
        name: formName.trim(),
        sku: formSku.trim(),
        barcode: formBarcode.trim() || undefined,
        category_id: formCategoryId || undefined,
        selling_price: formSellingPrice,
        price: formSellingPrice,
        purchase_price: formPurchasePrice,
        stock_quantity: formStock,
        minimum_stock: formMinStock,
        weight: formWeight,
        preparation_time: formPreparationTime,
        is_featured: formIsFeatured,
        is_best_seller: formIsBestSeller,
        is_on_offer: formIsOnOffer,
        discount_type: formDiscountType,
        discount_value: formDiscountValue,
        offer_price: formIsOnOffer && formOfferPrice > 0 ? formOfferPrice : undefined,
        offer_start_date: formOfferStartDate || undefined,
        offer_end_date: formOfferEndDate || undefined,
        is_available: formIsAvailable,
        cutting_option_ids: formSelectedCuttingIds,
        packaging_ids: formSelectedPackagingIds,
        excluded_part_ids: formSelectedExcludedPartIds,
        description: formDescription.trim(),
        is_carcass: formIsCarcass,
        active: formActive,
        sizes: formSizes,
      };

      if (formImageBase64) {
        payload.main_image = formImageBase64;
      }

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        addToast({
          type: 'success',
          message: isAr ? `تم تحديث المنتج (${formName}) بنجاح` : 'Product updated successfully',
        });
      } else {
        await adminApi.createProduct(payload);
        addToast({
          type: 'success',
          message: isAr ? `تمت إضافة المنتج الجديد (${formName}) بنجاح` : 'Product added successfully',
        });
      }

      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      addToast({
        type: 'error',
        message: err?.message || (isAr ? 'فشل حفظ بيانات المنتج' : 'Failed to save product'),
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductDialog) return;
    setDeletingProduct(true);
    try {
      await adminApi.deleteProduct(deleteProductDialog.id);
      addToast({
        type: 'success',
        message: isAr ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
      });
      setDeleteProductDialog(null);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductDialog.id));
    } catch {
      addToast({ type: 'error', message: isAr ? 'فشل حذف المنتج من الخادم' : 'Failed to delete product' });
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleQuickStockUpdate = async () => {
    if (!editingStockProduct) return;
    try {
      await adminApi.updateProductStock(editingStockProduct.id, newStockQty);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingStockProduct.id
            ? { ...p, stock_quantity: newStockQty, stockQuantity: newStockQty }
            : p
        )
      );
      addToast({
        type: 'success',
        message: isAr
          ? `تم تحديث مخزون (${editingStockProduct.name || editingStockProduct.title}) بنجاح`
          : 'Stock updated successfully',
      });
      setEditingStockProduct(null);
    } catch {
      addToast({ type: 'error', message: isAr ? 'فشل تحديث المخزون' : 'Failed to update stock' });
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      await adminApi.toggleProductActive(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
      );
      addToast({
        type: 'success',
        message: isAr ? 'تم تعديل حالة توفر المنتج بالمتجر' : 'Product availability updated',
      });
    } catch {
      addToast({ type: 'error', message: isAr ? 'فشل تعديل الحالة' : 'Failed to update status' });
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let activeCount = 0;

    products.forEach((p) => {
      const stock = Number(p.stock_quantity ?? p.stockQuantity ?? 0);
      const min = Number(p.minimum_stock ?? 5);
      if (stock === 0) outOfStock++;
      else if (stock <= min) lowStock++;
      else inStock++;

      if (p.active !== false && p.is_active !== false) activeCount++;
    });

    return { total, inStock, lowStock, outOfStock, activeCount };
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || p.title || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || name.includes(query) || sku.includes(query);

      const catId = p.category_id?.id || p.categoryId || p.category_id;
      const matchesCat = selectedCategory === 'all' || catId === selectedCategory;

      const stock = Number(p.stock_quantity ?? p.stockQuantity ?? 0);
      const min = Number(p.minimum_stock ?? 5);
      const isOnOffer = Boolean(p.is_on_offer || p.isOnOffer || p.offer_price);

      let matchesStock = true;
      if (stockStatusFilter === 'in_stock') matchesStock = stock > min;
      else if (stockStatusFilter === 'low_stock') matchesStock = stock > 0 && stock <= min;
      else if (stockStatusFilter === 'out_of_stock') matchesStock = stock === 0;
      else if (stockStatusFilter === 'on_offer') matchesStock = isOnOffer;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  const handleExportCSV = () => {
    if (products.length === 0) return;
    const headers = ['ID', 'Name', 'Category', 'Price', 'Offer Price', 'Stock', 'Status'];
    const rows = products.map((p) => [
      p.id,
      `"${(p.name || p.title || '').replace(/"/g, '""')}"`,
      `"${p.categoryName || p.category_id?.name || p.category_id || '-'}"`,
      p.selling_price || p.price || 0,
      p.offer_price || p.offerPrice || '-',
      p.stock_quantity ?? p.stockQuantity ?? 0,
      p.active !== false ? 'Active' : 'Inactive',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhabayih_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header with Add Product & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'المنتجات والذبائح المتوفرة' : 'Products & Livestock'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {isAr ? 'إدارة شاملة لكتالوج الذبائح، الأسعار، صور العرض، وحركات المخزون المباشرة' : 'Comprehensive livestock catalog, pricing, image uploads & real-time inventory'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-950/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? 'إضافة ذبيحة جديدة' : 'Add New Product'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowDownToLine className="w-4 h-4 text-slate-400" />
            <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
          </button>

          <button
            onClick={loadData}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title={isAr ? 'تحديث' : 'Refresh'}
            aria-label={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards (Shella Pattern) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between min-h-[72px]">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'إجمالي المنتجات' : 'Total Items'}
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
          </div>
          <div className="size-9 sm:size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <Package className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between min-h-[72px]">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'متوفر بالمخزون' : 'In Stock'}
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.inStock}</p>
          </div>
          <div className="size-9 sm:size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between min-h-[72px]">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'مخزون حرج / محدود' : 'Low Stock'}
            </p>
            <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.lowStock}</p>
          </div>
          <div className="size-9 sm:size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between min-h-[72px]">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isAr ? 'نشط بالمتجر' : 'Active on App'}
            </p>
            <p className="text-lg sm:text-xl font-black text-primary-600 dark:text-primary-400 mt-1">{stats.activeCount}</p>
          </div>
          <div className="size-9 sm:size-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <Layers className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Shella-Style Filters Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={isAr ? 'ابحث باسم الذبيحة، النوع، أو كود SKU...' : 'Search by name, type, or SKU...'}
              className="w-full ps-9 pe-8 py-2.5 min-h-[44px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="min-w-[36px] min-h-[36px] absolute top-1/2 -translate-y-1/2 end-1 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {isAr ? 'التصنيف:' : 'Category:'}
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 min-h-[44px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 no-scrollbar -webkit-overflow-scrolling-touch">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All', count: stats.total },
            { id: 'in_stock', label: isAr ? 'متوفر' : 'In Stock', count: stats.inStock },
            { id: 'low_stock', label: isAr ? 'محدود / حرج' : 'Low Stock', count: stats.lowStock },
            { id: 'out_of_stock', label: isAr ? 'نفد المخزون' : 'Out of Stock', count: stats.outOfStock },
            { id: 'on_offer', label: isAr ? 'عروض ترويجية' : 'On Offer' },
          ].map((tab: any) => {
            const isActive = stockStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStockStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/10 dark:text-slate-900'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Data: Mobile Cards (< md) & Desktop Table (>= md) */}
      <div className="space-y-4">
        {/* Mobile Cards List (< md) */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-primary-600" />
              {isAr ? 'جارٍ تحميل المنتجات من خادم Odoo...' : 'Loading products from Odoo ERP...'}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              {isAr ? 'لا توجد منتجات تطابق معايير البحث الحالية' : 'No products match search criteria'}
            </div>
          ) : (
            paginatedProducts.map((p) => {
              const img = p.image || p.imageUrl || p.image_url || p.main_image_url || '';
              const name = p.name || p.title || '';
              const price = p.selling_price || p.price || 0;
              const offerPrice = p.offer_price || p.offerPrice;
              const isOnOffer = Boolean(p.is_on_offer || p.isOnOffer || offerPrice);
              const stock = Number(p.stock_quantity ?? p.stockQuantity ?? 0);
              const minStock = Number(p.minimum_stock ?? 5);
              const isActive = p.active !== false && p.is_active !== false;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{name}</h4>
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.sku || `PRD-${p.id}`}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        {p.categoryName || p.category_id?.name || p.category_id || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Stock Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'السعر' : 'Price'}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                          {price} <span className="text-[10px] font-normal text-slate-500">{isAr ? 'ر.س' : 'SAR'}</span>
                        </span>
                        {isOnOffer && offerPrice && (
                          <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400 text-xs">
                            <Percent className="w-3 h-3" />
                            {offerPrice} {isAr ? 'ر.س' : 'SAR'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingStockProduct(p);
                        setNewStockQty(stock);
                      }}
                      className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        stock === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                          : stock <= minStock
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                      title={isAr ? 'اضغط لتعديل المخزون' : 'Update stock'}
                    >
                      {stock <= minStock && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{isAr ? 'المخزون:' : 'Stock:'} {stock}</span>
                      <Edit2 className="w-3 h-3 opacity-60" />
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {isActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      <span>{isActive ? (isAr ? 'تعطيل' : 'Hide') : (isAr ? 'تفعيل' : 'Show')}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="min-h-[44px] px-3.5 rounded-xl bg-primary-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary-700 cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>{isAr ? 'تعديل' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteProductDialog(p)}
                      className="min-w-[44px] min-h-[44px] rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
                      title={isAr ? 'حذف المنتج' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? 'المنتج / الذبيحة' : 'Product'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'السعر الأساسي' : 'Base Price'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'سعر العرض' : 'Offer Price'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المخزون' : 'Stock'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-primary-600" />
                      {isAr ? 'جارٍ تحميل قائمة المنتجات من خادم Odoo...' : 'Loading products from Odoo ERP...'}
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      {isAr ? 'لا توجد منتجات تطابق معايير البحث الحالية' : 'No products match search criteria'}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const img = p.image || p.imageUrl || p.image_url || p.main_image_url || '';
                    const name = p.name || p.title || '';
                    const price = p.selling_price || p.price || 0;
                    const offerPrice = p.offer_price || p.offerPrice;
                    const isOnOffer = Boolean(p.is_on_offer || p.isOnOffer || offerPrice);
                    const stock = Number(p.stock_quantity ?? p.stockQuantity ?? 0);
                    const minStock = Number(p.minimum_stock ?? 5);
                    const isActive = p.active !== false && p.is_active !== false;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {img ? (
                                <img src={img} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.sku || `PRD-${p.id}`}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                          {p.categoryName || p.category_id?.name || p.category_id || '-'}
                        </td>

                        <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">
                          {price} <span className="text-[10px] font-normal text-slate-500">{isAr ? 'ر.س' : 'SAR'}</span>
                        </td>

                        <td className="py-3 px-4">
                          {isOnOffer && offerPrice ? (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                              <Percent className="w-3 h-3" />
                              {offerPrice} {isAr ? 'ر.س' : 'SAR'}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setEditingStockProduct(p);
                              setNewStockQty(stock);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              stock === 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                                : stock <= minStock
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                            title={isAr ? 'اضغط لتعديل المخزون السريع' : 'Click to quick update stock'}
                          >
                            {stock <= minStock && <AlertTriangle className="w-3 h-3" />}
                            <span>{stock}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isActive ? (isAr ? 'نشط ومتاح' : 'Active') : isAr ? 'معطل' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors cursor-pointer"
                              title={isAr ? 'تعديل كامل' : 'Edit Product'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleActive(p)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title={isActive ? (isAr ? 'تعطيل المنتج' : 'Deactivate') : isAr ? 'تفعيل المنتج' : 'Activate'}
                            >
                              {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            <button
                              onClick={() => setDeleteProductDialog(p)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title={isAr ? 'حذف المنتج' : 'Delete Product'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        {filteredProducts.length > itemsPerPage && (
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {isAr
                ? `عرض ${(page - 1) * itemsPerPage + 1} إلى ${Math.min(
                    page * itemsPerPage,
                    filteredProducts.length
                  )} من أصل ${filteredProducts.length}`
                : `Showing ${(page - 1) * itemsPerPage + 1} to ${Math.min(
                    page * itemsPerPage,
                    filteredProducts.length
                  )} of ${filteredProducts.length}`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
              </button>
              <span className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Product Comprehensive Modal (Matching Odoo 1:1) ─────────────────────────────────── */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 border border-primary-200 dark:border-primary-900/50 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                      {editingProduct
                        ? isAr
                          ? `تعديل الذبيحة: ${formName || editingProduct.name}`
                          : `Edit Product: ${formName || editingProduct.name}`
                        : isAr
                        ? 'إضافة ذبيحة ومنتج جديد'
                        : 'Add New Livestock Product'}
                    </h3>
                    {formSku && (
                      <span className="hidden xs:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                        {formSku}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                    {isAr ? 'البيانات والأحجام وخيارات التجهيز مرتبطة مباشرة بنظام Odoo ERP' : 'Directly synced with Odoo ERP'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center shrink-0"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Odoo Style Tab Navigation Bar */}
            <div className="flex items-center gap-1 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar -webkit-overflow-scrolling-touch">
              <button
                type="button"
                onClick={() => setModalTab('general')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  modalTab === 'general'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isAr ? 'البيانات والأسعار' : 'General & Pricing'}</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('options')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  modalTab === 'options'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{isAr ? 'خيارات التجهيز (Options)' : 'Options'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {formSelectedCuttingIds.length + formSelectedPackagingIds.length + formSelectedExcludedPartIds.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('sizes')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  modalTab === 'sizes'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? 'أحجام وتقسيمات الذبيحة (Carcass Sizes & Portions)' : 'Carcass Sizes & Portions'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold">
                  {formSizes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('media')}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  modalTab === 'media'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'الوسائط والصور (Media)' : 'Media'}</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ── TAB 1: General & Pricing ─────────────────────────────────── */}
                {modalTab === 'general' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    {/* Top Identity & Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'اسم الذبيحة / المنتج *' : 'Product Name *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder={isAr ? 'مثال: خروف حري بلدي طازج' : 'e.g. Fresh Harri Lamb'}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {isAr ? 'التصنيف' : 'Category'}
                            </label>
                            <select
                              value={formCategoryId}
                              onChange={(e) => setFormCategoryId(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {isAr ? 'كود الصنف (SKU)' : 'SKU'}
                            </label>
                            <input
                              type="text"
                              value={formSku}
                              onChange={(e) => setFormSku(e.target.value)}
                              placeholder="PRD-HARRI-01"
                              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {isAr ? 'الباركود (Barcode)' : 'Barcode'}
                            </label>
                            <input
                              type="text"
                              value={formBarcode}
                              onChange={(e) => setFormBarcode(e.target.value)}
                              placeholder="6281000123456"
                              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'وصف الذبيحة ومواصفاتها' : 'Description'}
                          </label>
                          <textarea
                            rows={2}
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder={isAr ? 'مواصفات الذبيحة، طريقة التربية، والتفاصيل الملحقة...' : 'Product description and butcher details...'}
                            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Right Checkbox Statuses (Matching Odoo Header) */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-center">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">
                          {isAr ? 'حالات الصنف وخياراته' : 'Product Status'}
                        </span>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formActive}
                            onChange={(e) => setFormActive(e.target.checked)}
                            className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isAr ? 'نشط ومفعل (Active)' : 'Active'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsCarcass}
                            onChange={(e) => setFormIsCarcass(e.target.checked)}
                            className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isAr ? 'ذبيحة تدعم التقسيم (Is Dividable Carcass)' : 'Is Dividable Carcass'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsFeatured}
                            onChange={(e) => setFormIsFeatured(e.target.checked)}
                            className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isAr ? 'منتج مميز بالواجهة (Is Featured)' : 'Is Featured'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsBestSeller}
                            onChange={(e) => setFormIsBestSeller(e.target.checked)}
                            className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isAr ? 'الأكثر مبيعاً وطلباً (Is Best Seller)' : 'Is Best Seller'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* PRICING & OFFERS Card (Matching Odoo 1:1) */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                            {isAr ? 'الأسعار وهوامش الربح والعروض (PRICING & OFFERS)' : 'Pricing & Offers'}
                          </h4>
                        </div>
                        {formSellingPrice > 0 && formPurchasePrice > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {isAr ? 'هامش الربح:' : 'Profit:'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              +{(formSellingPrice - formPurchasePrice).toFixed(2)} ر.س (
                              {(((formSellingPrice - formPurchasePrice) / formSellingPrice) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'سعر التكلفة / الشراء (ر.س) *' : 'Purchase Price *'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={formPurchasePrice}
                            onChange={(e) => setFormPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'سعر البيع للعميل (ر.س) *' : 'Selling Price *'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            required
                            value={formSellingPrice}
                            onChange={(e) => setFormSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'نوع الخصم (Discount Type)' : 'Discount Type'}
                          </label>
                          <select
                            value={formDiscountType}
                            onChange={(e) => setFormDiscountType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                          >
                            <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                            <option value="fixed">{isAr ? 'مبلغ ثابت (ر.س)' : 'Fixed Amount (SAR)'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'قيمة الخصم' : 'Discount Value'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={formDiscountValue}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setFormDiscountValue(val);
                              if (val > 0) {
                                setFormIsOnOffer(true);
                                const calcOffer =
                                  formDiscountType === 'percentage'
                                    ? Math.round(formSellingPrice * (1 - val / 100))
                                    : Math.max(0, formSellingPrice - val);
                                setFormOfferPrice(calcOffer);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 items-center">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isOnOfferCheckbox"
                            checked={formIsOnOffer}
                            onChange={(e) => setFormIsOnOffer(e.target.checked)}
                            className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                          />
                          <label htmlFor="isOnOfferCheckbox" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                            {isAr ? 'تفعيل العرض الترويجي (Is On Offer)' : 'Is On Offer'}
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {isAr ? 'تاريخ بداية العرض (Start Date)' : 'Offer Start Date'}
                          </label>
                          <input
                            type="date"
                            value={formOfferStartDate}
                            onChange={(e) => setFormOfferStartDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {isAr ? 'تاريخ انتهاء العرض (End Date)' : 'Offer End Date'}
                          </label>
                          <input
                            type="date"
                            value={formOfferEndDate}
                            onChange={(e) => setFormOfferEndDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* STOCK & DETAILS Card (Matching Odoo 1:1) */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Scale className="w-4 h-4 text-primary-600" />
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                          {isAr ? 'المخزون ومواصفات التجهيز (STOCK & DETAILS)' : 'Stock & Details'}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'الكمية بالمخزون' : 'Stock Quantity'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formStock}
                            onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'حد التنبيه الحرج' : 'Minimum Stock'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formMinStock}
                            onChange={(e) => setFormMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'الوزن التقريبي (كجم)' : 'Weight (kg)'}
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={formWeight}
                            onChange={(e) => setFormWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isAr ? 'مدة التجهيز (دقيقة)' : 'Prep Time (mins)'}
                          </label>
                          <input
                            type="number"
                            min={5}
                            value={formPreparationTime}
                            onChange={(e) => setFormPreparationTime(Math.max(5, parseInt(e.target.value) || 30))}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold font-mono"
                          />
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={formIsAvailable}
                              onChange={(e) => setFormIsAvailable(e.target.checked)}
                              className="size-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {isAr ? 'متاح للطلب (Available)' : 'Is Available'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: Media & Images ────────────────────────────────────── */}
                {modalTab === 'media' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-2">
                        {isAr ? 'الصورة الرئيسية للمنتج (MAIN PRODUCT IMAGE)' : 'Main Product Image'}
                      </h4>
                      <div className="flex items-start gap-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="size-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                          {formImagePreview ? (
                            <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-3 text-slate-400">
                              <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
                              <span className="text-[10px] font-bold block">{isAr ? 'لا توجد صورة' : 'No image'}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 flex-1 pt-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition shadow-sm cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{isAr ? 'رفع صورة رئيسية جديدة من الجهاز' : 'Upload Image'}</span>
                          </button>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isAr
                              ? 'يدعم صور PNG, JPG, WEBP. سيتم حفظها وتوليد صورة مصغرة تلقائياً على خادم Odoo.'
                              : 'Supports PNG, JPG, WEBP. Saves directly to Odoo attachment storage.'}
                          </p>
                          {formImagePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormImageBase64('');
                                setFormImagePreview('');
                              }}
                              className="text-xs font-bold text-rose-500 hover:underline inline-block pt-1 cursor-pointer"
                            >
                              {isAr ? 'إزالة الصورة الحالية' : 'Remove Image'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-2">
                        {isAr ? 'معرض صور الذبيحة الإضافية (GALLERY IMAGES)' : 'Gallery Images'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isAr
                          ? 'يمكنك استعراض وإضافة صور تفصيلية لأنصاف وأرباع الذبيحة والمراعي الملحقة.'
                          : 'Additional photos for halves, quarters, and slaughter preparations.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: Options (Butchery & Preparation) ───────────────────── */}
                {modalTab === 'options' && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    {/* Cutting Options */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                            {isAr ? 'طرق التقطيع المتاحة للذبيحة (CUTTING OPTIONS)' : 'Cutting Options'}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {isAr
                              ? `تم تحديد ${formSelectedCuttingIds.length} من أصل ${cuttingOptions.length} طريقة`
                              : `${formSelectedCuttingIds.length} selected`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormSelectedCuttingIds(cuttingOptions.map((c) => c.id))}
                            className="text-[11px] font-bold text-primary-600 hover:underline cursor-pointer"
                          >
                            {isAr ? 'تحديد الكل' : 'Select All'}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setFormSelectedCuttingIds([])}
                            className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                          >
                            {isAr ? 'إلغاء التحديد' : 'Deselect All'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {cuttingOptions.map((cut) => {
                          const selected = formSelectedCuttingIds.includes(cut.id);
                          return (
                            <button
                              key={cut.id}
                              type="button"
                              onClick={() =>
                                setFormSelectedCuttingIds((prev) =>
                                  selected ? prev.filter((id) => id !== cut.id) : [...prev, cut.id]
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                selected
                                  ? 'bg-primary-50 text-primary-700 border-primary-300 dark:bg-primary-950/70 dark:text-primary-300 dark:border-primary-800'
                                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60'
                              }`}
                            >
                              <div
                                className={`size-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                                  selected
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-slate-400 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{cut.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Packaging Options */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                            {isAr ? 'خيارات التغليف المتاحة (PACKAGING OPTIONS)' : 'Packaging Options'}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {isAr
                              ? `تم تحديد ${formSelectedPackagingIds.length} من أصل ${packagings.length} خيار`
                              : `${formSelectedPackagingIds.length} selected`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormSelectedPackagingIds(packagings.map((p) => p.id))}
                            className="text-[11px] font-bold text-primary-600 hover:underline cursor-pointer"
                          >
                            {isAr ? 'تحديد الكل' : 'Select All'}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setFormSelectedPackagingIds([])}
                            className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                          >
                            {isAr ? 'إلغاء التحديد' : 'Deselect All'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {packagings.map((pkg) => {
                          const selected = formSelectedPackagingIds.includes(pkg.id);
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() =>
                                setFormSelectedPackagingIds((prev) =>
                                  selected ? prev.filter((id) => id !== pkg.id) : [...prev, pkg.id]
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                selected
                                  ? 'bg-primary-50 text-primary-700 border-primary-300 dark:bg-primary-950/70 dark:text-primary-300 dark:border-primary-800'
                                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60'
                              }`}
                            >
                              <div
                                className={`size-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                                  selected
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-slate-400 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{pkg.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Excluded Parts */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                            {isAr ? 'الأجزاء المستبعدة المتاحة للعميل (EXCLUDED PARTS)' : 'Excluded Parts'}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {isAr
                              ? `تم تحديد ${formSelectedExcludedPartIds.length} من أصل ${excludedParts.length} جزء`
                              : `${formSelectedExcludedPartIds.length} selected`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormSelectedExcludedPartIds(excludedParts.map((e) => e.id))}
                            className="text-[11px] font-bold text-primary-600 hover:underline cursor-pointer"
                          >
                            {isAr ? 'تحديد الكل' : 'Select All'}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setFormSelectedExcludedPartIds([])}
                            className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                          >
                            {isAr ? 'إلغاء التحديد' : 'Deselect All'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {excludedParts.map((part) => {
                          const selected = formSelectedExcludedPartIds.includes(part.id);
                          return (
                            <button
                              key={part.id}
                              type="button"
                              onClick={() =>
                                setFormSelectedExcludedPartIds((prev) =>
                                  selected ? prev.filter((id) => id !== part.id) : [...prev, part.id]
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                selected
                                  ? 'bg-primary-50 text-primary-700 border-primary-300 dark:bg-primary-950/70 dark:text-primary-300 dark:border-primary-800'
                                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60'
                              }`}
                            >
                              <div
                                className={`size-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                                  selected
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-slate-400 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{part.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: Carcass Sizes & Portions (Matching Screenshot 4) ─── */}
                {modalTab === 'sizes' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                          {isAr ? 'أحجام وتقسيمات الذبيحة (Carcass Sizes & Portions)' : 'Carcass Sizes & Portions'}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {isAr
                            ? 'إدارة أسعار وتقسيمات الذبيحة (كامل / نصف / ربع) مع السعرات والوزن ونقاط الولاء'
                            : 'Manage full, half, and quarter portions and weight ranges.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormSizes((prev) => [
                            ...prev,
                            {
                              portion_type: 'full',
                              name: isAr ? 'حجم جديد' : 'New Size',
                              weight_range: '12 - 14 كجم',
                              price: formSellingPrice || 1200,
                              calories: 243,
                              sub_title: '',
                              is_default: prev.length === 0,
                              active: true,
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إضافة سطر جديد (Add a line)' : 'Add a line'}</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            <tr>
                              <th className="py-2.5 px-3">{isAr ? 'التقسيم (Portion)' : 'Portion'}</th>
                              <th className="py-2.5 px-3">{isAr ? 'اسم الحجم' : 'Size Name'}</th>
                              <th className="py-2.5 px-3">{isAr ? 'الوزن التقديري' : 'Weight Range'}</th>
                              <th className="py-2.5 px-3">{isAr ? 'السعر (ر.س)' : 'Price (SAR)'}</th>
                              <th className="py-2.5 px-3">{isAr ? 'السعرات' : 'Calories'}</th>
                              <th className="py-2.5 px-3">{isAr ? 'ملاحظات / وصف' : 'Subtitle'}</th>
                              <th className="py-2.5 px-2 text-center">{isAr ? 'افتراضي' : 'Default'}</th>
                              <th className="py-2.5 px-2 text-center">{isAr ? 'نشط' : 'Active'}</th>
                              <th className="py-2.5 px-2 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {formSizes.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-8 text-center text-slate-400">
                                  {isAr ? 'لا توجد أحجام مضافة حالياً. اضغط "إضافة سطر جديد" لإضافة حجم.' : 'No sizes configured yet.'}
                                </td>
                              </tr>
                            ) : (
                              formSizes.map((sz, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                  <td className="py-2 px-3">
                                    <select
                                      value={sz.portion_type}
                                      onChange={(e) => {
                                        const val = e.target.value as any;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, portion_type: val } : item))
                                        );
                                      }}
                                      className="px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                                    >
                                      <option value="full">{isAr ? 'كامل' : 'Full'}</option>
                                      <option value="half">{isAr ? 'نصف' : 'Half'}</option>
                                      <option value="quarter">{isAr ? 'ربع' : 'Quarter'}</option>
                                    </select>
                                  </td>

                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={sz.name}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                                        );
                                      }}
                                      placeholder="مثال: كامل كبير"
                                      className="w-28 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                                    />
                                  </td>

                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={sz.weight_range}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, weight_range: val } : item))
                                        );
                                      }}
                                      placeholder="14 - 16 كجم"
                                      className="w-24 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                    />
                                  </td>

                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      min={0}
                                      step="any"
                                      value={sz.price}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                        );
                                      }}
                                      className="w-20 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                                    />
                                  </td>

                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      min={0}
                                      value={sz.calories}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, calories: val } : item))
                                        );
                                      }}
                                      className="w-16 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                                    />
                                  </td>

                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={sz.sub_title}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, sub_title: val } : item))
                                        );
                                      }}
                                      placeholder="يجزئ عقيقة..."
                                      className="w-32 px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                  </td>

                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="radio"
                                      name="defaultSizeRadio"
                                      checked={sz.is_default}
                                      onChange={() => {
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => ({ ...item, is_default: i === idx }))
                                        );
                                      }}
                                      className="size-3.5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    />
                                  </td>

                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={sz.active}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setFormSizes((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, active: checked } : item))
                                        );
                                      }}
                                      className="size-3.5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                                    />
                                  </td>

                                  <td className="py-2 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (sz.id) {
                                          setDeletedSizeIds((prev) => [...prev, sz.id!]);
                                        }
                                        setFormSizes((prev) => prev.filter((_, i) => i !== idx));
                                      }}
                                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-950/20 cursor-pointer disabled:opacity-50 transition"
                  >
                    {savingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {editingProduct
                        ? isAr
                          ? 'حفظ التعديلات والمزامنة مع Odoo'
                          : 'Save & Sync with Odoo'
                        : isAr
                        ? 'إضافة الذبيحة وحفظها في Odoo'
                        : 'Create Product in Odoo'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Quick Stock Modal ──────────────────────────────────────────────────────── */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              {isAr ? 'تعديل المخزون السريع' : 'Quick Stock Update'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingStockProduct.name || editingStockProduct.title}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'الكمية الجديدة بالمخزون' : 'New Stock Quantity'}
              </label>
              <input
                type="number"
                value={newStockQty}
                onChange={(e) => setNewStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingStockProduct(null)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleQuickStockUpdate}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 cursor-pointer shadow-xs flex items-center justify-center"
              >
                {isAr ? 'حفظ المخزون' : 'Save Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────────── */}
      {deleteProductDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black">
                {isAr ? 'تأكيد حذف الذبيحة' : 'Confirm Delete'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في حذف (${deleteProductDialog.name || deleteProductDialog.title}) نهائياً من خادم Odoo؟`
                : `Are you sure you want to permanently delete (${deleteProductDialog.name || deleteProductDialog.title})?`}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeleteProductDialog(null)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deletingProduct}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center"
              >
                {deletingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isAr ? 'تأكيد الحذف' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
